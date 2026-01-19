"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Smile, Home, Lock, Crown, Sparkles, BookOpen, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { steps } from "./steps";
import { FAQBody } from "./FAQBody";

export function HowToContent() {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq'>('guide');

  return (
    <div className="min-h-screen bg-background-soft text-text-main pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 transform -rotate-6 shrink-0">
                <Smile size={20} className="sm:hidden" strokeWidth={2.5} />
                <Smile size={24} className="hidden sm:block" strokeWidth={2.5} />
              </div>
              <div className="text-lg sm:text-xl font-extrabold tracking-tight text-text-main truncate">EzStampify</div>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
        <div className="text-center mb-10">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">Support Center</span>
          <h1 className="text-3xl md:text-4xl font-black text-text-main mb-6">
            使い方 & よくある質問
          </h1>
          <p className="text-text-sub font-medium leading-relaxed max-w-2xl mx-auto mb-8">
            EzStampifyの操作方法や、よくあるご質問をまとめています。<br/>
            お困りの際にご活用ください。
          </p>
          
          {/* Tab Navigation */}
          <div className="inline-flex p-1 bg-gray-100/80 rounded-2xl border border-gray-200">
             <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all relative ${
                    activeTab === 'guide' 
                        ? 'text-primary bg-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
             >
                <BookOpen size={18} />
                使い方ガイド
                {activeTab === 'guide' && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 rounded-xl ring-2 ring-primary/10 pointer-events-none" />
                )}
             </button>
             <button
                onClick={() => setActiveTab('faq')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all relative ${
                    activeTab === 'faq' 
                        ? 'text-primary bg-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
             >
                <HelpCircle size={18} />
                よくある質問
                {activeTab === 'faq' && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 rounded-xl ring-2 ring-primary/10 pointer-events-none" />
                )}
             </button>
          </div>
        </div>

        <div className="min-h-[600px]">
           {activeTab === 'guide' ? (
             <div className="space-y-24 animate-in fade-in duration-300">
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
                         <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                           {step.title}
                           {'isVip' in step && step.isVip && (
                             <span className="text-xs font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded-full">VIP</span>
                           )}
                         </h2>
                       </div>
                       
                       <p className="text-lg text-text-sub font-bold leading-relaxed">
                         {step.description}
                       </p>
     
                       <ul className="space-y-3">
                         {step.details.map((detail, i) => {
                           // Check if this is a separator
                           if (detail === "[SEP_VIP]") {
                             return (
                               <li key={i} className="py-2">
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full border border-amber-200 shadow-sm">
                                   <Crown size={14} className="fill-amber-500 text-amber-600" />
                                   VIP専用
                                 </span>
                               </li>
                             );
                           }
                           
                           const isVipContext = step.details.includes("[SEP_VIP]") && step.details.indexOf(detail) > step.details.indexOf("[SEP_VIP]");
                           const isVipDetail = step.id === 'vip' || isVipContext || detail.includes("VIP") || detail.includes("無制限");
     
                           return (
                             <li key={i} className={`flex items-start gap-3 text-text-sub leading-relaxed ${
                               isVipDetail ? "bg-amber-50/50 p-2 rounded-lg" : ""
                             }`}>
                               <div className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${
                                 isVipDetail ? "bg-amber-400" : "bg-text-sub/40"
                               }`} />
                               <span className={isVipDetail ? "text-amber-900 font-medium" : ""}>
                                 {detail}
                               </span>
                             </li>
                           );
                         })}
                       </ul>
                     </div>
     
                     {/* Mockup / Image Placeholder */}
                     <div className="flex-1 w-full order-1 md:order-2">
                        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white aspect-video relative group">
                           {/* Show real images for steps that have them */}
                           {['upload', 'background', 'eraser', 'text', 'crop', 'split', 'resize', 'save'].includes(step.id) ? (
                             <Image 
                               src={`/images/guide/${step.id}.png`} 
                               alt={step.title} 
                               fill
                               className="object-contain"
                               priority={step.id === 'upload'}
                               sizes="(max-width: 768px) 100vw, 50vw"
                               unoptimized
                             />
                           ) : step.id === 'vip' ? (
                             /* VIP Visual */
                             <div className="absolute inset-0 bg-linear-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center gap-6">
                               <div className="relative">
                                 <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 rounded-full" />
                                 <Crown size={80} className="text-amber-500 relative z-10" strokeWidth={1.5} />
                               </div>
                               <div className="flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-amber-100 shadow-sm">
                                   <Lock size={16} className="text-amber-600" />
                                   <span className="text-sm font-bold text-amber-800">VIP Access Only</span>
                               </div>
                             </div>
                           ) : step.id === 'ai-removal' ? (
                             /* AI Visual */
                             <div className="absolute inset-0 bg-linear-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center gap-6">
                                 <div className="relative">
                                     <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 rounded-full" />
                                     <Sparkles size={80} className="text-indigo-500 relative z-10" strokeWidth={1.5} />
                                 </div>
                                 <span className="text-sm font-bold text-indigo-400/80 tracking-widest uppercase">AI Automated</span>
                             </div>
                           ) : (
                             /* Default Placeholder */
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
               
                {/* Bottom CTA for Guide */}
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
             </div>
           ) : (
             <FAQBody />
           )}
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
