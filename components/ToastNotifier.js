"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ToastNotifier() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="toast-alert" role="status" aria-live="polite">
      <CheckCircle size={18} color="#10b981" />
      <span>{toastMessage}</span>
    </div>
  );
}
