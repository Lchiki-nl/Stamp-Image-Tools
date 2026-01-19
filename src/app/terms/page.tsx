import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "利用規約",
  description: "EzStampifyの利用規約。本サービスの利用条件、禁止事項、免責事項、著作権についてご確認ください。",
  alternates: {
    canonical: "./",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background-soft py-12 px-6">
      <div className="mx-auto max-w-3xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-text-sub hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          トップに戻る
        </Link>
        
        <h1 className="text-3xl font-black text-text-main mb-8">利用規約</h1>
        
        <div className="space-y-8 text-text-main leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">1. 規約への同意</h2>
            <p>
              本サービス（EzStampify）をご利用いただくことで、本規約に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">2. 禁止事項</h2>
            <p>
              以下の行為を禁止します。
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-sub">
              <li>法令または公序良俗に違反する行為</li>
              <li>当ツールの運営を妨害する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">3. 免責事項</h2>
            <p>
              本サービスは、明示的か黙示的かを問わず、現状のまま提供されるものとします。
              不具合やバグがないことを保証するものではなく、ご利用により生じたいかなる損害についても責任を負いかねます。
              また、予告なくサービスの内容変更または停止を行う場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">4. 著作権</h2>
            <p>
              ユーザーが加工した画像の著作権は、ユーザー自身または元の権利者に帰属します。
              本サービスが、加工された画像に関する著作権を取得することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">5. 有料プラン（VIPプラン）について</h2>
            <p className="mb-3">
              本サービスでは、一部機能を有料で提供するVIPプランを設けています。
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4 text-text-sub">
              <li>
                <strong>決済について：</strong>
                決済はStripe社のサービスを通じて行われます。クレジットカード情報等は当サービスでは保持いたしません。
              </li>
              <li>
                <strong>月額プランの解約：</strong>
                月額プランはいつでも解約可能です。解約後も、次回請求日までは引き続きご利用いただけます。
              </li>
              <li>
                <strong>返金について：</strong>
                デジタルサービスの性質上、決済完了後の返金には原則として応じかねます。
              </li>
              <li>
                <strong>ライセンスキーの管理：</strong>
                ライセンスキー（顧客ID）はお客様ご自身で管理してください。紛失した場合、復旧にお時間をいただく場合があります。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">6. サービスの変更・終了</h2>
            <p>
              運営者は、事前の通知なく、本サービス（有料・無料を問わず）の内容の変更、
              機能の追加・削除、または提供の終了を行う場合があります。
              これにより生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">7. 規約の変更</h2>
            <p>
              本規約は、必要に応じて予告なく変更される場合があります。
              変更後の規約は、本ページに掲載した時点で効力を生じます。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
