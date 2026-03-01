import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const siteUrl = "https://nomameshi.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FCFBF9",
};

export const metadata: Metadata = {
  title: "Nomameshi | Visual Graphic Menu",
  description: "Snap a menu photo, get instant Japanese translation with AI-generated food visuals. See the flavor before you order.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Nomameshi — See the Flavor",
    description: "Snap a menu photo, get instant Japanese translation with AI-generated food visuals.",
    url: siteUrl,
    siteName: "Nomameshi",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Nomameshi — See the Flavor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomameshi — See the Flavor",
    description: "Snap a menu photo, get instant Japanese translation with AI-generated food visuals.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nomameshi",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
