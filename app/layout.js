import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ToastNotifier from "@/components/ToastNotifier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Barakat Store | Premium Clothing & Bangladeshi Fashion",
  description:
    "Barakat Store offers premium Bangladeshi ethnic panjabis, designer handloom sarees, corporate shirts, and streetwear. Pay securely via bKash, Nagad, and Bank.",
  keywords: "clothing store, panjabi, saree, bangladesh fashion, barakat store, online shopping dhaka",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
          <ToastNotifier />
        </CartProvider>
      </body>
    </html>
  );
}
