"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag, CreditCard, Lock } from "lucide-react";
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
  const [transactionId, setTransactionId] = useState("");
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

    if (!transactionId || transactionId.trim().length < 4) {
      setErrorMsg(`Please enter a valid Transaction ID / Reference for your ${paymentMethod.toUpperCase()} payment.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            ...formData,
            name: customerName,
            email: customerEmail,
          },
          items: cart,
          paymentMethod,
          transactionId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to place order.");
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
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
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Instant Mobile Banking</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("nagad")}
                  style={{
                    padding: "1rem 0.5rem",
                    borderRadius: "10px",
                    border: `2px solid ${paymentMethod === "nagad" ? "#f7941d" : "#e2e8f0"}`,
                    background: paymentMethod === "nagad" ? "#fff7ed" : "#ffffff",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ea580c" }}>Nagad</span>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Digital Post Office</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  style={{
                    padding: "1rem 0.5rem",
                    borderRadius: "10px",
                    border: `2px solid ${paymentMethod === "bank" ? "#1e3a8a" : "#e2e8f0"}`,
                    background: paymentMethod === "bank" ? "#eff6ff" : "#ffffff",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1e3a8a" }}>Bank Account</span>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Direct Transfer / Cards</div>
                </button>
              </div>

              {/* Instructions per payment provider */}
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
                    bKash Payment Instructions:
                  </p>
                  <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem", color: "#831843" }}>
                    <li>Open your bKash App or dial *247#</li>
                    <li>Choose <strong>Make Payment</strong> (or Send Money)</li>
                    <li>Enter Merchant Wallet: <strong>01712-345678</strong></li>
                    <li>Enter Amount: <strong>৳{grandTotal.toLocaleString()}</strong></li>
                    <li>Reference: <strong>BARAKAT</strong></li>
                    <li>Enter your PIN and complete transaction</li>
                    <li>Copy your <strong>Transaction ID (TrxID)</strong> and paste below:</li>
                  </ol>
                </div>
              )}

              {paymentMethod === "nagad" && (
                <div
                  style={{
                    padding: "1.25rem",
                    background: "#fff7ed",
                    borderRadius: "10px",
                    border: "1px solid #fed7aa",
                    marginBottom: "1.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <p style={{ fontWeight: "700", color: "#c2410c", marginBottom: "0.5rem" }}>
                    Nagad Payment Instructions:
                  </p>
                  <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem", color: "#9a3412" }}>
                    <li>Open your Nagad App or dial *167#</li>
                    <li>Select <strong>Merchant Pay</strong></li>
                    <li>Enter Merchant Account: <strong>01912-345678</strong></li>
                    <li>Enter Exact Amount: <strong>৳{grandTotal.toLocaleString()}</strong></li>
                    <li>Counter / Ref: <strong>BARAKAT</strong></li>
                    <li>Confirm with your PIN & copy the <strong>Transaction ID</strong>:</li>
                  </ol>
                </div>
              )}

              {paymentMethod === "bank" && (
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
                    Official Bank Account Details:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", color: "#1e3a8a", fontSize: "0.85rem" }}>
                    <div>Bank Name: <strong>The City Bank Ltd.</strong></div>
                    <div>Account Name: <strong>Barakat Store Ltd.</strong></div>
                    <div>Account Number: <strong>150-291-8840001</strong></div>
                    <div>Branch: <strong>Gulshan-2, Dhaka</strong></div>
                    <div>Routing Number: <strong>225275357</strong></div>
                  </div>
                  <p style={{ marginTop: "0.75rem", color: "#1e40af", fontSize: "0.8rem" }}>
                    Make an online transfer, deposit, or BEFTN/NPSB, then paste the <strong>Reference / Slip Number</strong> below.
                  </p>
                </div>
              )}

              {/* Transaction Reference Input */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "700", marginBottom: "0.4rem" }}>
                  {paymentMethod === "bank" ? "Bank Transfer Reference / Deposit Slip *" : `${paymentMethod.toUpperCase()} Transaction ID (TrxID) *`}
                </label>
                <div style={{ position: "relative" }}>
                  <CreditCard size={18} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    required
                    placeholder={paymentMethod === "bank" ? "e.g. REF-CITY-901842" : "e.g. 9J82KS90A"}
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    style={{
                      width: "100%",
                      height: "2.75rem",
                      padding: "0 1rem 0 2.5rem",
                      borderRadius: "8px",
                      border: "2px solid #cbd5e1",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      letterSpacing: "0.05em",
                      outline: "none",
                      textTransform: "uppercase",
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.35rem" }}>
                  Our system verifies transactions before marking orders as paid.
                </p>
              </div>

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
                {submitting ? "Processing Your Order..." : `Confirm & Place Order (৳${grandTotal.toLocaleString()})`}
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
