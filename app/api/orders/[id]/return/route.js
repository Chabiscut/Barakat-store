import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { getAuth } from "@/lib/auth";
import Order from "@/models/Order";

const RETURN_WINDOW_DAYS = 7;

export async function POST(request, context) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Please sign in to request a return." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { reason } = await request.json();
    const cleanReason = typeof reason === "string" ? reason.trim() : "";

    if (cleanReason.length < 5 || cleanReason.length > 500) {
      return NextResponse.json(
        { success: false, error: "Please explain the return reason in 5 to 500 characters." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    if (order.customer.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: "You cannot request a return for this order." }, { status: 403 });
    }

    if (order.orderStatus !== "Delivered") {
      return NextResponse.json(
        { success: false, error: "Returns can only be requested after delivery." },
        { status: 400 }
      );
    }

    const deliveryDate = order.deliveredAt || order.updatedAt;
    const returnDeadline = new Date(deliveryDate).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() > returnDeadline) {
      return NextResponse.json(
        { success: false, error: `Return requests must be made within ${RETURN_WINDOW_DAYS} days of delivery.` },
        { status: 400 }
      );
    }

    if (order.returnRequest) {
      return NextResponse.json(
        { success: false, error: "A return request has already been submitted for this order." },
        { status: 409 }
      );
    }

    order.returnRequest = {
      reason: cleanReason,
      status: "Requested",
      requestedAt: new Date(),
    };
    await order.save();

    return NextResponse.json(
      { success: true, message: "Return request submitted. Our team will contact you.", data: order.returnRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json(
      { success: false, error: "Could not submit your return request. Please try again." },
      { status: 500 }
    );
  }
}
