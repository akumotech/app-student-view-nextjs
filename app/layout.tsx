import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackToTop } from "@/components/back-to-top";
import { Toaster } from "@/components/ui/sonner";
import { GoogleTagManager } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeSight",
  description: "CodeSight is a platform for automated code analysis",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="G-L5K4YNE2R3" />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <BackToTop />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
