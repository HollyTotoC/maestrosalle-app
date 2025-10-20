import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import HydrationGuard from "@/components/HydrationGuard";
import ClientToaster from "@/components/ClientToaster";
import DynamicTitle from "@/components/DynamicTitle";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MaestroSalle - Gestion Restaurant",
  description: "Application de gestion quotidienne pour restaurants : clôtures, stocks, disponibilités équipe",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MaestroSalle",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Script inline pour appliquer le thème AVANT le premier render (évite le flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`min-h-[100dvh] ${geistSans.variable} ${geistMono.variable}`}>
        <div className="crt min-h-[100dvh]">
          <ThemeProvider > {/* Injecte la logique du mode sombre */}
            <AuthProvider>
              <DynamicTitle />
              <HydrationGuard>
                {children}
              </HydrationGuard>
              <ClientToaster />
            </AuthProvider>
          </ThemeProvider>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
