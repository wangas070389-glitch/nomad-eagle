import type { Metadata } from "next";
import { Inter } from "next/font/google"; // or local font if preferred
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nomad Eagle | Sovereign Finance",
  description: "Aerospace-grade financial telemetry and forecasting for the autonomous household.",
  icons: { icon: "/favicon.ico" }
};

import { Toaster } from "@/components/ui/toaster";

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
