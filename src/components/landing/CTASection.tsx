"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-primary/5">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-black text-text-main sm:text-4xl mb-6">
          さあ、あなたもLINEスタンプクリエイター！
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-text-sub">
          インストール不要、面倒な登録もなし。<br className="hidden sm:block" />
          今すぐブラウザで、世界にひとつだけのスタンプを作りましょう。
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/app"
            className="flex min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary h-16 px-10 text-white text-xl font-bold shadow-2xl shadow-primary/40 transition hover:bg-primary-dark hover:scale-105 active:scale-95"
          >
            無料で始める
            <ArrowRight className="ml-2" size={24} />
          </Link>
        </div>

      </div>
    </section>
  );
}
