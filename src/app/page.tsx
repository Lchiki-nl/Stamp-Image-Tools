"use client";

import Link from "next/link";
import { Smile } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AdvantagesSection } from "@/components/landing/AdvantagesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background-soft text-text-main overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 transform -rotate-6">
              <Smile size={24} strokeWidth={2.5} />
            </div>
            <div className="text-xl font-extrabold tracking-tight text-text-main">EzStampify</div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors" href="#features">機能</a>
            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors" href="#advantages">安心の理由</a>
            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors" href="/how-to-use">使い方</a>
            <Link className="text-sm font-bold text-text-sub hover:text-primary transition-colors" href="/faq">よくある質問</Link>
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

      <HeroSection />
      <FeaturesSection />
      <AdvantagesSection />
      <WorkflowSection />
      <CTASection />

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
              <a className="hover:text-primary transition-colors" href="https://forms.gle/ZHXoTYuuEW8rfVrw9" target="_blank" rel="noopener noreferrer">お問い合わせ</a>
              <a className="hover:text-primary transition-colors" href="https://store.line.me/emojishop/author/10517625/ja" target="_blank" rel="noopener noreferrer">作者のLINE絵文字</a>
              <Link className="hover:text-primary transition-colors" href="/how-to-use">使い方ガイド</Link>
              <Link className="hover:text-primary transition-colors" href="/faq">よくある質問</Link>
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
