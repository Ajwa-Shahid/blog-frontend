import type { Metadata } from "next";
import { Providers } from "./Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bijli Coin",
  description: "A modern blog system built with Next.js and Redux Toolkit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Wrap children with Providers client component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
