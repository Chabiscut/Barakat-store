"use client";

import React from "react";
import { categories } from "@/data/products";

export default function CategoryFilter({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="category-section" id="shop-catalog">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Exquisite Catalog</p>
          <h2 className="section-title">Explore by Wardrobe Category</h2>
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-tab-btn ${selectedCategory === cat.id ? "active" : ""}`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
