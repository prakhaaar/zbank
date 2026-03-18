import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ZBank — Smarter Banking",
    template: "%s | ZBank",
  },
  description:
    "ZBank is a simple web application that lets you create bank accounts, view balances, transfer money between accounts, and maintain a full transaction history.",
  keywords: [
    "zbank",
    "banking app",
    "money transfer",
    "bank accounts",
    "transaction history",
    "account balance",
    "send money",
    "fintech",
    "real-time tracking",
    "smarter banking",
    "instant transfers",
    "precision banking",
  ],
  authors: [{ name: "ZBank" }],
  creator: "ZBank",
  metadataBase: new URL("https://zbank.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zbank.io",
    title: "ZBank — Smarter Banking",
    description:
      "Create bank accounts, transfer money between accounts, and track every transaction in real time. Smarter banking built for precision.",
    siteName: "ZBank",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZBank — Smarter Banking",
    description:
      "Create bank accounts, transfer money between accounts, and track every transaction in real time.",
    creator: "@zbank",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
