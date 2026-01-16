"use client";

import { motion } from "framer-motion";
import { 
  Grid3X3, 
  Crop, 
  Sparkles, 
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background-soft" id="features">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">便利機能</span>
          <h2 className="text-3xl font-black text-text-main md:text-4xl">LINEスタンプ作りを、もっと楽しく。</h2>
          <p className="mt-4 text-text-sub font-medium">面倒な作業はツールにおまかせ！クリエイティブな時間に集中できます。</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "サクッと背景透過",
              description: "写真やイラストの背景を一瞬で透明に！クリックした色を自動で切り抜くので、面倒なパス切り作業とはおさらばです。",
              color: "green",
            },
            {
              icon: Grid3X3,
              title: "イラストを一括で画像分割",
              description: "大きなイラストを一括で切り出したり、SNS投稿用にグリッド分割したり。分割数は自由自在！",
              color: "blue",
            },
            {
              icon: Crop,
              title: "余白切り抜き & リサイズ",
              description: "スライダー操作で画像の余白をまとめてカット。LINEスタンプの申請サイズに合わせてリサイズ。",
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
                <feature.icon size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-main">{feature.title}</h3>
              <p className="text-sm font-medium leading-relaxed text-text-sub">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
