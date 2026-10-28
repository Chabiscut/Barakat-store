"use client";

import React from "react";
import { Truck, ShieldCheck, RefreshCw, CreditCard } from "lucide-react";

export default function FeaturesBanner() {
  const features = [
    {
      icon: Truck,
      title: "Fast Express Delivery",
      description: "Prompt delivery within 24-48 hours inside Dhaka & across Bangladesh.",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic Fabric",
      description: "Directly sourced handloom silk, Egyptian cotton, and verified materials.",
    },
    {
      icon: CreditCard,
      title: "bKash, Nagad & Bank",
      description: "Safe, encrypted mobile banking and authorized bank payment channels.",
    },
    {
      icon: RefreshCw,
      title: "7-Day Hassle-Free Exchange",
      description: "Easy sizing swaps and quality assurance for complete peace of mind.",
    },
  ];

  return (
    <section className="features-banner">
      <div className="container">
        <div className="features-grid">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="feature-box">
                <div className="feature-icon-wrapper">
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="feature-title">{item.title}</h4>
                  <p className="feature-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
