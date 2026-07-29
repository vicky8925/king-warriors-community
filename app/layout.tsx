import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { PageLoader } from "@/components/ui/PageLoader";
import "./globals.css";

// Fonts are loaded via <link> tags below (see <head>) rather than
// next/font/google, so the build doesn't require build-time network access
// to Google Fonts. Functionally identical to consumers — same font-display:
// swap behavior, just resolved by the browser at request time.

const SITE_URL = "https://kingwarriors.community";
const SITE_TITLE = "King Warriors Community | Together We Rise. Together We Lead.";
const SITE_DESCRIPTION =
  "King Warriors Community is a premium leadership community built on discipline, mentorship, and collective growth. Join thousands of warriors rising together.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | King Warriors Community",
  },
  description: SITE_DESCRIPTION,
  keywords: ["King Warriors Community", "leadership community", "mentorship", "community events", "discipline"],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "King Warriors Community",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.svg" },
};

const FONT_VARS = {
  "--font-cinzel": "'Cinzel', serif",
  "--font-inter": "'Inter', sans-serif",
  "--font-jetbrains": "'JetBrains Mono', monospace",
} as React.CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={FONT_VARS}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <PageLoader />
        <Navbar />
        <main className="flex-1 pt-16 sm:pt-20">{children}</main>
        <Footer />
        <BackToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(18,18,22,0.95)",
              color: "#F5F1E6",
              border: "1px solid rgba(201,162,39,0.25)",
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
            },
            iconTheme: { primary: "#F0C75E", secondary: "#121216" },
          }}
        />
      </body>
    </html>
  );
}
