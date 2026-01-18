import { useState, useCallback, useEffect } from "react";
import {
  Eraser,
  Grid3X3,
  Crop,
  Scaling,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Smile,
  Trash2,
  Type,
  Lock,
} from "lucide-react";
import { BackgroundRemovalTool } from "@/components/tools/BackgroundRemovalTool";
import { ImageSplitTool } from "@/components/tools/ImageSplitTool";
import { CropTool } from "@/components/tools/CropTool";
import { ResizeTool } from "@/components/tools/ResizeTool";
import { TextTool } from "@/components/tools/TextTool";
import { FileDropzone } from "@/components/shared/FileDropzone";
import type { ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { useVipStatus } from "@/hooks/useVipStatus";
import { VipAuthModal } from "@/components/gallery/VipAuthModal";
import { trackToolUsed } from "@/lib/analytics";

type Tool = "background" | "split" | "crop" | "resize" | "text";

const tools = [
  {
    id: "background" as Tool,
    icon: Eraser,
    label: "背景削除",
    color: "green",
    description: "背景を透明化して被写体を切り抜きます",
  },
  {
    id: "crop" as Tool,
    icon: Crop,
    label: "余白カット",
    color: "orange",
    description: "不要な余白をカットしてサイズを調整します",
  },
  {
    id: "resize" as Tool,
    icon: Scaling,
    label: "サイズ変更",
    color: "pink",
    description: "画像のサイズを変更します",
  },
  {
    id: "split" as Tool,
    icon: Grid3X3,
    label: "画像分割",
    color: "blue",
    description: "スタンプ用に画像を分割して保存します",
  },
  {
    id: "text" as Tool,
    icon: Type,
    label: "文字入れ",
    color: "purple",
    description: "画像にテキストを追加します (VIP)",
  },
];

interface UnifiedEditorProps {
  previewUrl?: string; // URL for the image to edit
  onBack?: () => void; // Callback to return to gallery
  embeddedImage?: HTMLImageElement | null;
  embeddedCanvasRef?: React.RefObject<ImageCanvasHandle>;
  onApply?: (blob: Blob | Blob[], overwrite: boolean) => void;
  onFileSelect?: (file: File) => void;
  initialTool?: Tool;
  onNext?: () => void;
  onPrev?: () => void;
  onDelete?: () => void;
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
  onPrev,
  onDelete,
}: UnifiedEditorProps) {
  const [activeTool, setActiveTool] = useState<Tool>(initialTool);
  const [overwriteMode, setOverwriteMode] = useState(true); // true = 上書き, false = 新規

  const { isVip } = useVipStatus();
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

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
    return () => {
      active = false;
    };
  }, [previewUrl, embeddedImage]);

  // 画像読み込み (Dropzone利用時)
  const handleFileSelect = useCallback(
    (file: File) => {
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
    },
    [onFileSelect],
  );

  const [notification, setNotification] = useState<string | null>(null);

  // 適用して画像更新
  // 適用して画像更新
  const handleApply = useCallback(
    (blob: Blob | Blob[]) => {
      // Split always creates new images
      const shouldOverwrite = Array.isArray(blob) ? false : overwriteMode;
      if (onApply) onApply(blob, shouldOverwrite);

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
    },
    [onApply, overwriteMode],
  );

  const ActiveComponent =
    activeTool === "background"
      ? BackgroundRemovalTool
      : activeTool === "split"
        ? ImageSplitTool
        : activeTool === "resize"
          ? ResizeTool
          : activeTool === "text"
            ? TextTool
            : CropTool;

  return (
    <div className="flex flex-col h-full bg-background-soft">
      {/* Header Bar */}
      <header className="px-4 lg:px-8 py-4 hidden md:flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20">
              <Smile size={24} strokeWidth={2.5} />
            </div>
            <h1 className="font-bold text-lg text-text-main hidden sm:block">
              画像加工
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Buttons moved to tabs area */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {/* Tool Tabs */}
          {/* Tool Tabs */}
          <div className="relative flex flex-nowrap justify-center items-center gap-2 mb-4">
            <div className="shrink-0">
              <nav className="items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm inline-flex">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  const isLocked = tool.id === "text" && !isVip;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (isLocked) {
                          setIsVipModalOpen(true);
                        } else {
                          setActiveTool(tool.id);
                          trackToolUsed(tool.id);
                        }
                      }}
                      className={`
                            flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap relative
                            ${
                              isActive
                                ? "bg-primary/10 text-primary"
                                : isLocked
                                  ? "text-amber-600 border border-amber-300 shadow-sm"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }
                        `}
                      style={
                        isLocked && !isActive
                          ? {
                              background:
                                "linear-gradient(to right, #fef3c7, #fef9c3)",
                            }
                          : undefined
                      }
                    >
                      <Icon
                        size={18}
                        className={isLocked ? "text-amber-500" : ""}
                      />
                      <span className="hidden md:inline">{tool.label}</span>
                      {isLocked && (
                        <span className="flex items-center gap-0 ml-1 px-1 py-0 bg-amber-500 text-white rounded text-[8px] font-bold">
                          <Lock size={7} />
                          VIP
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Action Buttons - Right of Tabs */}
            <div className="flex items-center gap-2 z-20 shrink-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
              {/* Overwrite Toggle - Hidden for Split tool, Hidden on mobile */}
              {activeTool !== "split" && (
                <div className="hidden sm:flex bg-gray-100 rounded-xl p-0.5 border border-gray-200">
                  <button
                    onClick={() => setOverwriteMode(true)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all
                      ${
                        overwriteMode
                          ? "bg-white text-amber-600 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }
                    `}
                  >
                    上書き
                  </button>
                  <button
                    onClick={() => setOverwriteMode(false)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all
                      ${
                        !overwriteMode
                          ? "bg-white text-green-600 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }
                    `}
                  >
                    新規
                  </button>
                </div>
              )}

              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl shadow-sm transition-all"
                  title="この画像を削除"
                >
                  <Trash2 size={18} className="stroke-2" />
                </button>
              )}

              {/* Close Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2.5 bg-white border border-red-100 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl shadow-sm transition-all"
                  title="閉じる"
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="relative flex-1">
            {/* Navigation Buttons - Left */}
            {onPrev && (
              <button
                onClick={onPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 p-3 rounded-full bg-white/90 text-gray-500 shadow-xl hover:bg-white hover:text-primary transition-all hidden md:flex"
                title="前の画像"
              >
                <ChevronLeft size={36} strokeWidth={2.5} />
              </button>
            )}

            {/* Navigation Buttons - Right */}
            {onNext && (
              <button
                onClick={onNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 p-3 rounded-full bg-white/90 text-gray-500 shadow-xl hover:bg-white hover:text-primary transition-all hidden md:flex"
                title="次の画像"
              >
                <ChevronRight size={36} strokeWidth={2.5} />
              </button>
            )}

            <div className="glass-card rounded-[24px] md:rounded-[32px] p-4 md:p-6 h-[calc(100dvh-140px)] md:h-[calc(100dvh-160px)] lg:h-[640px] shadow-xl shadow-slate-200/50 block w-full border border-white/50 relative overflow-y-auto">
              {!image ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-full max-w-xl">
                    <FileDropzone
                      onFileSelect={handleFileSelect}
                      className="h-[300px] md:h-[400px]"
                    />
                    <p className="text-center text-gray-400 text-sm mt-4">
                      画像をドラッグ&ドロップして編集を開始
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300 h-full flex flex-col items-center w-full">
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

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-sm">
            <CheckCircle2 size={24} className="text-green-400" />
            <span className="font-bold text-sm whitespace-nowrap">
              {notification}
            </span>
          </div>
        </div>
      )}

      {isVipModalOpen && (
        <VipAuthModal
          isOpen={isVipModalOpen}
          onClose={() => setIsVipModalOpen(false)}
        />
      )}
    </div>
  );
}
