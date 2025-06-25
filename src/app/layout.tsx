import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { SearchProvider } from "@/lib/search-context";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParkBus - Book Your Journey",
  description: "Book sustainable bus travel to Canada's most beautiful destinations. Easy online booking, comfortable rides, and unforgettable experiences.",
  keywords: "bus booking, sustainable travel, Canada, national parks, eco-friendly transport",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            <SearchProvider>
              {children}
            </SearchProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
