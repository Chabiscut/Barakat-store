"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Plus,
  Minus,
  Check,
  CreditCard,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { initialProducts } from "@/data/products";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadProduct() {
      if (!productId) return;

      // 1. Check local catalog first
      const foundInMock = initialProducts.find((p) => p.id === productId || p._id === productId);
      if (foundInMock) {
        if (!isCancelled) {
          setProduct(foundInMock);
          setSelectedSize(foundInMock.sizes?.[0] || "Standard");
          setSelectedColor(foundInMock.colors?.[0] || "Standard");
          setLoading(false);
        }
        return;
      }

      // 2. Fetch from MongoDB API
      try {
        const res = await fetch(`/api/products/${productId}`);
        const json = await res.json();
        if (!isCancelled && json.success && json.data) {
          const item = json.data;
          setProduct(item);
          setSelectedSize(item.sizes?.[0] || "Standard");
          setSelectedColor(item.colors?.[0] || "Standard");
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#64748b", fontWeight: "600" }}>Loading luxury clothing details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "420px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>Product Not Found</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              The clothing item you are looking for is either unavailable or has been removed from the catalog.
            </p>
            <Link href="/" className="btn-primary">
              Return to Catalog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar />

      <main style={{ flex: 1, paddingBottom: "5rem" }}>
        <div className="container" style={{ paddingTop: "1.5rem" }}>
          {/* Breadcrumb navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              <ArrowLeft size={14} />
              <span>Catalog</span>
            </Link>
            <span>/</span>
            <span style={{ textTransform: "capitalize" }}>{product.category}</span>
            <span>/</span>
            <span style={{ color: "var(--primary)", fontWeight: "700" }}>{product.name}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", alignItems: "start" }}>
            {/* Left: Product Imagery Showcase */}
            <div
              style={{
                position: "relative",
                aspectRatio: "1/1.2",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#f1f5f9",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                border: "1px solid #e2e8f0",
              }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
                style={{ objectFit: "cover" }}
              />
              {product.discount && (
                <span className="product-badge-discount" style={{ top: "1.25rem", left: "1.25rem", fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}>
                  {product.discount}
                </span>
              )}
            </div>

            {/* Right: Product Details & Selection */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  {product.category}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>{product.rating}</span>
                  <span style={{ color: "#94a3b8" }}>({product.reviewsCount} customer reviews)</span>
                </div>
              </div>

              <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--primary)", lineHeight: "1.2", marginBottom: "1rem" }}>
                {product.name}
              </h1>

              {/* Price Banner */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--primary)" }}>
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice > 0 && (
                  <span style={{ fontSize: "1.15rem", color: "#94a3b8", textDecoration: "line-through" }}>
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span style={{ fontSize: "0.8rem", color: "#059669", fontWeight: "700", background: "#ecfdf5", padding: "0.25rem 0.65rem", borderRadius: "9999px" }}>
                  In Stock & Ready for Delivery
                </span>
              </div>

              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#475569", marginBottom: "1.75rem" }}>
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "700", marginBottom: "0.6rem" }}>
                    Select Size: <strong style={{ color: "var(--accent)" }}>{selectedSize}</strong>
                  </label>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          minWidth: "3.25rem",
                          height: "2.75rem",
                          padding: "0 0.85rem",
                          borderRadius: "8px",
                          border: `2px solid ${selectedSize === sz ? "var(--primary)" : "#cbd5e1"}`,
                          background: selectedSize === sz ? "var(--primary)" : "#ffffff",
                          color: selectedSize === sz ? "#ffffff" : "var(--text-primary)",
                          fontWeight: "700",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 150ms ease",
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Selector */}
              {product.colors && product.colors.length > 0 && (
                <div style={{ marginBottom: "1.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "700", marginBottom: "0.6rem" }}>
                    Available Colors: <strong style={{ color: "var(--accent)" }}>{selectedColor}</strong>
                  </label>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    {product.colors.map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "9999px",
                          border: `2px solid ${selectedColor === clr ? "var(--accent)" : "#cbd5e1"}`,
                          background: selectedColor === clr ? "var(--accent-soft)" : "#ffffff",
                          color: selectedColor === clr ? "var(--accent)" : "var(--text-primary)",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker & Add to Bag CTA */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
                <div className="qty-control" style={{ height: "3rem", padding: "0 0.35rem" }}>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: "2.25rem", height: "2.25rem" }}
                  >
                    <Minus size={15} />
                  </button>
                  <span className="qty-number" style={{ fontSize: "1rem", padding: "0 0.85rem" }}>
                    {quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ width: "2.25rem", height: "2.25rem" }}
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    height: "3rem",
                    fontSize: "1rem",
                    background: isAdded ? "var(--success)" : "var(--primary)",
                  }}
                >
                  {isAdded ? (
                    <>
                      <Check size={18} />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Shopping Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="btn-secondary"
                  style={{
                    height: "3rem",
                    padding: "0 1.5rem",
                    fontSize: "1rem",
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                    fontWeight: "700",
                  }}
                >
                  Buy Now
                </button>
              </div>

              {/* Delivery & Authentic Value Props */}
              <div
                style={{
                  padding: "1.25rem",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
                  <Truck size={18} color="var(--accent)" />
                  <span>
                    <strong>Fast Express Delivery:</strong> 24-48 hours inside Dhaka & all 64 districts.
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
                  <ShieldCheck size={18} color="var(--accent)" />
                  <span>
                    <strong>100% Authentic Quality:</strong> Premium materials with verified handloom tailoring.
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
                  <CreditCard size={18} color="var(--accent)" />
                  <span>
                    <strong>Payment Methods:</strong> bKash, Nagad, and Bank transfer supported at checkout.
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
                  <RefreshCw size={18} color="var(--accent)" />
                  <span>
                    <strong>7 Days Easy Exchange:</strong> Hassle-free size replacement guarantee.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
