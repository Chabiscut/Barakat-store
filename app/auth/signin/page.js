"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { signIn, signUp, useSession } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // If already signed in, redirect to home or admin
  if (session?.user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ maxWidth: "420px", width: "100%", background: "#fff", padding: "2.5rem", borderRadius: "16px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <CheckCircle size={48} color="#059669" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "0.5rem" }}>You are already signed in</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Signed in as <strong>{session.user.email}</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link href="/" className="btn-primary" style={{ textAlign: "center" }}>
              Continue Shopping
            </Link>
            <Link href="/admin" className="btn-secondary" style={{ textAlign: "center" }}>
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in with Google. Make sure Google Client ID is configured in .env.local.");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMsg("Please enter your full name");
          setLoading(false);
          return;
        }
        await signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => router.push("/"), 1200);
      } else {
        await signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        setSuccessMsg("Signed in successfully! Redirecting...");
        setTimeout(() => router.push("/"), 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Check your credentials.");
      setLoading(false);
    }
  };

  const fillQuickAdmin = () => {
    setIsRegister(false);
    setEmail("admin@barakatstore.com");
    setPassword("AdminBarakat2026!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 40%), #f8fafc",
      }}
    >
      {/* Top back link */}
      <div className="container" style={{ paddingTop: "1.5rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            fontWeight: "600",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </Link>
      </div>

      {/* Main Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#ffffff",
            padding: "2.5rem 2rem",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Brand header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                margin: "0 auto 0.75rem",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fbbf24",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.2)",
              }}
            >
              <Sparkles size={22} />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", marginBottom: "0.35rem" }}>
              {isRegister ? "Create Barakat Account" : "Welcome Back"}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
              {isRegister
                ? "Sign up to track orders & enjoy personalized fashion"
                : "Sign in with your Gmail account or email to place orders"}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: "100%",
              height: "2.85rem",
              borderRadius: "9999px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "#334155",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              cursor: "pointer",
              transition: "all 150ms ease",
              marginBottom: "1.5rem",
            }}
          >
            {/* Google G SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "1.25rem 0",
              color: "#94a3b8",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
            <span style={{ padding: "0 0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              or email sign in
            </span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isRegister && (
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Khalid Hossain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      height: "2.6rem",
                      padding: "0 1rem 0 2.5rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "2.6rem",
                    padding: "0 1rem 0 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "2.6rem",
                    padding: "0 1rem 0 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In to Account"}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
            {isRegister ? (
              <span>
                Already have an account?{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  style={{ color: "var(--accent)", fontWeight: "700", textDecoration: "underline" }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account yet?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  style={{ color: "var(--accent)", fontWeight: "700", textDecoration: "underline" }}
                >
                  Register
                </button>
              </span>
            )}
          </div>

          {/* Admin shortcut info banner */}
          <div
            style={{
              marginTop: "1.75rem",
              padding: "0.75rem",
              background: "#f1f5f9",
              borderRadius: "8px",
              border: "1px dashed #cbd5e1",
              fontSize: "0.78rem",
              color: "#475569",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Store Owner / Admin access?</span>
              <button
                type="button"
                onClick={fillQuickAdmin}
                style={{
                  color: "var(--accent)",
                  fontWeight: "700",
                  textDecoration: "underline",
                  fontSize: "0.78rem",
                }}
              >
                Auto-fill Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
