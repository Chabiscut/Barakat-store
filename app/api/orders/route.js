import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const query = email ? { "customer.email": email.toLowerCase() } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { customer, items, paymentMethod, transactionId } = body;

    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.email) {
      return NextResponse.json(
        { success: false, error: "Please provide complete delivery details (Name, Phone, Email, Address)." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cannot create order with an empty shopping bag." },
        { status: 400 }
      );
    }

    if (!paymentMethod || !["nagad", "bank", "cod"].includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: paymentMethod === "bkash"
            ? "Please use the secure bKash checkout to pay online."
            : "Please select a valid payment method.",
        },
        { status: 400 }
      );
    }

    if (paymentMethod !== "cod" && (!transactionId || transactionId.trim().length < 4)) {
      return NextResponse.json(
        { success: false, error: "A valid Transaction ID or Bank Reference is required." },
        { status: 400 }
      );
    }

    // Calculate subtotal & delivery
    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const deliveryFee = subtotal >= 1500 ? 0 : 80;
    const totalAmount = subtotal + deliveryFee;

    const newOrder = await Order.create({
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city || "Dhaka",
        notes: customer.notes || "",
      },
      items,
      paymentMethod,
      transactionId: paymentMethod === "cod" ? "" : transactionId.trim().toUpperCase(),
      paymentStatus: "Pending",
      orderStatus: "Pending",
      subtotal,
      deliveryFee,
      totalAmount,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully! We are verifying your payment.",
        orderId: newOrder._id,
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
