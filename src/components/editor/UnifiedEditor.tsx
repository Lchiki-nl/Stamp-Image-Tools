import { useState, useCallback, useEffect } from "react";
import { Eraser, Grid3X3, Crop } from "lucide-react";
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
    onApply?: (blob: Blob | Blob[]) => void;
    onFileSelect?: (file: File) => void;
    initialTool?: Tool;
    onNext?: () => void;
    onPrev?: () => void;
}

export function UnifiedEditor({ 
    previewUrl, 
    onBack, 
    onApply, 
    embeddedImage, 
    embeddedCanvasRef, 
    onFileSelect, 
    initialTool = "background",
    onNext,
    onPrev
}: UnifiedEditorProps) {
  const [activeTool, setActiveTool] = useState<Tool>(initialTool);

  const [image, setImage] = useState<HTMLImageElement | null>(null);

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

  const [notification, setNotification] = useState<string | null>(null);

  // 適用して画像更新
  // 適用して画像更新
  const handleApply = useCallback((blob: Blob | Blob[]) => {
    if (onApply) onApply(blob);

    // 単一画像の場合のみプレビューを更新
    if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
        setImage(img);
        };
        img.src = url;
    }

    // 完了通知を表示
    setNotification("画像を更新しました");
    setTimeout(() => setNotification(null), 3000);
  }, [onApply]);

  const ActiveComponent = 
    activeTool === "background" ? BackgroundRemovalTool :
    activeTool === "split" ? ImageSplitTool :
    CropTool;



  return (
    <div className="flex flex-col h-full bg-background-soft">
      {/* Header Bar */}
      <header className="px-4 lg:px-8 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20">
                  <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
                </div>
                <h1 className="font-bold text-lg text-text-main hidden sm:block">画像編集</h1>
            </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
             {/* Image Status */}
            {image && (
                <div className="hidden sm:flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-gray-500">サイズ:</span>
                    <span className="text-xs font-mono font-bold text-gray-700">
                        {image.naturalWidth} x {image.naturalHeight}
                    </span>
                </div>
            )}
            
             {/* Close Button Removed from Header */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
            
          {/* Tool Tabs */}
          <div className="flex justify-center mb-4">
            <nav className="items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm inline-flex">
                {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                    <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all
                        ${isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}
                    `}
                    >
                    <Icon size={18} />
                    <span>{tool.label}</span>
                    </button>
                );
                })}
            </nav>
          </div>

          {/* Editor Area */}
          <div className="relative flex-1">
             {/* Navigation Buttons - Left */}
             {onPrev && (
                 <button 
                    onClick={onPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 p-3 rounded-full bg-white/90 text-gray-500 shadow-xl hover:bg-white hover:text-primary transition-all hidden xl:flex"
                    title="前の画像"
                 >
                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                 </button>
             )}

             {/* Navigation Buttons - Right */}
             {onNext && (
                 <button 
                    onClick={onNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 p-3 rounded-full bg-white/90 text-gray-500 shadow-xl hover:bg-white hover:text-primary transition-all hidden xl:flex"
                    title="次の画像"
                 >
                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                 </button>
             )}

            <div className="glass-card rounded-[32px] p-6 h-[640px] shadow-xl shadow-slate-200/50 block w-full border border-white/50 relative">
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
                    <div className="animate-in fade-in duration-300 h-full">
                        <ActiveComponent 
                            embeddedImage={image} 
                            embeddedCanvasRef={embeddedCanvasRef}
                            onApply={handleApply}
                        />
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>


      {/* Prominent Close Button (Fixed Top Right) */}
      {onBack && (
        <button
            onClick={onBack}
            className="fixed top-6 right-6 z-[60] flex flex-col items-center justify-center group"
        >
            <div className="w-14 h-14 bg-red-500 rounded-full shadow-xl shadow-red-500/30 flex items-center justify-center text-white transition-transform group-hover:scale-110 group-active:scale-95">
                <span className="material-symbols-outlined text-3xl font-bold">close</span>
            </div>
            <span className="mt-1 text-xs font-bold text-gray-500 bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm group-hover:text-red-500 transition-colors">
                閉じる
            </span>
        </button>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
           <div className="bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-sm">
             <span className="material-symbols-outlined text-green-400">check_circle</span>
             <span className="font-bold text-sm">{notification}</span>
           </div>
        </div>
      )}
    </div>
  );
}
