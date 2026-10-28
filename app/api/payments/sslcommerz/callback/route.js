import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getStoreBaseUrl, validateSslcommerzPayment } from "@/lib/sslcommerz";

function getOrderId(tranId) {
  return tranId && mongoose.isValidObjectId(tranId) ? tranId : "";
}

function getReceiptUrl(storeUrl, orderId, status) {
  const receipt = new URL(orderId ? `/order-success/${orderId}` : "/checkout", storeUrl);
  receipt.searchParams.set("payment", status);
  return receipt;
}

export async function POST(request) {
  let storeUrl;
  let orderId = "";
  try {
    storeUrl = getStoreBaseUrl(request);
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    orderId = getOrderId(String(fields.tran_id || ""));

    if (fields.status !== "SUCCESS" || !orderId) {
      return NextResponse.redirect(
        getReceiptUrl(storeUrl, orderId, fields.status === "CANCELLED" ? "cancelled" : "failed"),
        303
      );
    }

    const result = await validateSslcommerzPayment(fields);
    return NextResponse.redirect(
      getReceiptUrl(storeUrl, orderId, result.valid ? "success" : "pending"),
      303
    );
  } catch (error) {
    console.error("SSLCommerz callback verification error:", error);
    storeUrl ||= process.env.BETTER_AUTH_URL || new URL(request.url).origin;
    return NextResponse.redirect(getReceiptUrl(storeUrl, orderId, "pending"), 303);
  }
}
