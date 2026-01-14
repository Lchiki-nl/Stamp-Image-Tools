import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-mplus-rounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IMG-TOOLS | スタンプ作りに最適な無料画像編集ツール",
    template: "%s | IMG-TOOLS",
  },
  description:
    "登録不要、ずっと無料。背景透過、画像分割、余白カットなど、LINEスタンプ制作に便利な機能が揃ったブラウザ完結型ツールです。プライバシー重視で画像はサーバーに送られません。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "IMG-TOOLS | スタンプ作りに最適な無料画像編集ツール",
    description:
      "登録不要、ずっと無料。背景透過、画像分割、余白カットなど、LINEスタンプ制作に便利な機能が揃ったブラウザ完結型ツールです。",
    siteName: "IMG-TOOLS",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMG-TOOLS | スタンプ作りに最適な無料画像編集ツール",
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
        {children}
      </body>
    </html>
  );
}
