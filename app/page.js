"use client";

import React, { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import FeaturesBanner from "@/components/FeaturesBanner";
import Footer from "@/components/Footer";
import { initialProducts } from "@/data/products";
import { Filter, Search } from "lucide-react";

export default function Home() {
  const [productsList, setProductsList] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real-time products from MongoDB Atlas
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          // Normalize _id to id if needed
          const normalized = json.data.map((item) => ({
            ...item,
            id: item._id || item.id,
          }));
          // Merge with any showcase items not yet in db
          const existingNames = new Set(normalized.map((p) => p.name));
          const remainingShowcase = initialProducts.filter((p) => !existingNames.has(p.name));
          setProductsList([...normalized, ...remainingShowcase]);
        }
      } catch (err) {
        console.error("Failed to load products from API:", err);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [productsList, selectedCategory, searchQuery]);

  const scrollToCatalog = () => {
    const el = document.getElementById("shop-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Hero Section */}
      <Hero onExploreClick={scrollToCatalog} />

      {/* Catalog & Filter Section */}
      <main style={{ flex: 1 }}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="container">
          {/* Active Filter Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--border-subtle)",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={16} color="var(--accent)" />
              <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                Showing <strong>{filteredProducts.length}</strong> clothing items
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
                {searchQuery && ` for "${searchQuery}"`}
              </span>
            </div>

            {(selectedCategory !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                style={{
                  fontSize: "0.85rem",
                  color: "var(--accent)",
                  fontWeight: "600",
                  textDecoration: "underline",
                }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "4rem",
              }}
            >
              <div
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  margin: "0 auto 1rem",
                  borderRadius: "50%",
                  background: "var(--bg-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                }}
              >
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                No clothes found
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                We couldn&apos;t find any items matching &quot;{searchQuery}&quot;. Try searching for something else or clearing filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="btn-primary"
              >
                View All Products
              </button>
            </div>
          )}
        </div>

        {/* Customer Value Guarantees Strip */}
        <FeaturesBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
