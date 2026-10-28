import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request, context) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const { orderStatus, paymentStatus } = await request.json();

    const updateFields = {};
    if (orderStatus) {
      updateFields.orderStatus = orderStatus;
      if (orderStatus === "Delivered") {
        const order = await Order.findById(id);
        if (order && order.orderStatus !== "Delivered") {
          updateFields.deliveredAt = new Date();
        }
      }
    }
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const updated = await Order.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully!",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
