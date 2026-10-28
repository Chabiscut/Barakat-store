"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    grandTotal,
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 1500;
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <h3>
            <ShoppingBag size={20} color="var(--accent)" />
            <span>Your Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          </h3>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div
          style={{
            padding: "0.75rem 1.5rem",
            background: "#fffbeb",
            borderBottom: "1px solid #fef3c7",
            fontSize: "0.825rem",
            color: "#92400e",
            fontWeight: "500",
          }}
        >
          {amountNeededForFree > 0 ? (
            <span>
              Add <strong>৳{amountNeededForFree.toLocaleString()}</strong> more to get <strong>FREE Express Shipping</strong>!
            </span>
          ) : (
            <span style={{ color: "#065f46" }}>
              🎉 You have qualified for <strong>FREE Express Shipping</strong>!
            </span>
          )}
        </div>

        {/* Items Body */}
        <div className="cart-items-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} color="#94a3b8" />
              <h4>Your bag is empty</h4>
              <p style={{ fontSize: "0.875rem", maxWidth: "260px" }}>
                Explore our festive Panjabis, designer Sarees, and shirts to add items to your wardrobe.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary"
                style={{ marginTop: "1.25rem", padding: "0.65rem 1.5rem" }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="cart-item-card">
                <div className="cart-item-img">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.name}</h4>
                  <p className="cart-item-variant">
                    Size: <strong>{item.selectedSize}</strong> {item.selectedColor && `| Color: ${item.selectedColor}`}
                  </p>

                  <div className="cart-item-price-row">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={{ color: "#94a3b8", cursor: "pointer" }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-line">
              <span>Estimated Delivery</span>
              <span>{deliveryFee === 0 ? "FREE" : `৳${deliveryFee}`}</span>
            </div>
            <div className="cart-summary-line cart-summary-total">
              <span>Grand Total</span>
              <span style={{ color: "var(--accent)" }}>৳{grandTotal.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="checkout-btn"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                marginTop: "0.75rem",
                fontSize: "0.75rem",
                color: "#64748b",
              }}
            >
              <ShieldCheck size={14} color="var(--success)" />
              <span>Accepted: bKash · Nagad · Bank Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
