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
  const [tolerance, setTolerance] = useState(0);
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
  const handleImageLoaded = () => {
      if (canvasRef.current) {
          const imageData = canvasRef.current.getImageData();
          setOriginalImageData(imageData);
      }
  };

  // 画像がロードされたら右上のピクセルをデフォルト色として取得
  useEffect(() => {
    if (originalImageData) {
        const { width, data } = originalImageData;
        // Top Right Pixel: (width - 1, 0)
        // ensure width > 0
        if (width > 0) {
            const x = width - 1;
            const y = 0;
            const idx = (y * width + x) * 4;
            if (idx < data.length) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // Prevent synchronous setState warning
                setTimeout(() => setTargetColor({ r, g, b }), 0);
            }
        }
    }
  }, [originalImageData]);

  // スポイトで色を取得
  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (!isEyedropperActive) return;

      // オリジナル画像データから色を取得 (透明化後の黒などを拾わないように)
      if (originalImageData) {
        const index = (y * originalImageData.width + x) * 4;
        if (index >= 0 && index < originalImageData.data.length) {
            const r = originalImageData.data[index];
            const g = originalImageData.data[index + 1];
            const b = originalImageData.data[index + 2];
            setTargetColor({ r, g, b });
            return;
        }
      }
      
      // Fallback (通常はCanvasClickで取得した色だが、基本ここには来ないはず)
      // setTargetColor({ r: color.r, g: color.g, b: color.b });
    },
    [isEyedropperActive, originalImageData]
  );

  // 背景削除処理


  // パラメータ変更時に自動で処理を実行
  useEffect(() => {
    if (originalImageData && image) {
      const processRemoval = () => {
        if (!originalImageData || !canvasRef.current) return;
  
        setIsProcessing(true);
  
        // 非同期で処理してUIをブロックしない
        requestAnimationFrame(() => {
          const result = removeBackground(originalImageData, targetColor, tolerance, feather);
          canvasRef.current?.putImageData(result);
          setIsProcessing(false);
        });
      };

      const timeoutId = setTimeout(processRemoval, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [targetColor, tolerance, feather, originalImageData, image, canvasRef]);

  // リセット
  const handleReset = () => {
    if (originalImageData && canvasRef.current) {
      canvasRef.current.putImageData(originalImageData);
    }
    setTolerance(0);
    setFeather(0);
    setTargetColor({ r: 255, g: 255, b: 255 });
  };

  // 画像クリア
  const handleClear = useCallback(() => {
    if (!isEmbedded) setInternalImage(null);
    setOriginalImageData(null);
  }, [isEmbedded]);

  // ダウンロード


  // 適用 (Unified Editor用)
  const handleApply = async () => {
    if (!canvasRef.current || !onApply) return;
    const blob = await canvasRef.current.toBlob("image/png");
    if (blob) onApply(blob);
  };

  // Hex 入力からの色更新
  const handleHexChange = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      setTargetColor(rgb);
    }
  }, []);

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
        <div className="w-full lg:w-80 h-full max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
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
