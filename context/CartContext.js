"use client";

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from "react";

const CartContext = createContext(null);
const EMPTY_CART = [];
let cartSnapshot = EMPTY_CART;
const cartListeners = new Set();

function subscribeToCart(listener) {
  cartListeners.add(listener);
  return () => cartListeners.delete(listener);
}

function getCartSnapshot() {
  return cartSnapshot;
}

function getServerCartSnapshot() {
  return EMPTY_CART;
}

function updateCartSnapshot(nextCart, persist = true) {
  cartSnapshot = nextCart;

  if (persist) {
    try {
      localStorage.setItem("barakat_cart", JSON.stringify(nextCart));
    } catch {
      // Ignore localStorage write errors
    }
  }

  cartListeners.forEach((listener) => listener());
}

export function CartProvider({ children }) {
  const cart = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("barakat_cart");
      const parsedCart = stored ? JSON.parse(stored) : EMPTY_CART;
      updateCartSnapshot(Array.isArray(parsedCart) ? parsedCart : EMPTY_CART, false);
    } catch {
      updateCartSnapshot(EMPTY_CART, false);
    }
  }, []);

  const setCart = (update) => {
    const nextCart = typeof update === "function" ? update(cartSnapshot) : update;
    updateCartSnapshot(nextCart);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product, selectedSize = null, selectedColor = null, quantity = 1) => {
    const size = selectedSize || product.sizes?.[0] || "Standard";
    const color = selectedColor || product.colors?.[0] || "Standard";
    const cartItemId = `${product.id}-${size}-${color}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prevCart,
        {
          ...product,
          cartItemId,
          selectedSize: size,
          selectedColor: color,
          quantity,
        },
      ];
    });

    showToast(`Added "${product.name}" to your bag!`);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast("Item removed from your cart");
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 1500 || subtotal === 0 ? 0 : 80;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        grandTotal,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
