"use client";

import Link from "next/link";
import Image from "next/image";
import { Smile, Upload, ImageMinus, Crop, Grid3X3, Scaling, Download, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function HowToUsePage() {
  const steps = [
    {
      id: "upload",
      title: "1. 画像のアップロード",
      icon: Upload,
      description: "加工したい画像をドラッグ＆ドロップ、またはクリックして選択します。",
      details: [
        "PNG, JPG, WebP 形式に対応しています。",
        "一度に最大30枚まで読み込めます。",
        "読み込んだ画像はブラウザ内でのみ処理され、サーバーには送信されません。"
      ],
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      id: "background",
      title: "2. 背景削除",
      icon: ImageMinus,
      description: "ワンクリックで画像の背景をきれいに透過します。",
      details: [
        "「背景削除」タブを選択します。",
        "透過したい色（デフォルトは白）をクリックまたは指定します。",
        "「許容値」スライダーで、似た色をどのくらい含めるか調整できます。"
      ],
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      id: "crop",
      title: "3. 余白カット（トリミング）",
      icon: Crop,
      description: "画像の周りの余分な余白をスッキリカットします。",
      details: [
        "「トリミング」タブを選択します。",
        "「一括カット」スライダーを動かすと、上下左右の余白を均等にカットできます。",
        "上下左右それぞれの数値を入力して、細かく調整することも可能です。"
      ],
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      id: "split",
      title: "4. グリッド分割",
      icon: Grid3X3,
      description: "1枚の画像を均等なサイズに分割して切り出します。",
      details: [
        "「分割」タブを選択します。",
        "横（列数）と縦（行数）を指定します（例：4x4など）。",
        "アニメーションスタンプのコマ割り画像を作成するのに便利です。"
      ],
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      id: "resize",
      title: "5. サイズ変更",
      icon: Scaling,
      description: "LINEスタンプの規定サイズなどにリサイズします。",
      details: [
        "「リサイズ」タブを選択します。",
        "プリセットから「スタンプ(370px)」や「メイン(240px)」などを選択できます。",
        "任意の幅・高さを指定することも可能です。"
      ],
      color: "text-sky-500",
      bg: "bg-sky-50"
    },
    {
      id: "save",
      title: "6. 保存・ダウンロード",
      icon: Download,
      description: "加工した画像を保存します。",
      details: [
        "編集画面の「新規保存」または「上書き保存」でギャラリーに反映されます。",
        "ギャラリー画面で画像を選択し、「ダウンロード」ボタンを押すとPCに保存されます。",
        "複数選択してダウンロードすると、ZIP形式でまとめて保存できます。"
      ],
      color: "text-pink-500",
      bg: "bg-pink-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background-soft text-text-main pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 transform -rotate-6 flex-shrink-0">
                <Smile size={20} className="sm:hidden" strokeWidth={2.5} />
                <Smile size={24} className="hidden sm:block" strokeWidth={2.5} />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-text-main truncate">EzStampify</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
             <Link
              href="/"
              className="flex items-center gap-1 text-sm font-bold text-text-sub hover:text-primary transition-colors"
            >
              <Home size={16} />
              <span className="hidden sm:inline">トップへ戻る</span>
            </Link>
            <Link
              href="/app"
              className="flex h-9 sm:h-10 items-center justify-center rounded-full bg-primary px-3 sm:px-5 text-xs sm:text-sm font-bold text-white transition hover:bg-primary-dark shadow-lg shadow-primary/30 hover:shadow-xl whitespace-nowrap"
            >
              アプリを開く
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">Usage Guide</span>
          <h1 className="text-3xl md:text-4xl font-black text-text-main mb-6">
            EzStampifyの<br className="md:hidden"/>基本的な使い方
          </h1>
          <p className="text-text-sub font-medium leading-relaxed max-w-2xl mx-auto">
            画像のアップロードから加工、保存まで。<br/>
            LINEスタンプ作成に便利な機能をステップバイステップで解説します。
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step) => (
            <motion.div 
              key={step.id} 
              className="scroll-mt-32"
              id={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                {/* Text Content */}
                <div className="flex-1 space-y-6 order-2 md:order-1 pt-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center shrink-0`}>
                      <step.icon size={24} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">{step.title}</h2>
                  </div>
                  
                  <p className="text-lg text-text-sub font-bold leading-relaxed">
                    {step.description}
                  </p>

                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3 text-text-sub">
                        <ArrowRight size={18} className="mt-1 shrink-0 text-primary/50" />
                        <span className="leading-relaxed font-medium">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mockup / Image Placeholder */}
                <div className="flex-1 w-full order-1 md:order-2">
                   <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white aspect-video relative group">
                      {/* Show real images for steps that have them */}
                      {['upload', 'background', 'crop', 'split', 'resize', 'save'].includes(step.id) ? (
                        <Image 
                          src={`/images/guide/${step.id}.png`} 
                          alt={step.title} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        /* Placeholder for others */
                        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-300 gap-4">
                           <step.icon size={64} className="opacity-20" />
                           <span className="text-sm font-bold opacity-40">Screenshot: {step.title}</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-text-main mb-4">さあ、はじめましょう</h2>
          <p className="text-text-sub mb-8 font-medium">登録不要で、今すぐ無料で使えます。</p>
          <Link
            href="/app"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white transition hover:bg-primary-dark shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            画像加工をはじめる
          </Link>
        </div>
      </main>

       {/* Footer */}
       <footer className="mt-auto border-t border-gray-100 bg-white pt-12 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-main">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Smile size={20} strokeWidth={2.5} />
                </div>
                <span className="font-black text-xl">EzStampify</span>
              </div>
              <p className="text-xs font-bold text-gray-400">
                Creative Tools for Stamp Creators.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm font-bold text-text-sub">
              <a className="hover:text-primary transition-colors" href="https://note.com/lchiki_nl/m/me2fbf42ae315" target="_blank" rel="noopener noreferrer">作者のnote</a>
              <a className="hover:text-primary transition-colors" href="https://store.line.me/emojishop/author/10517625/ja" target="_blank" rel="noopener noreferrer">作者のLINE絵文字</a>
              <Link className="hover:text-primary transition-colors" href="/privacy">プライバシーポリシー</Link>
              <Link className="hover:text-primary transition-colors" href="/terms">利用規約</Link>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-50 pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              © 2026 EzStampify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
