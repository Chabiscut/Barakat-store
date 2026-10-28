"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, Package, MapPin, CreditCard, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.id;
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const clearedCartOrderId = useRef("");

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        if (json.success) {
          setOrder(json.data);
        }
      } catch (err) {
        console.error("Failed to load order receipt:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (
      ["bkash", "sslcommerz"].includes(order?.paymentMethod) &&
      order.paymentStatus === "Paid" &&
      clearedCartOrderId.current !== order._id
    ) {
      clearedCartOrderId.current = order._id;
      clearCart();
    }
  }, [clearCart, order]);

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#64748b", fontWeight: "600" }}>Loading your receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <h2>Order Not Found</h2>
          <p style={{ color: "#64748b", margin: "0.5rem 0 1.5rem" }}>
            We could not find the specified order reference.
          </p>
          <Link href="/" className="btn-primary">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "3rem 1.25rem 5rem" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Success Alert Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              margin: "0 auto 1.25rem",
              borderRadius: "50%",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)", marginBottom: "0.5rem" }}>
            {order.paymentMethod === "bkash"
              ? order.paymentStatus === "Paid"
                ? "bKash Payment Successful!"
                : order.paymentStatus === "Failed"
                  ? "bKash Payment Not Completed"
                  : "bKash Payment Confirmation Pending"
              : order.paymentMethod === "sslcommerz"
                ? order.paymentStatus === "Paid"
                  ? "Online Payment Successful!"
                  : order.paymentStatus === "Failed"
                    ? "Online Payment Not Completed"
                    : "Online Payment Confirmation Pending"
              : "Order Placed Successfully!"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
            {order.paymentMethod === "bkash"
              ? order.paymentStatus === "Paid"
                ? "Your payment is confirmed and your order has been registered."
                : order.paymentStatus === "Failed"
                  ? "The payment was not completed. Your order has not been marked as paid."
                  : "We are still checking your payment with bKash. Please refresh this page in a moment."
              : order.paymentMethod === "sslcommerz"
                ? order.paymentStatus === "Paid"
                  ? "Your payment has been verified by SSLCommerz and your order is registered."
                  : order.paymentStatus === "Failed"
                    ? "The payment was not completed. Your order has not been marked as paid."
                    : "We are checking your payment with SSLCommerz. Please refresh this page in a moment."
              : "Thank you for shopping at Barakat Store. Your order has been registered in our system and is currently being processed."}
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "#f1f5f9",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: "700",
              color: "var(--primary)",
            }}
          >
            <span>Order ID:</span>
            <span style={{ fontFamily: "monospace", color: "var(--accent)" }}>{order._id}</span>
          </div>
        </div>

        {/* Verification Status & Details */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.25rem", color: "var(--primary)" }}>
            Payment & Verification Status
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              background: order.paymentStatus === "Paid" ? "#ecfdf5" : "#fffbeb",
              borderRadius: "10px",
              border: `1px solid ${order.paymentStatus === "Paid" ? "#a7f3d0" : "#fde68a"}`,
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Clock size={20} color={order.paymentStatus === "Paid" ? "#059669" : "#d97706"} />
              <div>
                <p style={{ fontWeight: "700", fontSize: "0.9rem", color: order.paymentStatus === "Paid" ? "#065f46" : "#92400e" }}>
                  Payment: {order.paymentStatus}
                </p>
                <p style={{ fontSize: "0.8rem", color: order.paymentStatus === "Paid" ? "#047857" : "#b45309" }}>
                  {order.paymentStatus === "Paid"
                    ? "Your payment transaction has been verified by our merchant team."
                    : order.paymentMethod === "cod"
                      ? "Pay the delivery representative in cash when your order arrives."
                      : order.paymentMethod === "bkash"
                        ? order.paymentStatus === "Failed"
                          ? "bKash did not confirm this payment. The order remains unpaid."
                          : "We are checking the payment status with bKash."
                        : order.paymentMethod === "sslcommerz"
                          ? order.paymentStatus === "Failed"
                            ? "SSLCommerz did not confirm this payment. The order remains unpaid."
                            : "We are checking the payment status with SSLCommerz."
                      : "Payment verification in progress. Our team will verify your TrxID shortly."}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.9rem" }}>
            <div>
              <span style={{ color: "#64748b", fontSize: "0.8rem", display: "block" }}>Payment Method</span>
              <strong>
                {order.paymentMethod === "cod"
                  ? "Cash on delivery"
                  : order.paymentMethod === "bkash"
                    ? "bKash"
                    : order.paymentMethod === "sslcommerz"
                      ? "Nagad / bank / card (SSLCommerz)"
                    : order.paymentMethod.toUpperCase()}
              </strong>
            </div>

            {order.paymentMethod !== "cod" && order.transactionId && (
              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem", display: "block" }}>
                  {order.paymentMethod === "bkash"
                    ? "bKash Transaction ID"
                    : order.paymentProvider === "sslcommerz"
                      ? "SSLCommerz Transaction ID"
                      : "Transaction Reference (TrxID)"}
                </span>
                <strong style={{ fontFamily: "monospace", color: "var(--primary)" }}>{order.transactionId}</strong>
              </div>
            )}

            <div>
              <span style={{ color: "#64748b", fontSize: "0.8rem", display: "block" }}>Recipient Name</span>
              <strong>{order.customer.name} ({order.customer.phone})</strong>
            </div>

            <div>
              <span style={{ color: "#64748b", fontSize: "0.8rem", display: "block" }}>Delivery City</span>
              <strong>{order.customer.city}</strong>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "1.25rem", paddingTop: "1.25rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.8rem", display: "block" }}>Full Delivery Address</span>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginTop: "0.25rem" }}>
              {order.customer.address}, {order.customer.city}
            </p>
          </div>
        </div>

        {/* Ordered Items List */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.25rem", color: "var(--primary)" }}>
            Ordered Items ({order.items.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>{item.name}</h4>
                  <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Size: {item.selectedSize} · Quantity: {item.quantity}
                  </p>
                </div>
                <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                  ৳{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "1.25rem", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
              <span>Subtotal</span>
              <span>৳{order.subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? "FREE" : `৳${order.deliveryFee}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: "800", color: "var(--primary)", borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem" }}>
              <span>Grand Total</span>
              <span style={{ color: "var(--accent)" }}>৳{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/orders" className="btn-secondary" style={{ padding: "0.75rem 1.75rem" }}>
            View Order History
          </Link>
          <Link href="/" className="btn-primary" style={{ padding: "0.75rem 1.75rem" }}>
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
