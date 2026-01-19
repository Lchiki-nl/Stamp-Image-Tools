import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "EzStampifyのプライバシーポリシー。本サービスは個人情報を収集せず、アップロードされた画像はすべてブラウザ内で処理されます。",
  alternates: {
    canonical: "./",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background-soft py-12 px-6">
      <div className="mx-auto max-w-3xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-text-sub hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          トップに戻る
        </Link>
        
        <h1 className="text-3xl font-black text-text-main mb-8">プライバシーポリシー</h1>
        
        <div className="space-y-8 text-text-main leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">1. 個人情報の収集について</h2>
            <p className="mb-4">
              基本機能（画像加工など）の利用において、アップロードされた画像データはユーザーのブラウザ内でのみ処理され、サーバーに保存されることはありません。
            </p>
            <p className="mb-2 font-bold text-text-sub">有料プラン（VIPプラン）ご利用時：</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-text-sub">
              <li>ライセンス管理のため、メールアドレスおよびStripe顧客IDを保存します。</li>
              <li>クレジットカード情報は決済代行会社（Stripe）が直接管理し、当サービスでは一切保持（非通過・非保持）いたしません。</li>
              <li>セキュリティ維持および不正利用防止のため、IPアドレス等のアクセスログを一時的に記録する場合があります。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">2. アクセス解析について</h2>
            <p>
              本サービスでは、サービスの向上を目的として、Google Analyticsなどのアクセス解析ツールを使用する場合があります。
              これらは匿名のトラフィックデータを収集するものであり、個人を特定する情報は含まれません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">3. 免責事項</h2>
            <p>
              本サービスのご利用により生じたいかなる損害についても、当社は一切の責任を負いかねます。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
