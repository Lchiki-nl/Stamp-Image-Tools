"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Download, Crop, Wand2, RotateCcw } from "lucide-react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { detectBoundingBox, cropImage } from "@/lib/image-utils";

interface CropBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface CropToolProps {
  className?: string;
}

export function CropTool({ className = "" }: CropToolProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [cropBounds, setCropBounds] = useState<CropBounds | null>(null);
  const [manualCrop, setManualCrop] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<ImageCanvasHandle>(null);

  // 画像読み込み
  const handleFileSelect = useCallback((file: File) => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.drawImage(img);
          const imageData = canvasRef.current.getImageData();
          setOriginalImageData(imageData);
          setCropBounds(null);
          setManualCrop({ top: 0, right: 0, bottom: 0, left: 0 });
        }
      }, 0);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  // 自動トリミング検出
  const handleAutoDetect = useCallback(() => {
    if (!originalImageData) return;

    setIsProcessing(true);

    requestAnimationFrame(() => {
      const bounds = detectBoundingBox(originalImageData);
      if (bounds) {
        setCropBounds(bounds);
        setManualCrop({
          top: bounds.top,
          right: originalImageData.width - bounds.right - 1,
          bottom: originalImageData.height - bounds.bottom - 1,
          left: bounds.left,
        });
      }
      setIsProcessing(false);
    });
  }, [originalImageData]);

  // 手動入力からの cropBounds 更新
  useEffect(() => {
    if (!originalImageData) return;

    const { width, height } = originalImageData;
    setCropBounds({
      top: manualCrop.top,
      right: width - manualCrop.right - 1,
      bottom: height - manualCrop.bottom - 1,
      left: manualCrop.left,
    });
  }, [manualCrop, originalImageData]);

  // プレビュー更新
  useEffect(() => {
    if (!originalImageData || !cropBounds || !canvasRef.current) return;

    const cropped = cropImage(
      originalImageData,
      cropBounds.top,
      cropBounds.right,
      cropBounds.bottom,
      cropBounds.left
    );

    // Canvas サイズを更新して描画
    const canvas = canvasRef.current.getCanvas();
    if (canvas) {
      canvas.width = cropped.width;
      canvas.height = cropped.height;
      canvasRef.current.putImageData(cropped);
    }
  }, [cropBounds, originalImageData]);

  // リセット
  const handleReset = useCallback(() => {
    if (originalImageData && canvasRef.current && image) {
      canvasRef.current.drawImage(image);
      setCropBounds(null);
      setManualCrop({ top: 0, right: 0, bottom: 0, left: 0 });
    }
  }, [originalImageData, image]);

  // ダウンロード
  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;

    const blob = await canvasRef.current.toBlob("image/png");
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cropped.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // 入力ハンドラー
  const handleManualChange = (key: keyof typeof manualCrop, value: number) => {
    setManualCrop((prev) => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {!image ? (
          <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
        ) : (
          <div className="relative flex-1 flex items-center justify-center bg-gray-100 rounded-2xl p-4 min-h-[400px]">
            <ImageCanvas
              ref={canvasRef}
              showCheckerboard={true}
              className="max-h-[500px] shadow-lg"
            />
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
        <div className="w-full lg:w-72 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Crop size={20} />
            余白カット設定
          </h3>

          {/* Auto Detect Button */}
          <button
            onClick={handleAutoDetect}
            disabled={isProcessing}
            className="w-full btn-secondary flex items-center justify-center gap-2 bg-orange-100 text-orange-600 hover:bg-orange-200"
          >
            <Wand2 size={18} />
            自動検出
          </button>

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
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Size Info */}
          {originalImageData && cropBounds && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-text-sub space-y-1">
              <p>
                元サイズ: {originalImageData.width} × {originalImageData.height} px
              </p>
              <p className="font-bold text-primary">
                新サイズ: {cropBounds.right - cropBounds.left + 1} × {cropBounds.bottom - cropBounds.top + 1} px
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleDownload}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Download size={20} />
              ダウンロード
            </button>
            <button
              onClick={handleReset}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              リセット
            </button>
            <button
              onClick={() => setImage(null)}
              className="w-full btn-secondary"
            >
              別の画像を選ぶ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
