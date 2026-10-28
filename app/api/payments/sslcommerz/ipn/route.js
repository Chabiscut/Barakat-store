import { NextResponse } from "next/server";
import { validateSslcommerzPayment } from "@/lib/sslcommerz";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    const result = await validateSslcommerzPayment(fields);
    if (!result.valid) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SSLCommerz IPN verification error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
