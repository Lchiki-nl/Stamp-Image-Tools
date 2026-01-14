"use client";

import { motion } from "framer-motion";
import { 
  Smile, 
  Lock, 
  Zap
} from "lucide-react";

export function AdvantagesSection() {
  return (
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
              icon: Lock,
              title: "画像は送られません",
              description: "サーバーへのアップロード不要！あなたのブラウザの中で処理が完結するので、大事なイラストが流出する心配はありません。",
              color: "text-primary",
            },
            {
              icon: Zap,
              title: "サクサク動く",
              description: "最新のブラウザ技術を使っているから、アプリのようにサクサク動きます。待ち時間ゼロでストレスフリー！",
              color: "text-blue-500",
            },
            {
              icon: Smile,
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
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">{item.title}</h3>
              <p className="text-sm text-text-sub leading-relaxed font-medium">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
