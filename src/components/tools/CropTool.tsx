"use client";

import { useState, useRef, useCallback, useEffect, useMemo, type RefObject } from "react";
import { Crop, RotateCcw, Check } from "lucide-react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { cropImage } from "@/lib/image-utils";

interface CropBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface CropToolProps {
  className?: string;
  embeddedImage?: HTMLImageElement | null;
  embeddedCanvasRef?: RefObject<ImageCanvasHandle>;
  onApply?: (blob: Blob) => void;
}

export function CropTool({ className = "", embeddedImage, embeddedCanvasRef, onApply }: CropToolProps) {
  const [internalImage, setInternalImage] = useState<HTMLImageElement | null>(null);
  const internalCanvasRef = useRef<ImageCanvasHandle>(null);

  const image = embeddedImage !== undefined ? embeddedImage : internalImage;
  const canvasRef = embeddedCanvasRef || internalCanvasRef;
  const isEmbedded = embeddedImage !== undefined;

  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [cropBounds, setCropBounds] = useState<CropBounds | null>(null);
  const [manualCrop, setManualCrop] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [uniformCrop, setUniformCrop] = useState(0);

  // 画像読み込み
  const handleFileSelect = (file: File) => {
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
      setTimeout(() => {
        if (canvasRef.current) {
          const imageData = canvasRef.current.getImageData();
          setOriginalImageData(imageData);
          setCropBounds(null);
          setManualCrop({ top: 0, right: 0, bottom: 0, left: 0 });
          setUniformCrop(0);
        }
      }, 100);
    };
    img.src = url;
  };

  // Cleanup
  useEffect(() => {
      return () => {
          if (internalImage && internalImage.src.startsWith("blob:")) {
              URL.revokeObjectURL(internalImage.src);
          }
      };
  }, [internalImage]);

  // 画像ロード時の処理 (Embedded対応)
  const handleImageLoaded = useCallback(() => {
    const ref = embeddedCanvasRef || internalCanvasRef;
    if (ref.current) {
      const imageData = ref.current.getImageData();
      setOriginalImageData(imageData);
      setCropBounds(null);
      setManualCrop({ top: 0, right: 0, bottom: 0, left: 0 });
    }
  }, [embeddedCanvasRef]);



  // 手動入力からの cropBounds 計算 (useMemo でメモ化)
  const computedCropBounds = useMemo(() => {
    if (!originalImageData) return cropBounds;
    return {
      top: manualCrop.top,
      right: originalImageData.width - manualCrop.right - 1,
      bottom: originalImageData.height - manualCrop.bottom - 1,
      left: manualCrop.left,
    };
  }, [originalImageData, manualCrop, cropBounds]);

  // プレビュー更新
  useEffect(() => {
    if (!originalImageData || !computedCropBounds || !canvasRef.current) return;

    const cropped = cropImage(
      originalImageData,
      computedCropBounds.top,
      computedCropBounds.right,
      computedCropBounds.bottom,
      computedCropBounds.left
    );

    // Canvas サイズを更新して描画
    if (cropped && canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();
      if (canvas) {
        canvas.width = cropped.width;
        canvas.height = cropped.height;
        canvasRef.current.putImageData(cropped);
      }
    }
  }, [computedCropBounds, originalImageData, canvasRef]);

  // リセット
  const handleReset = () => {
    if (originalImageData && canvasRef.current && image) {
      canvasRef.current.reset();
      setCropBounds(null);
      setManualCrop({ top: 0, right: 0, bottom: 0, left: 0 });
      setUniformCrop(0);
    }
  };

  // ダウンロード


  // 適用 (Unified Editor用)
  const handleApply = async () => {
    if (!canvasRef.current || !onApply) return;
    const blob = await canvasRef.current.toBlob("image/png");
    if (blob) onApply(blob);
  };

  // 入力ハンドラー
  const handleManualChange = (key: keyof typeof manualCrop, value: number) => {
    setManualCrop((prev) => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-8 items-start h-full ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {!image ? (
          <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
        ) : (
            <div className="relative flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200">
              <ImageCanvas
                ref={canvasRef}
                image={image}
                showCheckerboard={true}
                onImageLoaded={handleImageLoaded}
                className="max-h-[500px] shadow-lg"
              />

            </div>
          )}
      </div>

      {/* Controls Panel */}
      {image && (
        <div className="w-full lg:w-80 h-full max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Crop size={20} />
            余白カット設定
          </h3>



          {/* Uniform Crop Slider */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
             <label className="text-sm font-bold text-text-sub flex items-center justify-between">
               一括カット (px)
               <span className="text-primary font-bold">{uniformCrop}px</span>
             </label>
             <input
               type="range"
               min="0"
               max="100" // reasonable default, or use image dimension / 2
               value={uniformCrop}
               onChange={(e) => {
                   const val = parseInt(e.target.value);
                   setUniformCrop(val);
                   setManualCrop({ top: val, right: val, bottom: val, left: val });
               }}
               className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
             />
          </div>

          {/* Manual Input */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-text-sub">カット量 (px)</p>
            <div className="grid grid-cols-2 gap-3">
              {(["top", "right", "bottom", "left"] as const).map((side) => (
                <div key={side} className="space-y-1">
                  <label className="text-xs text-gray-400 capitalize">
                    {side === "top" ? "上" : side === "right" ? "右" : side === "bottom" ? "下" : "左"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualCrop[side]}
                    onChange={(e) => handleManualChange(side, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Size Info */}
          {originalImageData && computedCropBounds && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-text-sub space-y-1">
              <p>
                元サイズ: {originalImageData.width} × {originalImageData.height} px
              </p>
              <p className="font-bold text-primary">
                新サイズ: {computedCropBounds.right - computedCropBounds.left + 1} × {computedCropBounds.bottom - computedCropBounds.top + 1} px
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {isEmbedded && onApply && (
              <button
                onClick={handleApply}
                className="w-full btn-primary flex items-center justify-center gap-1"
              >
                <Check size={18} />
                適用
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              リセット
            </button>
            {!isEmbedded && (
                <button
                onClick={() => setInternalImage(null)}
                className="w-full btn-secondary"
                >
                別の画像を選ぶ
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
