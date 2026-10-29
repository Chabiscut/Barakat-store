"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle, Lock, Mail, Sparkles, User } from "lucide-react";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import styles from "./page.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage("Enter your full name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp.email({
        name: cleanName,
        email: cleanEmail,
        password,
        callbackURL: "/",
      });

      if (error) {
        setErrorMessage(error.message || "We couldn't create your account. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error.message || "We couldn't create your account. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        setErrorMessage(
          error.message ||
            "Google sign-up failed. Check that Google OAuth is configured for this site and try again."
        );
        setLoading(false);
      }
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Google sign-up failed. Check that Google OAuth is configured for this site and try again."
      );
      setLoading(false);
    }
  };

  if (session?.user) {
    return (
      <main className={styles.page}>
        <section className={styles.card} aria-live="polite">
          <CheckCircle className={styles.completeIcon} size={42} />
          <h1>You&apos;re already signed in</h1>
          <p>Continue shopping with your Barakat Store account.</p>
          <Link className={styles.primaryLink} href="/">
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link className={styles.backLink} href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to store
        </Link>

        <section className={styles.card}>
          <div className={styles.brandIcon} aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <h1>Create your account</h1>
          <p className={styles.intro}>
            Join Barakat Store to keep track of your orders and shop faster.
          </p>

          {errorMessage && (
            <div className={styles.error} role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            className={styles.googleButton}
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {loading ? "Connecting..." : "Sign up with Google"}
          </button>

          <div className={styles.divider}>
            <span>or create an account with email</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Full name</span>
              <span className={styles.inputWrap}>
                <User size={17} aria-hidden="true" />
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  required
                />
              </span>
            </label>

            <label className={styles.field}>
              <span>Email address</span>
              <span className={styles.inputWrap}>
                <Mail size={17} aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <span className={styles.inputWrap}>
                <Lock size={17} aria-hidden="true" />
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </span>
            </label>

            <label className={styles.field}>
              <span>Confirm password</span>
              <span className={styles.inputWrap}>
                <Lock size={17} aria-hidden="true" />
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </span>
            </label>

            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className={styles.signInPrompt}>
            Already have an account? <Link href="/auth/signin">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
