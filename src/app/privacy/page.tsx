import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "EzStampifyのプライバシーポリシー。当ツールは個人情報を収集せず、アップロードされた画像はすべてブラウザ内で処理されます。",
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
            <p>
              当ツール（EzStampify）は、ユーザーの個人情報を収集しません。
              ユーザーがアップロードした画像は、すべてユーザーのブラウザ（クライアントサイド）内でのみ処理されます。
              画像データが当社のサーバーに送信・保存されることは一切ありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">2. アクセス解析について</h2>
            <p>
              当サイトでは、サービスの向上を目的として、Google Analyticsなどのアクセス解析ツールを使用する場合があります。
              これらは匿名のトラフィックデータを収集するものであり、個人を特定する情報は含まれません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">3. 免責事項</h2>
            <p>
              当ツールの利用により生じた損害について、当社は一切の責任を負いません。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
