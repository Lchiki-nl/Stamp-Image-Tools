
import type { Metadata } from "next";
import { HowToContent } from "./HowToContent";
import { steps } from "./steps";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "使い方・機能紹介",
  description: "EzStampifyの基本的な使い方。画像のアップロード、背景削除、トリミング、分割、リサイズなど、LINEスタンプ制作に役立つ機能の手順を詳しく解説します。",
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: "使い方・機能紹介 | EzStampify",
    description: "登録不要で使える無料画像加工ツール「EzStampify」の操作マニュアル。背景透過もサイズ調整もこれひとつで。",
  },
};

export default function HowToUsePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://stamp-image-tools.pages.dev";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "EzStampifyの基本的な使い方",
    "description": "画像のアップロードから加工、保存まで。LINEスタンプ作成に便利な機能をステップバイステップで解説します。",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
      "image": `${baseUrl}/images/guide/${step.id}.png`,
      "itemListElement": step.details.map((detail, i) => ({
        "@type": "HowToDirection",
        "position": i + 1,
        "text": detail
      }))
    }))
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HowToContent />
    </>
  );
}
