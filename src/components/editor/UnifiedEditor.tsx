import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Eraser, Grid3X3, Crop, Menu, X, ArrowLeft } from "lucide-react";
import { BackgroundRemovalTool } from "@/components/tools/BackgroundRemovalTool";
import { ImageSplitTool } from "@/components/tools/ImageSplitTool";
import { CropTool } from "@/components/tools/CropTool";
import { FileDropzone } from "@/components/shared/FileDropzone";
import type { ImageCanvasHandle } from "@/components/shared/ImageCanvas";

type Tool = "background" | "split" | "crop";

const tools = [
  { id: "background" as Tool, icon: Eraser, label: "背景削除", color: "green", description: "背景を透明化して被写体を切り抜きます" },
  { id: "crop" as Tool, icon: Crop, label: "余白カット", color: "orange", description: "不要な余白をカットしてサイズを調整します" },
  { id: "split" as Tool, icon: Grid3X3, label: "画像分割", color: "blue", description: "スタンプ用に画像を分割して保存します" },
];

interface UnifiedEditorProps {
    previewUrl?: string; // URL for the image to edit
    onBack?: () => void; // Callback to return to gallery
    embeddedImage?: HTMLImageElement | null;
    embeddedCanvasRef?: React.RefObject<ImageCanvasHandle>;
    onApply?: (blob: Blob) => void;
    onFileSelect?: (file: File) => void;
}

export function UnifiedEditor({ previewUrl, onBack, onApply, embeddedImage, embeddedCanvasRef, onFileSelect }: UnifiedEditorProps) {
  const [activeTool, setActiveTool] = useState<Tool>("background");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // previewUrl から画像をロード
  useEffect(() => {
    let active = true;
    if (previewUrl) {
        const img = new Image();
        img.onload = () => {
            if (active) setImage(img);
        };
        img.src = previewUrl;
    } else if (embeddedImage !== undefined) { 
        // embeddedImage can be null, so check undefined
        // If it changes, update image state.
        // To avoid "synchronous setState" warning (which is actually fine here since it's props syncing, 
        // but React warns if it causes cascading updates), we can wrap it or just suppress if logic demands.
        // However, better pattern is to use key={embeddedImage?.src} or just update.
        // eslint-disable-next-line
        if (active) setImage(embeddedImage);
    }
    return () => { active = false; };
  }, [previewUrl, embeddedImage]);

  // 画像読み込み (Dropzone利用時)
  const handleFileSelect = useCallback((file: File) => {
    if (onFileSelect) {
      onFileSelect(file);
      return; 
    }
    
    // Fallback for standalone usage
    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = URL.createObjectURL(file);
  }, [onFileSelect]);

  // 適用して画像更新
  const handleApply = useCallback((blob: Blob) => {
    if (onApply) onApply(blob);

    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      // メモリリーク防止のため古いURLを解放すべきだが、履歴管理するならとっておく
      // 今回はシンプルに上書き
    };
    img.src = url;
  }, [onApply]);

  const ActiveComponent = 
    activeTool === "background" ? BackgroundRemovalTool :
    activeTool === "split" ? ImageSplitTool :
    CropTool;

  const currentToolDef = tools.find((t) => t.id === activeTool);

  return (
    <div className="flex min-h-screen bg-background-soft">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-lg border border-gray-100 text-gray-600"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto order-1 lg:order-1">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-text-main flex items-center gap-3">
                {currentToolDef?.label}
              </h1>
              <p className="text-sm text-text-sub mt-1">
                {currentToolDef?.description}
              </p>
            </div>
            
            {/* Image Status */}
            {image && (
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <span className="text-xs font-bold text-gray-400">編集中:</span>
                    <span className="text-sm font-bold text-gray-700">
                        {image.naturalWidth} x {image.naturalHeight} px
                    </span>
                    <button 
                        onClick={() => {
                            if (onBack) {
                                onBack();
                            } else {
                                setImage(null);
                            }
                        }}
                        className="text-xs text-red-500 hover:text-red-600 font-bold hover:underline"
                    >
                        画像を閉じる
                    </button>
                </div>
            )}
          </div>

          {/* Editor Area */}
          <div className="glass-card rounded-3xl p-6 min-h-[600px] shadow-xl shadow-slate-200/50 block flex-1">
             {!image ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-full max-w-xl">
                        <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
                        <p className="text-center text-gray-400 text-sm mt-4">
                            画像をドラッグ&ドロップして編集を開始
                        </p>
                    </div>
                </div>
             ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
                    <ActiveComponent 
                        embeddedImage={image} 
                        embeddedCanvasRef={embeddedCanvasRef}
                        onApply={handleApply}
                    />
                </div>
             )}
          </div>
        </div>
      </main>

      {/* Right Sidebar (Tabs) */}
      <aside
        className={`
          fixed lg:static inset-y-0 right-0 z-40
          w-72 lg:w-20 bg-white border-l border-gray-100 shadow-sm
          transform transition-transform duration-300 ease-in-out
          flex flex-col items-center py-4 gap-4
          order-2 lg:order-2
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
          {/* Back Button */}
            {onBack ? (
                <button 
                    onClick={onBack}
                    className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors w-16 h-16"
                    title="ギャラリーへ戻る"
                >
                    <ArrowLeft size={24} />
                    <span className="text-[10px] font-bold mt-1">戻る</span>
                </button>
            ) : (
                <Link
                    href="/"
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"
                >
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                </Link>
            )}

          {/* Tool Tabs */}
          <nav className="flex flex-col w-full gap-2 px-2">
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
                    relative flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all duration-200 group w-full
                    ${isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}
                  `}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                  <span className="text-[10px] font-bold">{tool.label}</span>
                  
                  {/* Active Indicator (Right Border style for Tab) */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                  )}
                </button>
              );
            })}
          </nav>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
