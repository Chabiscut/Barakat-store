"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export default function Hero({ onExploreClick }) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Hero Content */}
          <div className="hero-content">
            <div className="hero-tag">
              <span>✦</span> Curated Festive & Everyday Collection 2026
            </div>
            <h1 className="hero-title">
              Timeless Elegance, <br />
              <span className="text-gold">Tailored Comfort</span> for You.
            </h1>
            <p className="hero-desc">
              Discover premium Bangladeshi craftsmanship and contemporary fashion at Barakat Store.
              From regal festive Panjabis and handloom Sarees to refined everyday wear.
            </p>

            <div className="hero-cta-group">
              <button onClick={onExploreClick} className="btn-primary">
                <span>Shop New Arrivals</span>
                <ArrowRight size={18} />
              </button>
              <button onClick={onExploreClick} className="btn-secondary">
                Explore Categories
              </button>
            </div>

            <div className="hero-features-strip">
              <div className="hero-feature-item">
                <Truck size={18} className="hero-feature-icon" />
                <span>Express Delivery</span>
              </div>
              <div className="hero-feature-item">
                <ShieldCheck size={18} className="hero-feature-icon" />
                <span>100% Authentic Quality</span>
              </div>
              <div className="hero-feature-item">
                <RefreshCw size={18} className="hero-feature-icon" />
                <span>7-Day Return</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="hero-visual-card">
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"
              alt="Barakat Store Premium Festive Collection"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 500px"
              style={{ objectFit: "cover" }}
            />
            <div className="hero-floating-badge">
              <div>
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#fbbf24" }}>
                  Featured Edition
                </p>
                <h4 style={{ fontSize: "1.05rem", fontWeight: "700" }}>Royal Silk Embroidered Panjabi</h4>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", textDecoration: "line-through" }}>৳4,200</span>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#ffffff" }}>৳3,450</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
