"use client";

import { useState, useRef, useCallback, useEffect, type RefObject } from "react";
import { Grid3X3, Check, Lock } from "lucide-react";

import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { splitImage } from "@/lib/image-utils";
import { useVipStatus } from "@/hooks/useVipStatus";
import { VipAuthModal } from "@/components/gallery/VipAuthModal";

interface ImageSplitToolProps {
  className?: string;
  embeddedImage?: HTMLImageElement | null;
  embeddedCanvasRef?: RefObject<ImageCanvasHandle>;
  onApply?: (blob: Blob | Blob[]) => void;
}

export function ImageSplitTool({ className = "", embeddedImage, embeddedCanvasRef, onApply }: ImageSplitToolProps) {
  const [internalImage, setInternalImage] = useState<HTMLImageElement | null>(null);
  const internalCanvasRef = useRef<ImageCanvasHandle>(null);

  const image = embeddedImage !== undefined ? embeddedImage : internalImage;
  const canvasRef = embeddedCanvasRef || internalCanvasRef;
  const isEmbedded = embeddedImage !== undefined;

  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("image");

  const { isVip } = useVipStatus();
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // 画像読み込み
  const handleFileSelect = useCallback((file: File) => {
    // ファイル名を保存 (拡張子を除く)
    const name = file.name.replace(/\.[^/.]+$/, "");
    setFileName(name);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (!isEmbedded) {
          setInternalImage((prev) => {
            if (prev && prev.src.startsWith("blob:")) {
                URL.revokeObjectURL(prev.src);
            }
            return img;
          });
      }
    };
    img.src = url;
  }, [isEmbedded]);

  // Cleanup
  useEffect(() => {
      return () => {
          if (internalImage && internalImage.src.startsWith("blob:")) {
              URL.revokeObjectURL(internalImage.src);
          }
      };
  }, [internalImage]);

  const handleImageLoaded = useCallback(() => {
     // 分割ツールは初期化処理不要だが、描画完了を確実にするためにコールバックを受け取る
  }, []);



  // 適用 (Unified Editor用)
  const handleApply = useCallback(async () => {
    const ref = embeddedCanvasRef || internalCanvasRef;
    if (!ref.current || !onApply) return;
    
    setIsProcessing(true);
    try {
        const imageData = ref.current.getImageData();
        if (!imageData) return;

        const splitParts = splitImage(imageData, rows, cols);
        const blobs: Blob[] = [];

        for (const part of splitParts) {
             const tempCanvas = document.createElement("canvas");
             tempCanvas.width = part.width;
             tempCanvas.height = part.height;
             const ctx = tempCanvas.getContext("2d");
             if (ctx) {
                 ctx.putImageData(part, 0, 0);
                 const blob = await new Promise<Blob | null>(r => tempCanvas.toBlob(r, "image/png"));
                 if (blob) blobs.push(blob);
             }
        }
        
        onApply(blobs);
    } finally {
        setIsProcessing(false);
    }
  }, [onApply, embeddedCanvasRef, rows, cols]);

  const handleGridChange = (value: number, setter: (val: number) => void) => {
    if (!isVip && value >= 4) {
      setIsVipModalOpen(true);
      return;
    }
    setter(value);
  };

  const renderSlider = (label: string, value: number, setter: (val: number) => void) => (
    <div className="space-y-3">
      <label className="text-sm font-bold text-text-sub flex items-center justify-between">
        {label}
        <span className="text-primary font-bold text-lg">{value}</span>
      </label>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => handleGridChange(Number(e.target.value), setter)}
        className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary touch-none"
      />
      <div className="flex justify-between items-end text-xs font-medium gap-1">
        <span className="text-gray-400 flex-1 text-center">1</span>
        <span className="text-gray-400 flex-1 text-center">2</span>
        <span className="text-gray-400 flex-1 text-center">3</span>
        <div className={`flex-1 flex flex-col items-center gap-1 ${!isVip ? 'pb-0.5' : ''}`}>
          {!isVip ? (
            <div 
              className="px-2 py-1 rounded-lg border border-amber-300 shadow-sm flex items-center gap-1"
              style={{
                background: 'linear-gradient(to right, #fef3c7, #fef9c3)'
              }}
            >
              <span className="text-amber-600 font-bold">4</span>
              <span className="flex items-center gap-0 px-1 py-0 bg-amber-500 text-white rounded text-[8px] font-bold">
                <Lock size={6} />
                VIP
              </span>
            </div>
          ) : (
            <span className="text-gray-400">4</span>
          )}
        </div>
        <div className={`flex-1 flex flex-col items-center gap-1 ${!isVip ? 'pb-0.5' : ''}`}>
          {!isVip ? (
            <div 
              className="px-2 py-1 rounded-lg border border-amber-300 shadow-sm flex items-center gap-1"
              style={{
                background: 'linear-gradient(to right, #fef3c7, #fef9c3)'
              }}
            >
              <span className="text-amber-600 font-bold">5</span>
              <span className="flex items-center gap-0 px-1 py-0 bg-amber-500 text-white rounded text-[8px] font-bold">
                <Lock size={6} />
                VIP
              </span>
            </div>
          ) : (
            <span className="text-gray-400">5</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col lg:flex-row gap-8 items-center lg:items-start h-auto lg:h-full w-full ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col w-full">
        {!image ? (
          <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
        ) : (
            <div className="relative flex-1 lg:flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200 min-h-[280px] max-h-[400px] lg:max-h-none">
              {/* Grid Overlay */}
              <div className="relative">
                <ImageCanvas
                  ref={canvasRef}
                  image={image}
                  showCheckerboard={false}
                  onImageLoaded={handleImageLoaded}
                  className="max-h-[500px] shadow-lg"
                />
                {/* Grid Lines Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                  style={{ overflow: "visible" }}
                >
                  {/* Vertical Lines */}
                  {Array.from({ length: cols - 1 }, (_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={`${((i + 1) / cols) * 100}%`}
                      y1="0"
                      x2={`${((i + 1) / cols) * 100}%`}
                      y2="100%"
                      stroke="#06C755"
                      strokeWidth="2"
                      strokeDasharray="8,4"
                    />
                  ))}
                  {/* Horizontal Lines */}
                  {Array.from({ length: rows - 1 }, (_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={`${((i + 1) / rows) * 100}%`}
                      x2="100%"
                      y2={`${((i + 1) / rows) * 100}%`}
                      stroke="#06C755"
                      strokeWidth="2"
                      strokeDasharray="8,4"
                    />
                  ))}
                </svg>
              </div>
              {isProcessing && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Controls Panel */}
      {image && (
        <div className="w-full lg:w-80 h-auto lg:h-full lg:max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Grid3X3 size={20} />
            グリッド設定
          </h3>

          {/* Rows */}
          {renderSlider("行数", rows, setRows)}

          {/* Cols */}
          {renderSlider("列数", cols, setCols)}

          {/* Preview Info */}
          <div className="bg-primary-light/50 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-primary">
              {rows * cols} 枚に分割されます
            </p>
            <p className="text-xs text-text-sub mt-1">
              ファイル名: {fileName}_行_列.png
            </p>
          </div>

          {/* Download Button */}
          {isEmbedded && onApply && (
             <button
                onClick={handleApply}
                className="w-full btn-primary flex items-center justify-center gap-1"
              >
                <Check size={18} />
                適用
              </button>
           )}


          {/* Clear Button */}
          {!isEmbedded && (
            <button
                onClick={() => setInternalImage(null)}
                className="w-full btn-secondary"
            >
                別の画像を選ぶ
            </button>
          )}
        </div>
      )}
      
      <VipAuthModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />
    </div>
  );
}
