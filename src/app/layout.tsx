import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-mplus-rounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EzStampify | スタンプ作りに最適な無料画像加工ツール",
    template: "%s | EzStampify",
  },
  description:
    "登録不要、ずっと無料。背景透過、画像分割、余白カットなど、LINEスタンプ制作に便利な機能が揃ったブラウザ完結型ツールです。プライバシー重視で画像はサーバーに送られません。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://stamp-image-tools.pages.dev"),
  openGraph: {
    title: "EzStampify | スタンプ作りに最適な無料画像加工ツール",
    description:
      "登録不要、ずっと無料。背景透過、画像分割、余白カットなど、LINEスタンプ制作に便利な機能が揃ったブラウザ完結型ツールです。",
    siteName: "EzStampify",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EzStampify | スタンプ作りに最適な無料画像加工ツール",
    description: "登録不要、ずっと無料。背景透過、画像分割など、スタンプ制作に便利な機能が揃ったブラウザ完結型ツールです。",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>

      </head>
      <body className={`${mPlusRounded.variable} font-body antialiased`}>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "EzStampify",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://stamp-image-tools.pages.dev",
              "description": "登録不要、ずっと無料。背景透過、画像分割、余白カットなど、LINEスタンプ制作に便利な機能が揃ったブラウザ完結型ツールです。",
              "inLanguage": "ja"
            },
            {
              "@type": "SoftwareApplication",
              "name": "EzStampify",
              "applicationCategory": "DesignApplication",
              "operatingSystem": "Web Browser",
              "description": "LINEスタンプ制作に最適な無料画像加工ツール。背景透過、画像分割、トリミング、リサイズ機能を搭載。",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY"
              },
              "featureList": [
                "背景透過（Background Removal）",
                "画像分割（Image Splitting）",
                "余白カット（Cropping）",
                "サイズ変更（Resizing）"
              ],
              "screenshot": `${process.env.NEXT_PUBLIC_BASE_URL || "https://stamp-image-tools.pages.dev"}/opengraph-image`,
              "inLanguage": "ja"
            }
          ]
        }} />
        {children}
      </body>
    </html>
  );
}
