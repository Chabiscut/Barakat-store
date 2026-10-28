"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryFee, grandTotal, clearCart } = useCart();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Dhaka",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const customerName = formData.name !== "" ? formData.name : (session?.user?.name || "");
  const customerEmail = formData.email !== "" ? formData.email : (session?.user?.email || "");

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Your shopping bag is empty. Please add items before checking out.");
      return;
    }

    if (!session?.user) {
      setErrorMsg("Please sign in with your Google / Email account before completing your order.");
      return;
    }

    if (!customerName || !formData.phone || !formData.address) {
      setErrorMsg("Please fill in your complete delivery name, phone number, and address.");
      return;
    }

    setSubmitting(true);

    try {
      const isHostedCheckout = ["bkash", "sslcommerz"].includes(paymentMethod);
      const checkoutPath = paymentMethod === "bkash"
        ? "/api/payments/bkash"
        : paymentMethod === "sslcommerz"
          ? "/api/payments/sslcommerz"
          : "/api/orders";
      const response = await fetch(checkoutPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            ...formData,
            name: customerName,
            email: customerEmail,
          },
          items: cart,
          ...(!isHostedCheckout ? { paymentMethod } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to place order.");
      }

      if (isHostedCheckout) {
        window.location.assign(data.paymentUrl);
        return;
      }

      clearCart();
      router.push(`/order-success/${data.orderId}`);
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while creating your order.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "5rem" }}>
      {/* Checkout Navbar */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "1rem 0",
          marginBottom: "2rem",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <div style={{ fontWeight: "800", fontSize: "1.25rem", color: "var(--primary)" }}>
            Barakat <span style={{ color: "var(--accent)" }}>Checkout</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#059669", fontWeight: "600" }}>
            <Lock size={14} />
            <span>256-Bit SSL Secured</span>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Auth prompt if not logged in */}
        {!session?.user && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "12px",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <AlertCircle size={22} color="#b45309" />
              <div>
                <p style={{ fontWeight: "700", color: "#92400e", fontSize: "0.95rem" }}>
                  Customer Authentication Required
                </p>
                <p style={{ fontSize: "0.85rem", color: "#b45309" }}>
                  Please sign in with your Google or customer account so your order history is saved.
                </p>
              </div>
            </div>
            <Link
              href="/auth/signin"
              className="btn-primary"
              style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
            >
              Sign In to Continue
            </Link>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#991b1b",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: "2.5rem", alignItems: "start" }}>
          {/* Left Form: Delivery & Payment */}
          <form onSubmit={handleSubmitOrder} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Delivery Address Box */}
            <div
              style={{
                background: "#ffffff",
                padding: "2rem",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "1.25rem", color: "var(--primary)" }}>
                1. Delivery & Contact Information
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient name"
                    value={customerName}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      height: "2.6rem",
                      padding: "0 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                    Phone Number (+880) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01700-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      height: "2.6rem",
                      padding: "0 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="recipient@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    height: "2.6rem",
                    padding: "0 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                  Detailed Street Address (House, Road, Area) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House 42, Road 11, Sector 4, Uttara"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: "100%",
                    height: "2.6rem",
                    padding: "0 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                    District / City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: "100%",
                      height: "2.6rem",
                      padding: "0 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                      outline: "none",
                      background: "#fff",
                    }}
                  >
                    <option value="Dhaka">Dhaka (City & Suburbs)</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                    Special Delivery Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: "100%",
                      height: "2.6rem",
                      padding: "0 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div
              style={{
                background: "#ffffff",
                padding: "2rem",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "1.25rem", color: "var(--primary)" }}>
                2. Select Authorized Payment Method
              </h3>

              {/* Payment selector tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bkash")}
                  style={{
                    padding: "1rem 0.5rem",
                    borderRadius: "10px",
                    border: `2px solid ${paymentMethod === "bkash" ? "#e2136e" : "#e2e8f0"}`,
                    background: paymentMethod === "bkash" ? "#fdf2f8" : "#ffffff",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#e2136e" }}>bKash</span>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Secure checkout on bKash</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("sslcommerz")}
                  style={{
                    padding: "1rem 0.5rem",
                    borderRadius: "10px",
                    border: `2px solid ${paymentMethod === "sslcommerz" ? "#1e3a8a" : "#e2e8f0"}`,
                    background: paymentMethod === "sslcommerz" ? "#eff6ff" : "#ffffff",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1e3a8a" }}>Nagad / Bank / Card</span>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Secure SSLCommerz checkout</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  style={{
                    padding: "1rem 0.5rem",
                    borderRadius: "10px",
                    border: `2px solid ${paymentMethod === "cod" ? "#059669" : "#e2e8f0"}`,
                    background: paymentMethod === "cod" ? "#ecfdf5" : "#ffffff",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#047857" }}>Cash on Delivery</span>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Pay when your order arrives</div>
                </button>
              </div>

              {/* Instructions per payment provider */}
              {paymentMethod === "cod" && (
                <div
                  style={{
                    padding: "1.25rem",
                    background: "#ecfdf5",
                    borderRadius: "10px",
                    border: "1px solid #a7f3d0",
                    marginBottom: "1.5rem",
                    color: "#065f46",
                    fontSize: "0.9rem",
                  }}
                >
                  Pay ৳{grandTotal.toLocaleString()} in cash to the delivery representative when your order arrives. No advance payment or transaction ID is needed.
                </div>
              )}

              {paymentMethod === "bkash" && (
                <div
                  style={{
                    padding: "1.25rem",
                    background: "#fdf2f8",
                    borderRadius: "10px",
                    border: "1px solid #fbcfe8",
                    marginBottom: "1.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <p style={{ fontWeight: "700", color: "#9d174d", marginBottom: "0.5rem" }}>
                    Secure bKash checkout
                  </p>
                  <p style={{ color: "#831843" }}>
                    Continue to bKash to enter your wallet number and complete payment. bKash handles your verification code and PIN securely; Barakat Store never sees or stores them.
                  </p>
                </div>
              )}

              {paymentMethod === "sslcommerz" && (
                <div
                  style={{
                    padding: "1.25rem",
                    background: "#eff6ff",
                    borderRadius: "10px",
                    border: "1px solid #bfdbfe",
                    marginBottom: "1.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <p style={{ fontWeight: "700", color: "#1e40af", marginBottom: "0.5rem" }}>
                    Secure online checkout
                  </p>
                  <p style={{ color: "#1e3a8a" }}>
                    Continue to SSLCommerz and choose Nagad, a bank, or a supported card. Any payment verification and sensitive details stay with the payment provider; Barakat Store does not collect your PIN or card security code.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !session?.user || cart.length === 0}
                className="checkout-btn"
                style={{
                  height: "3.25rem",
                  marginTop: "1.75rem",
                  opacity: (!session?.user || cart.length === 0) ? 0.6 : 1,
                  cursor: (!session?.user || cart.length === 0) ? "not-allowed" : "pointer",
                }}
              >
                {submitting
                  ? paymentMethod === "bkash"
                    ? "Connecting to bKash..."
                    : paymentMethod === "sslcommerz"
                      ? "Connecting to secure checkout..."
                      : "Processing Your Order..."
                  : paymentMethod === "bkash"
                    ? `Continue to bKash (৳${grandTotal.toLocaleString()})`
                    : paymentMethod === "sslcommerz"
                      ? `Continue to secure checkout (৳${grandTotal.toLocaleString()})`
                    : `Confirm & Place Order (৳${grandTotal.toLocaleString()})`}
              </button>
            </div>
          </form>

          {/* Right Column: Order Summary */}
          <div
            style={{
              background: "#ffffff",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              position: "sticky",
              top: "6rem",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "1.25rem", color: "var(--primary)" }}>
              Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
            </h3>

            {cart.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No items in cart</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem", maxHeight: "320px", overflowY: "auto" }}>
                {cart.map((item) => (
                  <div key={item.cartItemId} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ width: "3.5rem", height: "4.25rem", borderRadius: "8px", overflow: "hidden", position: "relative", flexShrink: 0, background: "#f1f5f9" }}>
                      <Image src={item.image} alt={item.name} fill sizes="60px" style={{ objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Size: {item.selectedSize} · Qty: {item.quantity}
                      </p>
                      <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary)", marginTop: "0.15rem" }}>
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>Delivery (All Bangladesh)</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: "#059669" }}>FREE</strong> : `৳${deliveryFee}`}</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.75rem",
                  marginTop: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.15rem",
                  fontWeight: "800",
                  color: "var(--primary)",
                }}
              >
                <span>Total Payable</span>
                <span style={{ color: "var(--accent)" }}>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", padding: "0.75rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#64748b" }}>
              <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span>Orders are packed in Barakat premium protective packaging.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
