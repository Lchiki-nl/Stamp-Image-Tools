"use client";

import { useState, useRef, useCallback, useEffect, type RefObject } from "react";
import { Grid3X3, Check } from "lucide-react";

import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { splitImage } from "@/lib/image-utils";

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

  return (
    <div className={`flex flex-col lg:flex-row gap-8 items-start h-full ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {!image ? (
          <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
        ) : (
            <div className="relative flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200">
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
        <div className="w-full lg:w-80 h-full max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Grid3X3 size={20} />
            グリッド設定
          </h3>

          {/* Rows */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-text-sub flex items-center justify-between">
              行数
              <span className="text-primary font-bold text-lg">{rows}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Cols */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-text-sub flex items-center justify-between">
              列数
              <span className="text-primary font-bold text-lg">{cols}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

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
    </div>
  );
}
