
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
              当ツール（EzStampify）を利用することで、本規約に同意したものとみなします。
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
              当ツールは現状有姿で提供されます。
              不具合やバグがないことを保証するものではなく、利用により生じたいかなる損害についても責任を負いません。
              また、予告なくサービスの内容変更や停止を行う場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">4. 著作権</h2>
            <p>
              ユーザーが加工した画像の著作権は、ユーザー自身または元の権利者に帰属します。
              当ツールがその権利を主張することはありません。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
