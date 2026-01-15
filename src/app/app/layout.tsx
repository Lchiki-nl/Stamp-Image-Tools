import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "画像加工エディタ",
  description: "背景透過、トリミング、グリッド分割、サイズ変更など、LINEスタンプ制作に便利な機能が揃った無料画像加工ツール。登録不要でブラウザ上で完結します。",
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-soft">
      {children}
    </div>
  );
}
