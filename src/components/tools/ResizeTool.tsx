"use client";

import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import { Scaling, RotateCcw, Check, Lock, Unlock } from "lucide-react";
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
  useEffect(() => {
    return () => {
        if (internalImage && internalImage.src.startsWith("blob:")) {
            URL.revokeObjectURL(internalImage.src);
        }
    };
  }, [internalImage]);

  // 画像ロード時の初期化
  const handleImageLoaded = useCallback(() => {
    if (canvasRef.current) {
        // canvasRef.current might be null in cleanup or race conditions, logic safe.
        // Assuming getImageData returns ImageData.
        try {
            const data = canvasRef.current.getImageData();
            if (data) {
                const { width, height } = data;
                setOriginalDimensions({ width, height });
                setTargetDimensions({ width, height });
                setSelectedPresetIndex(null);
            }
        } catch (e) {
            console.error("Failed to get image data", e);
        }
    }
  }, []);

  // サイズ入力ハンドラ
  const handleDimensionChange = (key: 'width' | 'height', value: number) => {
      setSelectedPresetIndex(null); // プリセット解除
      
      const safeValue = Math.min(Math.max(value, LIMITS.min), LIMITS.max); // 入力時はバリデーションせず、blurで整形する手もあるが、ここでは安全策
      
      if (keepAspectRatio && originalDimensions && originalDimensions.width > 0) {
          const aspect = originalDimensions.width / originalDimensions.height;
          if (key === 'width') {
              setTargetDimensions({
                  width: safeValue,
                  height: Math.round(safeValue / aspect)
              });
          } else {
              setTargetDimensions({
                  width: Math.round(safeValue * aspect),
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

  // プリセット適用
  const applyPreset = (index: number) => {
      const preset = PRESETS[index];
      setSelectedPresetIndex(index);
      setTargetDimensions({ width: preset.width, height: preset.height });
      // プリセット適用時はアスペクト比ロックを一時的に無視するか、あるいは強制的に解除するか？
      // ここでは「プリセットの比率」になるため、元画像のアスペクト比とは異なる場合が多い
      // なので、プリセット選択時は「アスペクト比維持」の拘束を受けない（またはアスペクト維持フラグはそのままに、値だけセットする）
      // ただし、その後widthをいじるとアスペクト比維持が効いて高さが変わる挙動になる。
      // ユーザーの意図としては「このサイズにしたい」なので、それでOK。
  };

  // プレビュー更新 (Canvasリサイズ)
  // リサイズは重い処理の可能性があるため、リアルタイムプレビューするか、適用ボタンで反映するか。
  // ここでは「適用前」の確認として、Canvas上の見た目は変えず、数値だけイジるスタイルにするか？
  // いや、他のツールに合わせてリアルタイムプレビューしたいが、リサイズはCanvasのサイズ自体が変わる。
  // ImageCanvasは画像を表示するものなので、imageDataを差し替えれば表示も変わる。
  // ただし、元画像を保持しておかないと劣化する。 -> handleImageLoadedでoriginalImageDataは保持していないが、canvasRef.getContext().getImageData()で取れる。
  // しかし、毎回Canvasから取得すると加工後の画像を取得してしまう。
  // 常に「元画像」からリサイズ計算する必要がある。
  
  // Refactor: originalImageDataをStateに持つ必要がある (CropTool同様)
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    if (originalDimensions && !originalImageData && canvasRef.current) {
         setOriginalImageData(canvasRef.current.getImageData());
    }
  }, [originalDimensions, canvasRef, originalImageData]); // Loop注意: originalDimensionsセット時に一回だけ取りたい

  // プレビュー反映
  // 入力が頻繁に変わると重いので、Debounceするか、あるいは「プレビュー」ボタンにするか。
  // 今回はCropなどと同様、useEffectで反応させるが、少しWaitを入れる。
  useEffect(() => {
      if (!originalImageData || !canvasRef.current) return;

      const timer = setTimeout(() => {
          // リサイズ実行
          const resized = resizeImage(originalImageData, targetDimensions.width, targetDimensions.height);
          
          const canvas = canvasRef.current!.getCanvas();
          if (canvas) {
              canvas.width = resized.width;
              canvas.height = resized.height;
              canvasRef.current!.putImageData(resized);
          }
      }, 100);

      return () => clearTimeout(timer);
  }, [targetDimensions, originalImageData, canvasRef]);


  // リセット
  const handleReset = () => {
    if (originalImageData && canvasRef.current) {
        setTargetDimensions({ width: originalImageData.width, height: originalImageData.height });
        setSelectedPresetIndex(null);
        
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
             
             <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                 <div className="space-y-1">
                     <label className="text-xs text-gray-400">幅 (W)</label>
                     <input
                         type="number"
                         value={targetDimensions.width}
                         onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                     />
                 </div>
                 <span className="text-gray-300 pt-5">×</span>
                 <div className="space-y-1">
                     <label className="text-xs text-gray-400">高さ (H)</label>
                     <input
                         type="number"
                         value={targetDimensions.height}
                         onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
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
