import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConversationProvider } from "@/components/ConversationProvider";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Aura Sales Coach",
  description: "KI-Verkaufsassistent für den telefonischen Vertrieb von Aura Natura",
  applicationName: "Aura Coach",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Aura Coach", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-dvh bg-black font-sans antialiased">
        <ConversationProvider>
          <Header />
          <main className="mx-auto max-w-2xl px-4 pb-44 pt-4">{children}</main>
          <BottomNav />
          <ServiceWorker />
        </ConversationProvider>
      </body>
    </html>
  );
}
