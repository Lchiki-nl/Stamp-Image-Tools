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
  title: "IMG-TOOLS - スタンプ作成ツール",
  description:
    "背景透過も、サイズ調整もこれひとつ。プライバシー重視のクライアントサイド画像処理ツール。",
  keywords: ["スタンプ作成", "画像編集", "背景削除", "画像分割", "トリミング"],
  openGraph: {
    title: "IMG-TOOLS - スタンプ作成ツール",
    description:
      "背景透過も、サイズ調整もこれひとつ。プライバシー重視のクライアントサイド画像処理ツール。",
    type: "website",
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
