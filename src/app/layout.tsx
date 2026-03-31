import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bakeverden - Hjemmelagde kaker",
  description: "Bestill hjemmelagde kaker til enhver anledning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}
