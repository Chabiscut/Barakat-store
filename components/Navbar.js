"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Sparkles, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "@/lib/auth-client";
import styles from "./Navbar.module.css";

export default function Navbar({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [failedProfileImage, setFailedProfileImage] = useState("");
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  const navCategories = [
    { label: "All Items", id: "all" },
    { label: "Men's Wear", id: "men" },
    { label: "Women's Collection", id: "women" },
    { label: "Panjabi & Ethnic", id: "panjabi" },
    { label: "Streetwear", id: "casual" },
    { label: "Accessories", id: "accessories" },
  ];

  const handleCategoryClick = (catId) => {
    if (setSelectedCategory) {
      setSelectedCategory(catId);
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setLogoutError("");

    try {
      const result = await signOut();
      if (result?.error) {
        setLogoutError(result.error.message || "Could not sign out. Please try again.");
        return;
      }

      setProfileMenuOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setLogoutError(error.message || "Could not sign out. Please try again.");
    }
  };

  const userName = session?.user?.name?.trim() || "Account";
  const userEmail = session?.user?.email || "";
  const profileImage = session?.user?.image;
  const userInitials = userName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const showProfileImage = profileImage && profileImage !== failedProfileImage;

  return (
    <>
      {/* Top Notification Announcement */}
      <div className="top-banner">
        <span>✨ Welcome to Barakat Store:</span> Free Express Shipping across Bangladesh on orders over ৳1,500 | bKash, Nagad & Bank Supported
      </div>

      {/* Main Header */}
      <header className="header-wrapper">
        <div className="container">
          <nav className="navbar" aria-label="Main Navigation">
            {/* Logo */}
            <Link href="/" className="brand-logo" onClick={() => handleCategoryClick("all")}>
              <div className="brand-icon">
                <Sparkles size={18} />
              </div>
              <span>
                Barakat <span className="brand-highlight">Store</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="nav-links">
              {navCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`nav-link ${selectedCategory === cat.id ? "active" : ""}`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Search Bar */}
            <div className="header-search">
              <span className="search-icon-wrapper">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search panjabi, saree, shirts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Right Action Icons */}
            <div className="header-actions">
              {session?.user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Link href="/orders" className="action-btn" title="View Order History">
                    <span>Orders</span>
                  </Link>

                  {(session.user.role === "admin" || session.user.email?.includes("admin")) && (
                    <Link
                      href="/admin"
                      className="action-btn"
                      style={{ background: "#fef3c7", color: "#92400e", borderColor: "#fde68a" }}
                    >
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className={styles.profile} ref={profileMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoutError("");
                        setProfileMenuOpen((open) => !open);
                      }}
                      className={`action-btn ${styles.profileButton}`}
                      title="Open your account menu"
                      aria-haspopup="menu"
                      aria-expanded={profileMenuOpen}
                      aria-controls="profile-menu"
                    >
                      <span className={styles.avatar} aria-hidden="true">
                        {showProfileImage ? (
                          <Image
                            className={styles.avatarImage}
                            src={profileImage}
                            alt=""
                            width={48}
                            height={48}
                            unoptimized
                            referrerPolicy="no-referrer"
                            onError={() => setFailedProfileImage(profileImage)}
                          />
                        ) : (
                          userInitials || <User size={16} />
                        )}
                      </span>
                      <span>{userName.split(" ")[0]}</span>
                    </button>

                    {profileMenuOpen && (
                      <div className={styles.profileMenu} id="profile-menu" role="menu">
                        <div className={styles.profileDetails}>
                          <span className={`${styles.avatar} ${styles.largeAvatar}`} aria-hidden="true">
                            {showProfileImage ? (
                              <Image
                                className={styles.avatarImage}
                                src={profileImage}
                                alt=""
                                width={48}
                                height={48}
                                unoptimized
                                referrerPolicy="no-referrer"
                                onError={() => setFailedProfileImage(profileImage)}
                              />
                            ) : (
                              userInitials || <User size={20} />
                            )}
                          </span>
                          <div className={styles.profileText}>
                            <strong title={userName}>{userName}</strong>
                            <span title={userEmail}>{userEmail}</span>
                            {session.user.role && (
                              <span className={styles.profileRole}>
                                {session.user.role === "admin" ? "Administrator" : "Customer"}
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href="/orders"
                          className={styles.profileMenuLink}
                          role="menuitem"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          View my orders
                        </Link>

                        {logoutError && (
                          <p className={styles.logoutError} role="alert">
                            {logoutError}
                          </p>
                        )}

                        <button
                          type="button"
                          className={styles.logoutButton}
                          onClick={handleSignOut}
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link href="/auth/signin" className="action-btn" title="Sign In with Google">
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              )}

              <button
                className="action-btn cart-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Shopping Cart with ${cartCount} items`}
              >
                <ShoppingBag size={18} />
                <span>Bag</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>

              {/* Mobile Menu Button */}
              <button
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "#ffffff",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search clothes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: "1rem" }}
              />
            </div>
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0",
                  fontSize: "0.95rem",
                  fontWeight: selectedCategory === cat.id ? "700" : "500",
                  color: selectedCategory === cat.id ? "var(--accent)" : "var(--text-primary)",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
