import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Toaster } from "sonner";
import { PWARegistration } from "@/components/common/PWARegistration";
import { OfflineBanner } from "@/components/common/OfflineBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CloudMaster | Google Cloud CDL 資格対策",
    template: "%s | CloudMaster",
  },
  description: "忙しい社会人のための、モバイルフレンドリーなGoogle Cloud Digital Leader (CDL) 学習アプリ。最新の試験傾向に基づいた問題セットで、クラウドスキルを短期間で確実に向上させます。",
  keywords: ["Google Cloud", "CDL", "資格対策", "クイズ", "学習アプリ", "クラウド", "Cloud Digital Leader", "過去問"],
  authors: [{ name: "CloudMaster Team" }],
  creator: "CloudMaster Team",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    title: "CloudMaster | Google Cloud CDL 資格対策",
    description: "忙しい社会人のための、モバイルフレンドリーなGoogle Cloud Digital Leader (CDL) 学習アプリ。",
    siteName: "CloudMaster",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CloudMaster - Google Cloud CDL 資格対策",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudMaster | Google Cloud CDL 資格対策",
    description: "忙しい社会人のための、モバイルフレンドリーなGoogle Cloud Digital Leader (CDL) 学習アプリ。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CloudMaster",
  },
};

export const viewport: Viewport = {
  themeColor: "#4285F4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-qz-blue/20">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWARegistration />
          <OfflineBanner />
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
