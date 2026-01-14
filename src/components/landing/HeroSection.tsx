"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Edit, 
  CheckCircle2, 
  Wand2, 
  Scissors
} from "lucide-react";

export function HeroSection() {
  const [currentEmoji, setCurrentEmoji] = useState("😸");

  useEffect(() => {
    const CAT_EMOJIS = ["😸", "😺", "😻", "😼", "😽", "🙀", "😿", "😹", "😾"];
    const randomEmoji = CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)];
    setCurrentEmoji(randomEmoji);
  }, []);

  return (
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
              クリエイターのための画像加工
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-text-main sm:text-5xl lg:text-6xl">
              <span className="text-primary whitespace-nowrap">スタンプ作り</span>に<br />
              <span className="whitespace-nowrap">最適な画像ツール！</span>
            </h1>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-text-sub">
              背景透過も、サイズ調整もこれひとつ。プライバシー重視で、画像はサーバーに送られません。安心してスタンプ制作に集中できます✨
            </p>
            <div className="flex flex-col w-full sm:flex-row gap-4 mt-2">
              <Link
                href="/app"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-white shadow-xl shadow-primary/30 transition hover:bg-primary-dark hover:-translate-y-1"
              >
                <Edit size={24} />
                <span>今すぐ作る</span>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 pt-4 text-sm text-text-sub font-bold">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 size={22} className="text-primary shrink-0" />
                <span>登録なしでOK</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 size={22} className="text-primary shrink-0" />
                <span>ずっと無料</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 size={22} className="text-primary shrink-0" />
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
                <div className="text-xs font-bold text-gray-400 ml-auto">EzStampify Editor</div>
              </div>
              <div className="p-8 h-full flex items-center justify-center relative bg-checkerboard">
                <div className="absolute w-48 h-48 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center transform -translate-x-12 -translate-y-4 opacity-50">
                  <span className="text-4xl">🐱</span>
                </div>
                <div className="relative z-10 w-56 h-56 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center transform rotate-6 border-4 border-white ring-4 ring-primary/20">
                  <div className="w-full h-full bg-linear-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center overflow-hidden relative">
                    <div className="text-8xl transform hover:scale-110 transition-transform cursor-pointer filter drop-shadow-lg">
                      {currentEmoji}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm border border-primary/10">
                      背景透過 OK!
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 right-8 bg-white p-3 rounded-xl shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: "3s" }}>
                  <Wand2 className="text-primary" size={24} />
                </div>
                <div className="absolute bottom-12 left-12 bg-white p-3 rounded-xl shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: "4s" }}>
                  <Scissors className="text-blue-400" size={24} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
