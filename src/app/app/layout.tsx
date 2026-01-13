"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Eraser, Grid3X3, Crop, Home, Menu, X } from "lucide-react";
import { BackgroundRemovalTool } from "@/components/tools/BackgroundRemovalTool";
import { ImageSplitTool } from "@/components/tools/ImageSplitTool";
import { CropTool } from "@/components/tools/CropTool";

type Tool = "background" | "split" | "crop";

const tools = [
  { id: "background" as Tool, icon: Eraser, label: "背景削除", color: "green" },
  { id: "split" as Tool, icon: Grid3X3, label: "画像分割", color: "blue" },
  { id: "crop" as Tool, icon: Crop, label: "余白カット", color: "orange" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<Tool>("background");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background-soft">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-lg border border-gray-100"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 lg:w-20 bg-white border-r border-gray-100 shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 p-3 mb-6 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 transform -rotate-6">
              <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
            </div>
            <span className="font-black text-lg lg:hidden">IMG-TOOLS</span>
          </Link>

          {/* Tool Navigation */}
          <nav className="flex flex-col gap-1 flex-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 p-2 rounded-xl transition-all duration-200
                    ${isActive
                      ? `bg-${tool.color}-100 text-${tool.color}-600`
                      : "hover:bg-gray-50 text-gray-500"
                    }
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-lg transition-all
                      ${isActive ? `bg-${tool.color}-500 text-white shadow-md` : "bg-gray-100"}
                    `}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="font-bold text-sm lg:hidden">{tool.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Home Link */}
          <Link
            href="/"
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-gray-500"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100">
              <Home size={24} />
            </div>
            <span className="font-bold lg:hidden">ホームへ戻る</span>
          </Link>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Tool Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-text-main flex items-center gap-3">
              {tools.find((t) => t.id === activeTool)?.label}
            </h1>
          </div>

          {/* Tool Content */}
          <div className="glass-card rounded-3xl p-6 min-h-[600px]">
            {activeTool === "background" && <BackgroundRemovalTool />}
            {activeTool === "split" && <ImageSplitTool />}
            {activeTool === "crop" && <CropTool />}
          </div>
        </div>
      </main>
    </div>
  );
}
