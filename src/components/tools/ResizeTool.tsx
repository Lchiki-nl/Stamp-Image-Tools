"use client";

import { useState, useRef, useEffect, type RefObject } from 'react';
import { Scaling, RotateCcw, Check, Lock, Unlock, MoveHorizontal } from "lucide-react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { resizeImage } from "@/lib/image-utils";

interface ResizeToolProps {
  className?: string;
  embeddedImage?: HTMLImageElement | null;
  embeddedCanvasRef?: RefObject<ImageCanvasHandle>;
  onApply?: (blob: Blob) => void;
}

const PRESETS = [
    { label: "メイン", width: 240, height: 240 },
    { label: "スタンプ", width: 370, height: 320 },
    { label: "タブ", width: 96, height: 74 },
    { label: "絵文字", width: 180, height: 180 },
];

const LIMITS = { min: 10, max: 4096 };

export function ResizeTool({ className = "", embeddedImage, embeddedCanvasRef, onApply }: ResizeToolProps) {
  const [internalImage, setInternalImage] = useState<HTMLImageElement | null>(null);
  const internalCanvasRef = useRef<ImageCanvasHandle>(null);

  const image = embeddedImage !== undefined ? embeddedImage : internalImage;
  const canvasRef = embeddedCanvasRef || internalCanvasRef;
  const isEmbedded = embeddedImage !== undefined;

  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetDimensions, setTargetDimensions] = useState({ width: 0, height: 0 });
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [isTabPaddingMode, setIsTabPaddingMode] = useState(false);

  // 画像読み込みハンドラ
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
    };
    img.src = url;
  };

  // Cleanup
  // Refactor: originalImageDataをStateに持つ必要がある (CropTool同様)
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);

  // Prop/State変更検知用の追跡ステート
  const [prevImage, setPrevImage] = useState<HTMLImageElement | null>(null);

  // 画像変更時に状態をリセット (Render Phaseでの更新 - 推奨パターン)
  if (image !== prevImage) {
    setPrevImage(image);
    setOriginalDimensions(null);
    setOriginalImageData(null);
    setTargetDimensions({ width: 0, height: 0 });
    setSelectedPresetIndex(null);
    setIsTabPaddingMode(false);
    // 内部画像のリセットはここで行わない（無限ループ防止のため、必要な場合のみ管理）
  }

  // 画像データ初期化 (ソース画像から直接生成)
  useEffect(() => {
      if (!image) return;

      const init = () => initFromImage(image);

      // 画像がロード完了しているか確認
      if (image.complete && image.naturalWidth > 0) {
          init();
      } else {
          image.addEventListener('load', init, { once: true });
      }

      function initFromImage(img: HTMLImageElement) {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(img, 0, 0);
              const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
              
              // 状態更新
              setOriginalImageData(data);
              setOriginalDimensions({ width: data.width, height: data.height });
              
              setTargetDimensions(() => {
                  // リセット直後なので常に設定する (prevは使用しない)
                  return { width: data.width, height: data.height };
              });
          }
      }

      return () => {
          image.removeEventListener('load', init);
      };
  }, [image]);

  // Canvasのロード完了ハンドラ（表示用）
  const handleImageLoaded = () => {
    // 表示用Canvasの準備ができても、データソースは上記のuseEffectで管理するため
    // ここでは特別な処理は不要だが、もし同期ズレがある場合の保険として残す
  };

  // サイズ入力ハンドラ
  const handleDimensionChange = (key: 'width' | 'height', value: number) => {
      setSelectedPresetIndex(null);
      setIsTabPaddingMode(false);
      
      // 入力中は最小1、最大のみ制限して、タイピングを邪魔しない
      const safeValue = Math.min(Math.max(value, 1), LIMITS.max);
      
      if (keepAspectRatio && originalDimensions && originalDimensions.width > 0) {
          const aspect = originalDimensions.width / originalDimensions.height;
          if (key === 'width') {
              setTargetDimensions({
                  width: safeValue,
                  height: Math.max(1, Math.round(safeValue / aspect))
              });
          } else {
              setTargetDimensions({
                  width: Math.max(1, Math.round(safeValue * aspect)),
                  height: safeValue
              });
          }
      } else {
          setTargetDimensions(prev => ({
              ...prev,
              [key]: safeValue
          }));
      }
  };

  const handleBlur = () => {
      // Blur時に厳格な制限 (LIMITS) を適用
      setTargetDimensions(prev => ({
          width: Math.min(Math.max(prev.width, LIMITS.min), LIMITS.max),
          height: Math.min(Math.max(prev.height, LIMITS.min), LIMITS.max)
      }));
  };

  // プリセット適用
  const applyPreset = (index: number) => {
      const preset = PRESETS[index];
      setSelectedPresetIndex(index);
      
      // タブ(96x74)の場合は自動的にタブ余白モードを有効化
      const isTab = preset.label === "タブ";
      setIsTabPaddingMode(isTab);
      
      setTargetDimensions({ width: preset.width, height: preset.height });
  };
  
  // プレビュー更新 (Canvasリサイズ)
  useEffect(() => {
      if (!originalImageData || !canvasRef.current) return;
      
      // サイズが0の場合はスキップ
      if (targetDimensions.width === 0 || targetDimensions.height === 0) return;

      const timer = setTimeout(() => {
          const canvas = canvasRef.current!.getCanvas();
          if (!canvas) return;

          if (isTabPaddingMode) {
              // 特殊モード: 74x74にリサイズして96x74の中央に配置
              const innerSize = 74;
              const resized = resizeImage(originalImageData, innerSize, innerSize);
              
              canvas.width = 96;
              canvas.height = 74;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  // Canvasはリサイズ時にクリアされるが、念のため
                  ctx.clearRect(0, 0, 96, 74);
                  // 中央配置 (左右余白 11px)
                  const x = Math.floor((96 - innerSize) / 2);
                  const y = Math.floor((74 - innerSize) / 2);
                  ctx.putImageData(resized, x, y);
              }
          } else {
              // 通常リサイズ実行
              const resized = resizeImage(originalImageData, targetDimensions.width, targetDimensions.height);
              canvas.width = resized.width;
              canvas.height = resized.height;
              canvasRef.current!.putImageData(resized);
          }
      }, 100);

      return () => clearTimeout(timer);
  }, [targetDimensions, originalImageData, canvasRef, isTabPaddingMode]);


  // リセット
  const handleReset = () => {
    if (originalImageData && canvasRef.current) {
        setTargetDimensions({ width: originalImageData.width, height: originalImageData.height });
        setSelectedPresetIndex(null);
        setIsTabPaddingMode(false);
        
        const canvas = canvasRef.current.getCanvas();
        if (canvas) {
            canvas.width = originalImageData.width;
            canvas.height = originalImageData.height;
            canvasRef.current.putImageData(originalImageData);
        }
    }
  };

  // 適用
  const handleApply = async () => {
    if (!canvasRef.current || !onApply) return;
    const blob = await canvasRef.current.toBlob("image/png");
    if (blob) onApply(blob);
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-8 items-center lg:items-start h-auto lg:h-full w-full ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col w-full">
        {!image ? (
          <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
        ) : (
            <div className="relative flex-1 lg:flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200 min-h-[280px] max-h-[400px] lg:max-h-none">
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
        <div className="w-full lg:w-80 h-auto lg:h-full lg:max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Scaling size={20} />
            サイズ変更
          </h3>

          {/* Presets */}
          <div className="space-y-3">
             <label className="text-sm font-bold text-text-sub">プリセット</label>
             <div className="grid grid-cols-2 gap-2">
                 {PRESETS.map((preset, idx) => (
                     <button
                         key={preset.label}
                         onClick={() => applyPreset(idx)}
                         className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all
                             ${selectedPresetIndex === idx 
                                 ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                                 : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}
                         `}
                     >
                         <div className="flex flex-col items-center gap-1">
                             <span>{preset.label}</span>
                             <span className="text-[10px] opacity-80 font-mono">{preset.width} x {preset.height}</span>
                         </div>
                     </button>
                 ))}
             </div>
          </div>

          <hr className="border-gray-100" />

          {/* Manual Input */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                 <label className="text-sm font-bold text-text-sub">カスタムサイズ</label>
                 <div className="flex items-center gap-2">
                     <button
                         onClick={() => {
                             setIsTabPaddingMode(!isTabPaddingMode);
                             if (!isTabPaddingMode) {
                                 // Enable mode
                                 setTargetDimensions({ width: 96, height: 74 });
                                 setSelectedPresetIndex(null);
                             }
                         }}
                         className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold
                             ${isTabPaddingMode ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}
                         `}
                         title="74x74にリサイズして左右に余白を追加します"
                     >
                         <MoveHorizontal size={14} />
                         タブ余白
                     </button>
                     <button
                         onClick={() => setKeepAspectRatio(!keepAspectRatio)}
                         className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold
                             ${keepAspectRatio ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}
                         `}
                         title="アスペクト比を維持"
                     >
                         {keepAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
                         {keepAspectRatio ? "比率固定" : "解除"}
                     </button>
                 </div>
             </div>
             
             <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr,auto,1fr] sm:gap-2 items-center">
                 <div className="space-y-1">
                     <label className="text-xs text-gray-400">幅 (W)</label>
                     <input
                         type="number"
                         value={targetDimensions.width || ''}
                         onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                         onBlur={handleBlur}
                         className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                     />
                 </div>

                 <div className="space-y-1">
                     <label className="text-xs text-gray-400">高さ (H)</label>
                     <input
                         type="number"
                         value={targetDimensions.height || ''}
                         onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                         onBlur={handleBlur}
                         className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                     />
                 </div>
             </div>
          </div>

          {/* Info */}
          {originalDimensions && (
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                  <p>元サイズ: {originalDimensions.width} × {originalDimensions.height} px</p>
                  <p>アスペクト比: {(originalDimensions.width / originalDimensions.height).toFixed(3)}</p>
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
