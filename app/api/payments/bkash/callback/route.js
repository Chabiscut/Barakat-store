import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { bkashRequest } from "@/lib/bkash";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

const EXECUTE_PAYMENT_PATH = "/v2/tokenized-checkout/payment/execute";
const QUERY_PAYMENT_PATH = "/v2/tokenized-checkout/query/payment";

function getReceiptUrl(request, orderId, status) {
  const baseUrl = process.env.BETTER_AUTH_URL || new URL(request.url).origin;
  const receiptUrl = new URL(`/order-success/${orderId}`, baseUrl);
  receiptUrl.searchParams.set("payment", status);
  return receiptUrl;
}

function isMatchingPayment(order, payment) {
  const invoiceNumber = payment.merchantInvoiceNumber || payment.merchantInvoice;
  return (
    payment.transactionStatus === "Completed" &&
    payment.paymentId === order.bkashPaymentId &&
    invoiceNumber === order._id.toString() &&
    Number(payment.amount).toFixed(2) === Number(order.totalAmount).toFixed(2) &&
    payment.currency === "BDT" &&
    typeof payment.trxId === "string" &&
    payment.trxId.length > 0
  );
}

async function saveCompletedPayment(order, payment) {
  order.paymentStatus = "Paid";
  order.transactionId = payment.trxId;
  await order.save();
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const orderId = params.get("orderId");
  const paymentId = params.get("paymentID");
  const status = params.get("status");

  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    return NextResponse.redirect(new URL("/checkout?payment=invalid", request.url));
  }

  try {
    await connectToDatabase();
    const order = await Order.findById(orderId).select("+bkashPaymentId");
    if (!order || order.paymentMethod !== "bkash") {
      return NextResponse.redirect(getReceiptUrl(request, orderId, "not-found"));
    }

    if (order.paymentStatus === "Paid") {
      return NextResponse.redirect(getReceiptUrl(request, orderId, "success"));
    }

    if (!paymentId || paymentId !== order.bkashPaymentId) {
      return NextResponse.redirect(getReceiptUrl(request, orderId, "pending"));
    }

    if (status !== "success") {
      if (status === "failure" || status === "cancel") {
        const paymentStatus = await bkashRequest(QUERY_PAYMENT_PATH, { paymentId });
        if (isMatchingPayment(order, paymentStatus)) {
          await saveCompletedPayment(order, paymentStatus);
          return NextResponse.redirect(getReceiptUrl(request, orderId, "success"));
        }
        if (paymentStatus.transactionStatus === "Initiated") {
          order.paymentStatus = "Failed";
          await order.save();
          return NextResponse.redirect(getReceiptUrl(request, orderId, "failed"));
        }
      }
      return NextResponse.redirect(getReceiptUrl(request, orderId, "pending"));
    }

    let confirmedPayment;
    try {
      confirmedPayment = await bkashRequest(EXECUTE_PAYMENT_PATH, { paymentId });
    } catch (executeError) {
      console.error("bKash execute payment failed; checking payment status:", executeError);
      confirmedPayment = await bkashRequest(QUERY_PAYMENT_PATH, { paymentId });
    }

    if (!isMatchingPayment(order, confirmedPayment)) {
      console.error("bKash payment confirmation did not match the order.", {
        orderId,
        transactionStatus: confirmedPayment.transactionStatus,
        currency: confirmedPayment.currency,
      });
      if (confirmedPayment.transactionStatus === "Initiated") {
        order.paymentStatus = "Failed";
        await order.save();
        return NextResponse.redirect(getReceiptUrl(request, orderId, "failed"));
      }
      return NextResponse.redirect(getReceiptUrl(request, orderId, "pending"));
    }

    await saveCompletedPayment(order, confirmedPayment);
    return NextResponse.redirect(getReceiptUrl(request, orderId, "success"));
  } catch (error) {
    console.error("bKash callback verification error:", error);
    return NextResponse.redirect(getReceiptUrl(request, orderId, "pending"));
  }
}
