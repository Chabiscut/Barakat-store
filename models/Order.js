import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedSize: { type: String, default: "Standard" },
  selectedColor: { type: String, default: "Standard" },
  image: { type: String, default: "" },
});

const ReturnRequestSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Completed"],
      default: "Requested",
    },
    requestedAt: { type: Date, default: Date.now },
    adminNote: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: { type: String, default: "" },
    },
    items: [OrderItemSchema],
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "bank", "sslcommerz", "cod"],
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ["manual", "bkash", "sslcommerz"],
      default: "manual",
    },
    transactionId: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    bkashPaymentId: { type: String, default: "", select: false },
    sslcommerzTranId: { type: String, default: "", select: false },
    sslcommerzValidationId: { type: String, default: "", select: false },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    deliveredAt: { type: Date, default: null },
    returnRequest: { type: ReturnRequestSchema, default: null },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const cachedOrderModel = mongoose.models.Order;
const cachedPaymentMethod = cachedOrderModel?.schema.path("paymentMethod");
const cachedTransactionIdRequired = cachedOrderModel?.schema.path("transactionId").options.required;
const cachedTransactionIdOptional =
  cachedTransactionIdRequired === false ||
  (typeof cachedTransactionIdRequired === "function" &&
    cachedTransactionIdRequired.call({ paymentMethod: "cod" }) === false &&
    cachedTransactionIdRequired.call({ paymentMethod: "bkash" }) === false);
const cachedSchemaSupportsCod =
  cachedPaymentMethod?.enumValues.includes("cod") &&
  cachedPaymentMethod.enumValues.includes("sslcommerz") &&
  cachedTransactionIdOptional &&
  cachedOrderModel.schema.path("bkashPaymentId") &&
  cachedOrderModel.schema.path("sslcommerzTranId") &&
  cachedOrderModel.schema.path("sslcommerzValidationId");

if (cachedOrderModel && !cachedSchemaSupportsCod) {
  mongoose.deleteModel("Order");
}

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
