import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { getSslcommerzConfig, getStoreBaseUrl } from "@/lib/sslcommerz";
import { resolveOrderItems } from "@/lib/order-checkout";
import Order from "@/models/Order";

const ALLOWED_GATEWAY_HOSTS = new Set([
  "sandbox.sslcommerz.com",
  "securepay.sslcommerz.com",
]);

function getCustomerAddress(customer) {
  return [customer.address.trim(), customer.city || "Dhaka"].join(", ").slice(0, 250);
}

export async function POST(request) {
  let order;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Please sign in before starting checkout." },
        { status: 401 }
      );
    }

    const config = getSslcommerzConfig();
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

    if (totalAmount < 10 || totalAmount > 500000) {
      return NextResponse.json(
        { success: false, error: "SSLCommerz payments must be between ৳10 and ৳500,000." },
        { status: 400 }
      );
    }

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
      paymentMethod: "sslcommerz",
      paymentProvider: "sslcommerz",
      transactionId: "",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      subtotal,
      deliveryFee,
      totalAmount,
    });

    const storeUrl = getStoreBaseUrl(request);
    const callbacks = {
      success_url: new URL("/api/payments/sslcommerz/callback", storeUrl).toString(),
      fail_url: new URL("/api/payments/sslcommerz/callback", storeUrl).toString(),
      cancel_url: new URL("/api/payments/sslcommerz/callback", storeUrl).toString(),
      ipn_url: new URL("/api/payments/sslcommerz/ipn", storeUrl).toString(),
    };

    const params = new URLSearchParams({
      store_id: config.storeId,
      store_passwd: config.storePassword,
      total_amount: totalAmount.toFixed(2),
      currency: "BDT",
      tran_id: order._id.toString(),
      ...callbacks,
      shipping_method: "YES",
      product_name: orderItems.map((item) => item.name).join(", ").slice(0, 250),
      product_category: "Fashion",
      product_profile: "physical-goods",
      cus_name: customer.name.trim().slice(0, 100),
      cus_email: session.user.email.trim().toLowerCase().slice(0, 100),
      cus_add1: getCustomerAddress(customer),
      cus_city: String(customer.city || "Dhaka").slice(0, 50),
      cus_country: "Bangladesh",
      cus_phone: customer.phone.trim().slice(0, 20),
      ship_name: customer.name.trim().slice(0, 100),
      ship_add1: getCustomerAddress(customer),
      ship_city: String(customer.city || "Dhaka").slice(0, 50),
      ship_country: "Bangladesh",
      num_of_item: String(orderItems.reduce((count, item) => count + item.quantity, 0)),
    });

    const response = await fetch(`${config.baseUrl}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });
    const gateway = await response.json().catch(() => null);

    if (!response.ok || gateway?.status !== "SUCCESS" || !gateway?.GatewayPageURL) {
      console.error("SSLCommerz session creation failed.", {
        statusCode: gateway?.failedreason || gateway?.status,
      });
      order.paymentStatus = "Failed";
      await order.save();
      return NextResponse.json(
        {
          success: false,
          error: "Could not start secure checkout. Please try again or choose another payment method.",
        },
        { status: 502 }
      );
    }

    const gatewayUrl = new URL(gateway.GatewayPageURL);
    if (
      gatewayUrl.protocol !== "https:" ||
      !ALLOWED_GATEWAY_HOSTS.has(gatewayUrl.hostname)
    ) {
      order.paymentStatus = "Failed";
      await order.save();
      throw new Error("SSLCommerz returned an invalid checkout URL.");
    }

    order.sslcommerzTranId = order._id.toString();
    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      paymentUrl: gatewayUrl.toString(),
    });
  } catch (error) {
    console.error("SSLCommerz checkout error:", error);
    if (order && order.paymentStatus === "Pending") {
      order.paymentStatus = "Failed";
      await order.save().catch((saveError) => {
        console.error("Could not mark failed SSLCommerz checkout:", saveError);
      });
    }

    const notConfigured = error.message === "SSLCommerz merchant credentials are not configured.";
    return NextResponse.json(
      {
        success: false,
        error: notConfigured
          ? "Secure Nagad and bank checkout is not set up yet. Please choose another payment method."
          : error.message || "Could not start secure checkout. Please try again.",
      },
      { status: notConfigured ? 503 : 400 }
    );
  }
}
