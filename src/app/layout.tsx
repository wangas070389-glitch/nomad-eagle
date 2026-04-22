import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // or local font if preferred
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nomad Eagle | Sovereign Finance",
  description: "Aerospace-grade financial telemetry and forecasting for the autonomous household.",
  icons: { icon: "/favicon.ico", apple: "/globe.svg" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nomad Eagle",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

import { Toaster } from "@/components/ui/toaster";

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
        {process.env.NODE_ENV === "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    }, function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                  });
                }
              `,
            }}
          />
        ) : (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister().then(function() {
                        console.log('Legacy ServiceWorker unregistered successfully');
                        window.location.reload(); // Hard refresh once to clear the "poisoned" manifest
                      });
                    }
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
