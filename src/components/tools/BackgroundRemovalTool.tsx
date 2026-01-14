"use client";

import { useState, useRef, useCallback, useEffect, type RefObject } from "react";
import { Download, Pipette, RotateCcw, Trash2 } from "lucide-react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { removeBackground, rgbToHex, hexToRgb, type RGBColor } from "@/lib/image-utils";

interface BackgroundRemovalToolProps {
  className?: string;
  embeddedImage?: HTMLImageElement | null;
  embeddedCanvasRef?: RefObject<ImageCanvasHandle>;
  onApply?: (blob: Blob) => void;
}

export function BackgroundRemovalTool({ className = "", embeddedImage, embeddedCanvasRef, onApply }: BackgroundRemovalToolProps) {
  const [internalImage, setInternalImage] = useState<HTMLImageElement | null>(null);
  const internalCanvasRef = useRef<ImageCanvasHandle>(null);

  const image = embeddedImage !== undefined ? embeddedImage : internalImage;
  const canvasRef = embeddedCanvasRef || internalCanvasRef;
  const isEmbedded = embeddedImage !== undefined;

  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [targetColor, setTargetColor] = useState<RGBColor>({ r: 255, g: 255, b: 255 });
  const [tolerance, setTolerance] = useState(30);
  const [feather, setFeather] = useState(0);
  const [isEyedropperActive] = useState(true); // 将来的に切り替え機能をつけるなら setIsEyedropperActive も必要だが現状はtrue固定
  const [isProcessing, setIsProcessing] = useState(false);

  // 画像読み込み
  const handleFileSelect = useCallback((file: File) => {
    const img = new Image();
    img.onload = () => {
      if (!isEmbedded) setInternalImage(img);
    };
    img.src = URL.createObjectURL(file);
  }, [isEmbedded]);

  // ImageCanvas 描画完了後の処理
  const handleImageLoaded = useCallback(() => {
      if (canvasRef.current) {
          const imageData = canvasRef.current.getImageData();
          setOriginalImageData(imageData);
      }
  }, [canvasRef]);

  // スポイトで色を取得
  const handleCanvasClick = useCallback(
    (_x: number, _y: number, color: { r: number; g: number; b: number; a: number }) => {
      if (!isEyedropperActive) return;
      setTargetColor({ r: color.r, g: color.g, b: color.b });
    },
    [isEyedropperActive]
  );

  // 背景削除処理
  const processRemoval = useCallback(() => {
    if (!originalImageData || !canvasRef.current) return;

    setIsProcessing(true);

    // 非同期で処理してUIをブロックしない
    requestAnimationFrame(() => {
      const result = removeBackground(originalImageData, targetColor, tolerance, feather);
      canvasRef.current?.putImageData(result);
      setIsProcessing(false);
    });
  }, [originalImageData, targetColor, tolerance, feather, canvasRef]);

  // パラメータ変更時に自動で処理を実行
  useEffect(() => {
    if (originalImageData && image) {
      const timeoutId = setTimeout(processRemoval, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [targetColor, tolerance, feather, originalImageData, image, processRemoval]);

  // リセット
  const handleReset = useCallback(() => {
    if (originalImageData && canvasRef.current) {
      canvasRef.current.putImageData(originalImageData);
    }
    setTolerance(30);
    setFeather(0);
    setTargetColor({ r: 255, g: 255, b: 255 });
  }, [originalImageData, canvasRef]);

  // 画像クリア
  const handleClear = useCallback(() => {
    if (!isEmbedded) setInternalImage(null);
    setOriginalImageData(null);
  }, [isEmbedded]);

  // ダウンロード
  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;

    const blob = await canvasRef.current.toBlob("image/png");
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "background_removed.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [canvasRef]);

  // 適用 (Unified Editor用)
  const handleApply = useCallback(async () => {
    if (!canvasRef.current || !onApply) return;
    const blob = await canvasRef.current.toBlob("image/png");
    if (blob) onApply(blob);
  }, [onApply, canvasRef]);

  // Hex 入力からの色更新
  const handleHexChange = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      setTargetColor(rgb);
    }
  }, []);

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
                image={image} // 画像をPropsとして渡す
                showCheckerboard={true}
                onCanvasClick={handleCanvasClick}
                onImageLoaded={handleImageLoaded}
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
        <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-text-main">設定</h3>

          {/* Color Picker */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-text-sub flex items-center gap-2">
              <Pipette size={16} />
              削除する色
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border-2 border-gray-200 shadow-inner shrink-0"
                style={{ backgroundColor: rgbToHex(targetColor.r, targetColor.g, targetColor.b) }}
              />
              <input
                type="text"
                value={rgbToHex(targetColor.r, targetColor.g, targetColor.b)}
                onChange={(e) => handleHexChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="#FFFFFF"
              />
            </div>
            <p className="text-xs text-gray-400">
              {isEyedropperActive ? "画像をクリックして色を選択" : ""}
            </p>
          </div>

          {/* Tolerance Slider */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-text-sub flex items-center justify-between">
              許容値
              <span className="text-primary font-bold">{tolerance}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-gray-400">
              値が大きいほど似た色も削除されます
            </p>
          </div>

          {/* Feather Slider */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-text-sub flex items-center justify-between">
              境界ぼかし
              <span className="text-primary font-bold">{feather}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-gray-400">
              エッジを滑らかにします
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {isEmbedded && onApply && (
              <button
                onClick={handleApply}
                className="w-full btn-primary flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                適用して次へ
              </button>
            )}
            <button
              onClick={handleDownload}
              className="w-full btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Download size={20} />
              ダウンロード
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 btn-secondary flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw size={16} />
                リセット
              </button>
              <button
                onClick={handleClear}
                className="flex-1 btn-secondary flex items-center justify-center gap-1.5 whitespace-nowrap text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
                クリア
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
