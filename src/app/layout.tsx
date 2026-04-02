import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/contexts/CartContext";

export const metadata: Metadata = {
  title: "Bakeverden - Hjemmelagde kaker",
  description: "Bestill deilige hjemmelagde kaker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}