"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-brand">
            <h3>
              <Sparkles size={20} color="#fbbf24" />
              <span>Barakat Store</span>
            </h3>
            <p>
              Barakat Store is your trusted destination for premium ethnic Panjabis,
              timeless Sarees, and modern apparel in Bangladesh. Crafted with passion,
              quality fabric, and authentic craftsmanship.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={15} color="#fbbf24" />
                <span>+880 1700-000000 (9 AM - 10 PM)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={15} color="#fbbf24" />
                <span>support@barakatstore.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={15} color="#fbbf24" />
                <span>Gulshan-2, Dhaka - 1212, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>Collections</h4>
            <ul className="footer-links">
              <li><Link href="#shop-catalog" className="footer-link">Festive Panjabi</Link></li>
              <li><Link href="#shop-catalog" className="footer-link">Handloom Sarees</Link></li>
              <li><Link href="#shop-catalog" className="footer-link">Formal Cotton Shirts</Link></li>
              <li><Link href="#shop-catalog" className="footer-link">Heavyweight Hoodies</Link></li>
              <li><Link href="#shop-catalog" className="footer-link">Leather Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul className="footer-links">
              <li><Link href="/orders" className="footer-link">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="footer-link">Shipping & Delivery</Link></li>
              <li><Link href="/return-policy" className="footer-link">Returns & Exchange</Link></li>
              <li><Link href="/size-guide" className="footer-link">Clothing Size Guide</Link></li>
              <li><Link href="/contact" className="footer-link">Contact Support</Link></li>
            </ul>
          </div>

          {/* Payment & Newsletter */}
          <div className="footer-col">
            <h4>Stay Connected</h4>
            <p style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
              Subscribe to get exclusive previews of seasonal launches and special discounts.
            </p>
            <div className="newsletter-box">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Join</button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem", fontWeight: "600" }}>
                SECURE PAYMENT PARTNERS
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className="payment-chip bkash">bKash</span>
                <span className="payment-chip nagad">Nagad</span>
                <span className="payment-chip bank">Bank / Cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Barakat Store. All rights reserved.</p>
          <p style={{ color: "#64748b" }}>
            Designed with Next.js, HTML & CSS. Secure payments powered by bKash, Nagad & Bank.
          </p>
        </div>
      </div>
    </footer>
  );
}
