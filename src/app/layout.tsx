import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/contexts/CartContext";
import Footer from "@/components/Footer";

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kjerstisbakeverden.com'),
  title: "Kjerstis Bakeverden",
  description: "Bestill deilige hjemmelagde kaker",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Kjerstis Bakeverden",
    description: "Enklere og oversiktlig bestilling av hjemmelagde kaker",
    images: ['/logo.png'],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Kjerstis Bakeverden",
  image: "https://kjerstisbakeverden.com/logo.png",
  url: "https://kjerstisbakeverden.com",
  telephone: "+4745477878",
  email: "kjerstisbakeverden@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Raufoss",
    addressRegion: "Vestre Toten",
    addressCountry: "NO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={`${caprasimo.variable} ${figtree.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <CartProvider>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}