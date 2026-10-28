import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

const SANDBOX_URL = "https://sandbox.sslcommerz.com";
const PRODUCTION_URL = "https://securepay.sslcommerz.com";

export function getSslcommerzConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

  if (!storeId || !storePassword) {
    throw new Error("SSLCommerz merchant credentials are not configured.");
  }

  return {
    storeId,
    storePassword,
    baseUrl: isSandbox ? SANDBOX_URL : PRODUCTION_URL,
  };
}

export function getStoreBaseUrl(request) {
  const baseUrl = process.env.BETTER_AUTH_URL || new URL(request.url).origin;
  const storeUrl = new URL(baseUrl);
  if (
    storeUrl.protocol !== "https:" &&
    storeUrl.hostname !== "localhost" &&
    storeUrl.hostname !== "127.0.0.1"
  ) {
    throw new Error("Payment return URLs must use HTTPS.");
  }
  return storeUrl.origin;
}

export async function validateSslcommerzPayment(fields) {
  const { storeId, storePassword, baseUrl } = getSslcommerzConfig();
  const valId = String(fields.val_id || "");
  const tranId = String(fields.tran_id || "");

  if (!valId || !tranId || tranId.length > 30) {
    return { valid: false, order: null };
  }

  if (!mongoose.isValidObjectId(tranId)) {
    return { valid: false, order: null };
  }

  await connectToDatabase();
  const order = await Order.findOne({
    _id: tranId,
    paymentMethod: "sslcommerz",
    paymentProvider: "sslcommerz",
  }).select("+sslcommerzTranId +sslcommerzValidationId");

  if (
    !order ||
    order.sslcommerzTranId !== tranId ||
    order.paymentStatus === "Failed" ||
    order.paymentStatus === "Refunded"
  ) {
    return { valid: false, order };
  }

  const validationUrl = new URL("/validator/api/validationserverAPI.php", baseUrl);
  validationUrl.searchParams.set("val_id", valId);
  validationUrl.searchParams.set("store_id", storeId);
  validationUrl.searchParams.set("store_passwd", storePassword);
  validationUrl.searchParams.set("format", "json");

  const response = await fetch(validationUrl, {
    method: "GET",
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });
  const payment = await response.json().catch(() => null);

  const valid =
    response.ok &&
    payment &&
    ["VALID", "VALIDATED"].includes(payment.status) &&
    payment.val_id === valId &&
    payment.tran_id === tranId &&
    payment.store_id === storeId &&
    payment.currency === "BDT" &&
    Number(payment.amount).toFixed(2) === Number(order.totalAmount).toFixed(2) &&
    Number(payment.risk_level || 0) === 0;

  if (!valid) {
    return { valid: false, order };
  }

  if (order.paymentStatus !== "Paid") {
    order.paymentStatus = "Paid";
    order.transactionId = tranId;
    order.sslcommerzValidationId = valId;
    await order.save();
  }

  return { valid: true, order };
}
