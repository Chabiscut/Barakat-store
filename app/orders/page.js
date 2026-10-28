"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle, AlertCircle, ShoppingBag } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function CustomerOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(session.user.email)}`);
        const json = await res.json();
        if (json.success) {
          setOrders(json.data);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [session]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" };
      case "Shipped":
        return { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" };
      case "Processing":
        return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
      default:
        return { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem 1.25rem 5rem" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        {/* Back Link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--primary)" }}>
            Your Order History
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            {session?.user
              ? `Track your clothing orders associated with ${session.user.email}`
              : "Sign in to view your orders"}
          </p>
        </div>

        {!session?.user ? (
          <div
            style={{
              padding: "3rem 2rem",
              background: "#ffffff",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              Please Sign In
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "380px", margin: "0 auto 1.5rem" }}>
              Sign in with your Google or customer account to view your past orders, tracking IDs, and delivery updates.
            </p>
            <Link href="/auth/signin" className="btn-primary">
              Sign In to Your Account
            </Link>
          </div>
        ) : loading ? (
          <p style={{ color: "#64748b" }}>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div
            style={{
              padding: "3rem 2rem",
              background: "#ffffff",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <Package size={48} color="#94a3b8" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              No orders found
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              You haven&apos;t placed any orders yet. Discover our collection of festive panjabis and luxury sarees.
            </p>
            <Link href="/" className="btn-primary">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.orderStatus);
              return (
                <div
                  key={order._id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.75rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      paddingBottom: "1.25rem",
                      borderBottom: "1px solid #f1f5f9",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: "800", fontSize: "1.05rem" }}>
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          style={{
                            padding: "0.2rem 0.65rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                          }}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--primary)" }}>
                        ৳{order.totalAmount.toLocaleString()}
                      </span>
                      <div style={{ fontSize: "0.78rem", color: order.paymentStatus === "Paid" ? "#059669" : "#d97706", fontWeight: "700" }}>
                        Payment: {order.paymentStatus} ({order.paymentMethod.toUpperCase()})
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ padding: "1.25rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                        <div>
                          <strong>{item.name}</strong>
                          <span style={{ color: "#64748b", marginLeft: "0.5rem" }}>
                            ({item.selectedSize} × {item.quantity})
                          </span>
                        </div>
                        <span style={{ fontWeight: "600" }}>৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.825rem",
                      color: "#64748b",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      Delivery: <strong>{order.customer.address}, {order.customer.city}</strong>
                    </div>
                    <div>
                      TrxID: <strong style={{ fontFamily: "monospace" }}>{order.transactionId}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
