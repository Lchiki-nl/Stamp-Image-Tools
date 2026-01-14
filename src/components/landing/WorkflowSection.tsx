"use client";

import { motion } from "framer-motion";
import { 
  Wand2, 
  ImagePlus, 
  Download
} from "lucide-react";

export function WorkflowSection() {
  return (
    <section className="py-20 bg-background-soft border-y border-gray-100" id="workflow">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-text-main md:text-4xl">とってもカンタン！</h2>
          <p className="mt-4 text-text-sub font-medium">3ステップで完成します。</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-12 left-0 w-full h-[3px] border-t-4 border-dotted border-gray-300 z-0"></div>
          {[
            { icon: ImagePlus, step: "STEP 1", title: "画像を選ぶ", active: false },
            { icon: Wand2, step: "STEP 2", title: "ツールで加工", active: true },
            { icon: Download, step: "STEP 3", title: "保存する", active: false },
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
                <item.icon size={40} />
              </div>
              <div className="text-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="block text-primary font-black text-lg mb-1">{item.step}</span>
                <h4 className="text-base font-bold text-text-main">{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/how-to-use" 
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline hover:text-primary-dark transition-colors"
          >
            <span>詳しい使い方ガイドを見る</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
