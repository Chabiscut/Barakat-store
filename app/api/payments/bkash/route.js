import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bkashRequest, getBkashConfig } from "@/lib/bkash";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { resolveOrderItems } from "@/lib/order-checkout";

const CREATE_PAYMENT_PATH = "/v2/tokenized-checkout/payment/create";
const ALLOWED_CHECKOUT_HOSTS = new Set([
  "payment.bkash.com",
  "sandbox.payment.bkash.com",
]);

function getCallbackBaseUrl(request) {
  const baseUrl = process.env.BETTER_AUTH_URL || new URL(request.url).origin;
  const callbackUrl = new URL(baseUrl);
  if (
    callbackUrl.protocol !== "https:" &&
    callbackUrl.hostname !== "localhost" &&
    callbackUrl.hostname !== "127.0.0.1"
  ) {
    throw new Error("The bKash callback URL must use HTTPS.");
  }
  return callbackUrl.origin;
}

export async function POST(request) {
  let order;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Please sign in before paying with bKash." },
        { status: 401 }
      );
    }

    const config = getBkashConfig();
    const body = await request.json();
    const { customer, items } = body;

    if (
      typeof customer?.name !== "string" ||
      !customer.name.trim() ||
      typeof customer?.phone !== "string" ||
      !customer.phone.trim() ||
      typeof customer?.address !== "string" ||
      !customer.address.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Please provide your name, phone number, and delivery address." },
        { status: 400 }
      );
    }

    const orderItems = await resolveOrderItems(items);
    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const deliveryFee = subtotal >= 1500 ? 0 : 80;
    const totalAmount = subtotal + deliveryFee;

    await connectToDatabase();
    order = await Order.create({
      customer: {
        name: customer.name.trim(),
        email: session.user.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city || "Dhaka",
        notes: typeof customer.notes === "string" ? customer.notes.trim() : "",
      },
      items: orderItems,
      paymentMethod: "bkash",
      paymentProvider: "bkash",
      transactionId: "",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      subtotal,
      deliveryFee,
      totalAmount,
    });

    const callbackURL = new URL("/api/payments/bkash/callback", getCallbackBaseUrl(request));
    callbackURL.searchParams.set("orderId", order._id.toString());

    const payment = await bkashRequest(CREATE_PAYMENT_PATH, {
      payerReference: order._id.toString(),
      callbackURL: callbackURL.toString(),
      amount: totalAmount.toFixed(2),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: order._id.toString(),
    });

    if (!payment.paymentId || !payment.bkashURL) {
      throw new Error("bKash returned an invalid checkout response.");
    }

    const checkoutUrl = new URL(payment.bkashURL);
    if (
      checkoutUrl.protocol !== "https:" ||
      !ALLOWED_CHECKOUT_HOSTS.has(checkoutUrl.hostname)
    ) {
      throw new Error("bKash returned an invalid checkout URL.");
    }

    order.bkashPaymentId = payment.paymentId;
    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      paymentUrl: checkoutUrl.toString(),
    });
  } catch (error) {
    console.error("bKash checkout error:", error);
    if (order && order.paymentStatus === "Pending" && !order.bkashPaymentId) {
      order.paymentStatus = "Failed";
      await order.save().catch((saveError) => {
        console.error("Could not mark failed bKash checkout:", saveError);
      });
    }
    const notConfigured = error.message === "bKash merchant credentials are not configured.";
    return NextResponse.json(
      {
        success: false,
        error: notConfigured
          ? "bKash online payments are not set up yet. Please choose another payment method."
          : error.message || "Could not start bKash checkout. Please try again.",
      },
      { status: notConfigured ? 503 : 400 }
    );
  }
}
