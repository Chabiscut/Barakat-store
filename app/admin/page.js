"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "products"

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  // Search & filter
  const [orderFilter, setOrderFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "men",
    price: "",
    originalPrice: "",
    discount: "",
    stockCount: 15,
    sizes: "M, L, XL",
    colors: "Black, Navy",
    image: "",
    description: "",
  });

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = () => {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
        ]);
        const ordersJson = await ordersRes.json();
        const productsJson = await productsRes.json();
        if (!isCancelled) {
          if (ordersJson.success) setOrders(ordersJson.data);
          if (productsJson.success) setProducts(productsJson.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Admin data fetch error:", err);
        if (!isCancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [reloadTrigger]);

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3500);
  };

  // Update order status or payment status
  const handleUpdateOrder = async (orderId, updates) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("Order updated successfully!");
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, ...updates } : ord))
        );
      }
    } catch {
      showNotification("Failed to update order status.");
    }
  };

  // Open product modal for add or edit
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || "",
        discount: product.discount || "",
        stockCount: product.stockCount || 10,
        sizes: (product.sizes || []).join(", "),
        colors: (product.colors || []).join(", "),
        image: product.image,
        description: product.description,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        category: "men",
        price: "",
        originalPrice: "",
        discount: "",
        stockCount: 15,
        sizes: "M, L, XL",
        colors: "Navy, White",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
        description: "",
      });
    }
    setIsProductModalOpen(true);
  };

  // Save product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : 0,
      discount: productForm.discount,
      stockCount: Number(productForm.stockCount),
      sizes: productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: productForm.colors.split(",").map((c) => c.trim()).filter(Boolean),
      image: productForm.image,
      description: productForm.description,
      inStock: Number(productForm.stockCount) > 0,
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct._id || editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Product updated successfully!");
          fetchData();
          setIsProductModalOpen(false);
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Product added to catalog!");
          fetchData();
          setIsProductModalOpen(false);
        }
      }
    } catch {
      showNotification("Error saving product.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product from the store?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showNotification("Product deleted successfully!");
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      }
    } catch {
      showNotification("Failed to delete product.");
    }
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingPaymentsCount = orders.filter((o) => o.paymentStatus === "Pending").length;

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      orderFilter === "all" ||
      (orderFilter === "pending-payment" && o.paymentStatus === "Pending") ||
      (orderFilter === "paid" && o.paymentStatus === "Paid") ||
      (orderFilter === "delivered" && o.orderStatus === "Delivered");

    const matchesSearch =
      searchTerm.trim() === "" ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm) ||
      o.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "5rem" }}>
      {/* Top Header */}
      <header style={{ background: "#0f172a", color: "#fff", padding: "1.25rem 0", borderBottom: "1px solid #1e293b" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/" style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
              <ArrowLeft size={16} />
              <span>View Storefront</span>
            </Link>
            <span style={{ color: "#475569" }}>|</span>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Barakat Store Admin Center</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={fetchData}
              className="action-btn"
              style={{ background: "#1e293b", color: "#ffffff", border: "1px solid #334155" }}
            >
              <RefreshCw size={14} />
              <span>Refresh Data</span>
            </button>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Logged in as: <strong style={{ color: "#fff" }}>{session?.user?.email || "Administrator"}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ paddingTop: "2rem" }}>
        {actionMsg && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600",
            }}
          >
            <CheckCircle size={18} />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Verified Sales Revenue
            </span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#059669", marginTop: "0.35rem" }}>
              ৳{totalRevenue.toLocaleString()}
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Total Orders
            </span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)", marginTop: "0.35rem" }}>
              {orders.length}
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Pending Payment Verifications
            </span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#d97706", marginTop: "0.35rem" }}>
              {pendingPaymentsCount}
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Active Catalog Products
            </span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)", marginTop: "0.35rem" }}>
              {products.length}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid #e2e8f0", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "1rem",
              fontWeight: "700",
              color: activeTab === "orders" ? "var(--primary)" : "#64748b",
              borderBottom: activeTab === "orders" ? "3px solid var(--accent)" : "3px solid transparent",
              marginBottom: "-2px",
              cursor: "pointer",
            }}
          >
            Customer Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "1rem",
              fontWeight: "700",
              color: activeTab === "products" ? "var(--primary)" : "#64748b",
              borderBottom: activeTab === "products" ? "3px solid var(--accent)" : "3px solid transparent",
              marginBottom: "-2px",
              cursor: "pointer",
            }}
          >
            Manage Products ({products.length})
          </button>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {/* Filter Bar */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["all", "pending-payment", "paid", "delivered"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "9999px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      background: orderFilter === f ? "var(--primary)" : "#f1f5f9",
                      color: orderFilter === f ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {f.replace("-", " ").toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", width: "260px" }}>
                <Search size={15} color="#94a3b8" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Search customer, phone, TrxID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    height: "2.3rem",
                    padding: "0 0.75rem 0 2.2rem",
                    borderRadius: "9999px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                No matching orders found.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                      <th style={{ padding: "0.85rem 1rem" }}>Order / Date</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Customer</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Items</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Amount</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Payment (Method & TrxID)</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Verify Payment</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Order Status</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Return Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem" }}>
                          <strong style={{ fontFamily: "monospace" }}>#{ord._id.slice(-6).toUpperCase()}</strong>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: "700" }}>{ord.customer.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{ord.customer.phone}</div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ord.customer.city}</div>
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                            {ord.items.map((it, i) => (
                              <div key={i}>
                                {it.name} ({it.selectedSize} × {it.quantity})
                              </div>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: "1rem", fontWeight: "700" }}>
                          ৳{ord.totalAmount.toLocaleString()}
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              background: ord.paymentMethod === "bkash" ? "#fdf2f8" : ord.paymentMethod === "nagad" ? "#fff7ed" : ord.paymentMethod === "cod" ? "#ecfdf5" : "#eff6ff",
                              color: ord.paymentMethod === "bkash" ? "#be185d" : ord.paymentMethod === "nagad" ? "#c2410c" : ord.paymentMethod === "cod" ? "#047857" : "#1e40af",
                              textTransform: "uppercase",
                            }}
                          >
                            {ord.paymentMethod === "cod"
                              ? "Cash on delivery"
                              : ord.paymentMethod === "sslcommerz"
                                ? "Nagad / bank / card (SSLCommerz)"
                                : ord.paymentMethod}
                          </span>
                          <div style={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: "700", marginTop: "0.3rem" }}>
                            {ord.transactionId || "No transaction ID"}
                          </div>
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) => handleUpdateOrder(ord._id, { paymentStatus: e.target.value })}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              background: ord.paymentStatus === "Paid" ? "#ecfdf5" : ord.paymentStatus === "Failed" ? "#fef2f2" : "#fffbeb",
                              color: ord.paymentStatus === "Paid" ? "#065f46" : ord.paymentStatus === "Failed" ? "#991b1b" : "#92400e",
                              border: "1px solid #cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">✓ Mark Paid</option>
                            <option value="Failed">✗ Failed</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateOrder(ord._id, { orderStatus: e.target.value })}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td style={{ padding: "1rem", minWidth: "180px" }}>
                          {ord.returnRequest ? (
                            <>
                              <strong>{ord.returnRequest.status}</strong>
                              <div style={{ marginTop: "0.3rem", maxWidth: "240px", color: "#64748b", fontSize: "0.78rem" }}>
                                {ord.returnRequest.reason}
                              </div>
                              <div style={{ marginTop: "0.25rem", color: "#94a3b8", fontSize: "0.72rem" }}>
                                {new Date(ord.returnRequest.requestedAt).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === "products" && (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>
                Clothing Catalog Products
              </h3>

              <button
                onClick={() => openProductModal()}
                className="btn-primary"
                style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
              >
                <Plus size={16} />
                <span>Add New Product</span>
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "0.85rem 1rem" }}>Product</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Category</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Price (BDT)</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Stock Count</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Sizes Available</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => {
                    const prodId = prod._id || prod.id;
                    return (
                      <tr key={prodId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "2.75rem", height: "3.25rem", borderRadius: "6px", overflow: "hidden", position: "relative", background: "#f1f5f9", flexShrink: 0 }}>
                            <Image src={prod.image} alt={prod.name} fill sizes="50px" style={{ objectFit: "cover" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: "700" }}>{prod.name}</div>
                            {prod.discount && (
                              <span style={{ fontSize: "0.7rem", color: "#b45309", fontWeight: "700" }}>{prod.discount}</span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: "1rem", textTransform: "capitalize" }}>
                          {prod.category}
                        </td>

                        <td style={{ padding: "1rem", fontWeight: "700" }}>
                          ৳{prod.price.toLocaleString()}
                          {prod.originalPrice > 0 && (
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "line-through", marginLeft: "0.35rem" }}>
                              ৳{prod.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              background: (prod.stockCount || 10) > 5 ? "#ecfdf5" : "#fef2f2",
                              color: (prod.stockCount || 10) > 5 ? "#065f46" : "#991b1b",
                            }}
                          >
                            {prod.stockCount || 10} In Stock
                          </span>
                        </td>

                        <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#64748b" }}>
                          {(prod.sizes || ["Standard"]).join(", ")}
                        </td>

                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => openProductModal(prod)}
                              style={{
                                padding: "0.4rem",
                                borderRadius: "6px",
                                background: "#f1f5f9",
                                color: "#334155",
                                cursor: "pointer",
                              }}
                              title="Edit product"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prodId)}
                              style={{
                                padding: "0.4rem",
                                borderRadius: "6px",
                                background: "#fef2f2",
                                color: "#991b1b",
                                cursor: "pointer",
                              }}
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "580px",
              borderRadius: "16px",
              padding: "2rem",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary)" }}>
                {editingProduct ? "Edit Clothing Product" : "Add New Clothing Product"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Silk Festive Panjabi"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff" }}
                  >
                    <option value="panjabi">Panjabi & Ethnic</option>
                    <option value="men">Men&apos;s Wear</option>
                    <option value="women">Women&apos;s Collection</option>
                    <option value="casual">Streetwear & Hoodies</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                    Selling Price (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="3450"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="4200"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                    Discount Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="18% OFF"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                    Inventory Stock Count *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stockCount}
                    onChange={(e) => setProductForm({ ...productForm, stockCount: e.target.value })}
                    style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                    Sizes (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                  Image URL (Unsplash or Cloudinary) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  style={{ width: "100%", height: "2.5rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed fabric, cut, and care instructions..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }}>
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
