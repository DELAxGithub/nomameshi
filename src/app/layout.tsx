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

const siteUrl = "https://menumenu-three.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomameshi — See the Flavor",
    description: "Snap a menu photo, get instant Japanese translation with AI-generated food visuals.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
      <body className={`${inter.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
