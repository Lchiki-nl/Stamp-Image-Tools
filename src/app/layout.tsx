import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-mplus-rounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EzStampify | LINEスタンプ作りに最適な無料画像加工ツール",
    template: "%s | EzStampify",
  },
  keywords: [
    "LINEスタンプ",
    "画像分割",
    "切り出し",
    "切り抜き",
    "分割",
    "透過",
    "背景透過",
    "サイズ変更",
    "リサイズ",
    "タブ画像",
    "メイン画像",
    "一括",
    "イラスト分割",
    "LINE Emoji",
    "無料",
    "登録不要",
    "iPhone",
    "Android",
    "Mac",
    "PC",
    "iPad",
  ],
  description:
    "登録不要、ずっと無料。LINEスタンプ制作に必須の背景透過、イラスト分割、リサイズ、タブ画像・メイン画像生成を一括で行えるブラウザ完結型ツールです。iPhone・Android・Mac・PCすべてに対応。",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://stamp-image-tools.pages.dev"
  ),
  openGraph: {
    title: "EzStampify | LINEスタンプ作りに最適な無料画像加工ツール",
    description:
      "登録不要、ずっと無料。LINEスタンプ制作に必須の背景透過、イラスト分割、リサイズ、タブ画像・メイン画像生成を一括で行えるブラウザ完結型ツールです。",
    siteName: "EzStampify",
    locale: "ja_JP",
    type: "website",
    images: ["/opengraph-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "EzStampify | LINEスタンプ作りに最適な無料画像加工ツール",
    description:
      "登録不要、ずっと無料。LINEスタンプ制作に必須の背景透過、イラスト分割、リサイズ、タブ画像・メイン画像生成を一括で行えるブラウザ完結型ツールです。",
    images: ["/opengraph-image.jpg"],
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
        {/* Google Fonts for Canvas - loaded via globals.css now to fix Next.js warning */}
      </head>
      <body className={`${mPlusRounded.variable} font-body antialiased`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                name: "EzStampify",
                url:
                  process.env.NEXT_PUBLIC_BASE_URL ||
                  "https://stamp-image-tools.pages.dev",
                description:
                  "登録不要、ずっと無料。LINEスタンプ制作に必須の背景透過、イラスト分割、リサイズ、タブ画像・メイン画像生成を一括で行えるブラウザ完結型ツールです。iPhone・Android・Mac・PCすべてに対応。",
                inLanguage: "ja",
              },
              {
                "@type": "SoftwareApplication",
                name: "EzStampify",
                applicationCategory: "DesignApplication",
                operatingSystem: "Web Browser",
                description:
                  "LINEスタンプ制作に最適な無料画像加工ツール。背景透過、画像分割、トリミング、リサイズ機能を搭載。",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "JPY",
                },
                featureList: [
                  "背景透過（Background Removal）",
                  "画像分割（Image Splitting）",
                  "余白カット（Cropping）",
                  "サイズ変更（Resizing）",
                ],
                screenshot: `${
                  process.env.NEXT_PUBLIC_BASE_URL ||
                  "https://stamp-image-tools.pages.dev"
                }/opengraph-image`,
                inLanguage: "ja",
              },
            ],
          }}
        />
        {children}
      </body>
    </html>
  );
}
