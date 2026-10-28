"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const [isAdded, setIsAdded] = useState(false);
  const productId = product.id || product._id;

  const handleAdd = () => {
    addToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="product-card">
      {/* Product Image & Badges */}
      <Link href={`/products/${productId}`} className="product-image-box" style={{ display: "block" }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
          style={{ objectFit: "cover" }}
        />
        {product.discount && (
          <span className="product-badge-discount">{product.discount}</span>
        )}
        {product.isNew && (
          <span className="product-badge-new">NEW</span>
        )}
      </Link>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-category-meta">
          <span className="product-cat-label">{product.category}</span>
          <div className="product-rating">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating}</span>
            <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>({product.reviewsCount})</span>
          </div>
        </div>

        <Link href={`/products/${productId}`}>
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <p className="product-description">{product.description}</p>

        {/* Sizes Selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="product-options-row">
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600" }}>Sizes:</span>
            {product.sizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className="size-pill"
                style={{
                  background: selectedSize === sz ? "var(--primary)" : "var(--bg-subtle)",
                  color: selectedSize === sz ? "#ffffff" : "var(--text-secondary)",
                  borderColor: selectedSize === sz ? "var(--primary)" : "var(--border-subtle)",
                  cursor: "pointer",
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        )}

        {/* Price & Add to Bag */}
        <div className="product-footer">
          <div className="price-group">
            <span className="price-current">৳{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="price-original">৳{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="add-cart-btn"
            style={{
              background: isAdded ? "var(--success)" : "var(--primary)",
            }}
          >
            {isAdded ? (
              <>
                <Check size={16} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
