"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background-soft text-text-main overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 transform -rotate-6">
              <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-text-main">IMG-TOOLS</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors" href="#features">機能</a>
            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors" href="#advantages">安心の理由</a>
            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors" href="#workflow">使い方</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark shadow-lg shadow-primary/30 hover:shadow-xl"
            >
              無料でつくる
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-white">
        <div className="absolute inset-0 z-0 bg-soft-pattern pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-green-100/50 blur-[100px] rounded-full pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-100/50 blur-[80px] rounded-full pointer-events-none mix-blend-multiply"></div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
            <motion.div
              className="flex flex-1 flex-col items-start gap-6 lg:gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-bold text-primary shadow-sm border border-primary/10">
                <span className="text-xl">🎨</span>
                クリエイターのための画像編集
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-text-main sm:text-5xl lg:text-6xl">
                <span className="text-primary">スタンプ作り</span>に<br />
                最適な画像ツール！
              </h1>
              <p className="max-w-xl text-lg font-medium leading-relaxed text-text-sub">
                背景透過も、サイズ調整もこれひとつ。プライバシー重視で、画像はサーバーに送られません。安心してスタンプ制作に集中できます✨
              </p>
              <div className="flex flex-col w-full sm:flex-row gap-4 mt-2">
                <Link
                  href="/app"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-white shadow-xl shadow-primary/30 transition hover:bg-primary-dark hover:-translate-y-1"
                >
                  <span className="material-symbols-outlined">edit_square</span>
                  <span>今すぐ作る</span>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-text-sub font-bold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
                  <span>登録なしでOK</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
                  <span>ずっと無料</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
                  <span>スマホも対応</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Image Preview */}
            <motion.div
              className="flex-1 w-full relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -right-4 -top-10 w-32 h-32 bg-yellow-200 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <div className="absolute -left-4 -bottom-10 w-40 h-40 bg-blue-200 rounded-full blur-2xl opacity-60"></div>
              <div className="relative w-full aspect-4/3 bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-50 transform hover:scale-[1.02] transition-transform duration-500">
                <div className="bg-gray-50 px-6 py-4 flex items-center gap-4 border-b border-gray-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs font-bold text-gray-400 ml-auto">IMG-TOOLS Editor</div>
                </div>
                <div className="p-8 h-full flex items-center justify-center relative bg-checkerboard">
                  <div className="absolute w-48 h-48 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center transform -translate-x-12 -translate-y-4 opacity-50">
                    <span className="text-4xl">🐱</span>
                  </div>
                  <div className="relative z-10 w-56 h-56 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center transform rotate-6 border-4 border-white ring-4 ring-primary/20">
                    <div className="w-full h-full bg-linear-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center overflow-hidden relative">
                      <div className="text-8xl transform hover:scale-110 transition-transform cursor-pointer filter drop-shadow-lg">😸</div>
                      <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm border border-primary/10">
                        背景透過 OK!
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 right-8 bg-white p-3 rounded-xl shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: "3s" }}>
                    <span className="material-symbols-outlined text-primary text-2xl">auto_fix</span>
                  </div>
                  <div className="absolute bottom-12 left-12 bg-white p-3 rounded-xl shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: "4s" }}>
                    <span className="material-symbols-outlined text-blue-400 text-2xl">content_cut</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-soft" id="features">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">便利機能</span>
            <h2 className="text-3xl font-black text-text-main md:text-4xl">スタンプ作りを、もっと楽しく。</h2>
            <p className="mt-4 text-text-sub font-medium">面倒な作業はツールにおまかせ！クリエイティブな時間に集中できます。</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "magic_button",
                title: "サクッと背景削除",
                description: "写真やイラストの背景を一瞬で透明に！AIが自動で切り抜くから、面倒なパス切り作業とはおさらばです。",
                color: "green",
              },
              {
                icon: "grid_on",
                title: "まとめて画像分割",
                description: "大きなイラストをスタンプ用に分割したり、SNS投稿用にグリッド分割したり。使い方は自由自在！",
                color: "blue",
              },
              {
                icon: "crop_free",
                title: "余白をぴったりカット",
                description: "画像のまわりの無駄な余白を自動でトリミング。スタンプの申請サイズに合わせてスッキリ整えます。",
                color: "orange",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card hover-bounce p-8 rounded-3xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${feature.color}-100 text-${feature.color}-600 group-hover:bg-${feature.color}-500 group-hover:text-white transition-colors duration-300 shadow-sm`}>
                  <span className="material-symbols-outlined text-[32px]">{feature.icon}</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">{feature.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-text-sub">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 relative overflow-hidden bg-white" id="advantages">
        <div className="absolute inset-0 bg-[radial-gradient(#06C755_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.03] pointer-events-none"></div>
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-600 text-xs font-bold mb-4">安心・安全</span>
            <h2 className="text-3xl font-black text-text-main md:text-4xl">選ばれる3つの理由</h2>
            <p className="mt-4 text-text-sub font-medium">はじめての方でも、安心して使えます。</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "lock_person",
                title: "画像は送られません",
                description: "サーバーへのアップロード不要！あなたのブラウザの中で処理が完結するので、大事なイラストが流出する心配はありません。",
                color: "text-primary",
              },
              {
                icon: "speed",
                title: "サクサク動く",
                description: "最新のブラウザ技術を使っているから、アプリのようにサクサク動きます。待ち時間ゼロでストレスフリー！",
                color: "text-blue-500",
              },
              {
                icon: "sentiment_very_satisfied",
                title: "誰でもかんたん",
                description: "難しい設定は一切なし。直感的に使えるデザインなので、画像編集が初めての方でもすぐに使いこなせます。",
                color: "text-orange-500",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`mb-6 rounded-full bg-white p-4 ${item.color} shadow-md`}>
                  <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">{item.title}</h3>
                <p className="text-sm text-text-sub leading-relaxed font-medium">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-background-soft border-y border-gray-100" id="workflow">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-text-main md:text-4xl">とってもカンタン！</h2>
            <p className="mt-4 text-text-sub font-medium">3ステップで完成します。</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-12 left-0 w-full h-[3px] border-t-4 border-dotted border-gray-300 z-0"></div>
            {[
              { icon: "add_photo_alternate", step: "STEP 1", title: "画像を選ぶ", active: false },
              { icon: "wand_shine", step: "STEP 2", title: "自動で加工", active: true },
              { icon: "save_alt", step: "STEP 3", title: "保存する", active: false },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative z-10 flex flex-col items-center gap-6 group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 border-white ${item.active ? "bg-primary text-white shadow-xl shadow-primary/30 animate-pulse" : "bg-white text-gray-400 shadow-lg"} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-[40px]">{item.icon}</span>
                </div>
                <div className="text-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <span className="block text-primary font-black text-lg mb-1">{item.step}</span>
                  <h4 className="text-base font-bold text-text-main">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary/5">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black text-text-main sm:text-4xl mb-6">
            さあ、あなたもスタンプクリエイター！
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
              <span className="material-symbols-outlined ml-2 text-2xl">arrow_forward</span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400 font-bold">※ クレジットカード登録などは一切不要です</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white pt-12 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-main">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                </div>
                <span className="font-black text-xl">IMG-TOOLS</span>
              </div>
              <p className="text-xs font-bold text-gray-400">
                Creative Tools for Stamp Creators.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm font-bold text-text-sub">
              <a className="hover:text-primary transition-colors" href="#">プライバシーポリシー</a>
              <a className="hover:text-primary transition-colors" href="#">利用規約</a>
              <a className="hover:text-primary transition-colors" href="#">運営会社</a>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              © 2025 IMG-TOOLS. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 font-medium">
              Made with <span className="text-red-400 text-[10px]">❤️</span> by <span className="text-text-main font-bold">Antigravity</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
