"use client";

import { useState, useRef, useCallback, useEffect, type RefObject } from "react";
import { Pipette, RotateCcw, Check, Eraser } from "lucide-react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";
import { removeBackground, rgbToHex, hexToRgb, type RGBColor } from "@/lib/image-utils";
import { useVipStatus } from "@/hooks/useVipStatus";
import { VipAuthModal } from "@/components/gallery/VipAuthModal";
import dynamic from "next/dynamic";

const EraserCursor = dynamic(() => import('./EraserCursor').then(mod => mod.EraserCursor), { ssr: false });

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
  const [hexInput, setHexInput] = useState("#ffffff");
  const [tolerance, setTolerance] = useState(0);
  const [feather, setFeather] = useState(0);
  const [isEyedropperActive] = useState(true); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [clickFeedback, setClickFeedback] = useState<{ x: number; y: number; color: string } | null>(null);

  // Eraser / VIP State
  const { isVip } = useVipStatus();
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [mode, setMode] = useState<'auto' | 'eraser'>('auto');
  const [eraserSize, setEraserSize] = useState(20);
  const isDrawingRef = useRef(false);

  // 画像読み込み
  const handleFileSelect = useCallback((file: File) => {
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

  useEffect(() => {
      return () => {
          if (internalImage && internalImage.src.startsWith("blob:")) {
              URL.revokeObjectURL(internalImage.src);
          }
      };
  }, [internalImage]);

  // ImageCanvas 描画完了後の処理
  const handleImageLoaded = useCallback(() => {
      if (canvasRef.current) {
          const imageData = canvasRef.current.getImageData();
          setOriginalImageData(imageData);
      }
  }, [canvasRef]);

  // Default color from top-left pixel
  useEffect(() => {
    if (originalImageData) {
        const { width, data } = originalImageData;
        if (width > 0) {
            const x = 0;
            const y = 0;
            const idx = (y * width + x) * 4;
            if (idx < data.length) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                setTimeout(() => setTargetColor({ r, g, b }), 0);
            }
        }
    }
  }, [originalImageData]);

  // Sync Input with Color
  useEffect(() => {
    setHexInput(rgbToHex(targetColor.r, targetColor.g, targetColor.b));
  }, [targetColor]);

  // Eraser Logic
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
  };

  const handleEraserMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || mode !== 'eraser' || !canvasRef.current) return;
      const canvas = canvasRef.current.getCanvas();
      const ctx = canvasRef.current.getContext();
      if (!canvas || !ctx) return;
      
      const { x, y } = getCanvasCoordinates(e, canvas);
      
      // Calculate canvas scale for proper brush size
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaledBrushRadius = (eraserSize / 2) * scaleX;
      
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, scaledBrushRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
  };

  const handleEraserDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (mode !== 'eraser') return;
      isDrawingRef.current = true;
      handleEraserMove(e);
  };
  
  const handleEraserUp = () => {
      isDrawingRef.current = false;
  };

  // Eyedropper
  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (!isEyedropperActive || mode === 'eraser') return;

      if (originalImageData) {
        const index = (y * originalImageData.width + x) * 4;
        if (index >= 0 && index < originalImageData.data.length) {
            const r = originalImageData.data[index];
            const g = originalImageData.data[index + 1];
            const b = originalImageData.data[index + 2];
            setTargetColor({ r, g, b });
            
            const pickedHex = rgbToHex(r, g, b);
            setClickFeedback({ x, y, color: pickedHex });
            setTimeout(() => setClickFeedback(null), 1000);
            return;
        }
      }
    },
    [isEyedropperActive, originalImageData, mode]
  );

  // Auto Processing
  useEffect(() => {
    if (originalImageData && image && mode === 'auto') {
      const processRemoval = () => {
        if (!originalImageData || !canvasRef.current) return;
  
        setIsProcessing(true);
  
        requestAnimationFrame(() => {
          const result = removeBackground(originalImageData, targetColor, tolerance, feather);
          canvasRef.current?.putImageData(result);
          setIsProcessing(false);
        });
      };

      const timeoutId = setTimeout(processRemoval, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [targetColor, tolerance, feather, originalImageData, image, canvasRef, mode]);

  const handleReset = () => {
    if (originalImageData && canvasRef.current) {
      canvasRef.current.putImageData(originalImageData);
    }
    setTolerance(0);
    setFeather(0);
    setTargetColor({ r: 255, g: 255, b: 255 });
  };

  const handleApply = async () => {
    if (!canvasRef.current || !onApply) return;
    const blob = await canvasRef.current.toBlob("image/png");
    if (blob) onApply(blob);
  };

  const handleHexChange = useCallback((hex: string) => {
    setHexInput(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      setTargetColor(rgb);
    }
  }, []);

  return (
    <div className={`flex flex-col lg:flex-row gap-8 items-center lg:items-start h-auto lg:h-full w-full ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col w-full">
        {!image ? (
          <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
        ) : (
            <div className={`relative flex-1 lg:flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200 cursor-none min-h-[280px] max-h-[400px] lg:max-h-none`}>
              <ImageCanvas
                ref={canvasRef}
                image={image}
                showCheckerboard={true}
                onCanvasClick={handleCanvasClick}
                onImageLoaded={handleImageLoaded}
                className={`max-h-[500px] shadow-lg ${mode === 'eraser' ? 'cursor-none' : 'cursor-crosshair'}`}
                onMouseDown={handleEraserDown}
                onMouseMove={(e) => {
                    handleEraserMove(e);
                    // Update cursor position if needed logic here
                }}
                onMouseUp={handleEraserUp}
                onMouseLeave={handleEraserUp}
                onTouchStart={handleEraserDown}
                onTouchMove={handleEraserMove}
                onTouchEnd={handleEraserUp}
              />

              {clickFeedback && (
                <div 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  <div 
                    className="w-6 h-6 rounded-lg border-2 border-gray-200 shrink-0" 
                    style={{ backgroundColor: clickFeedback.color }}
                  />
                  <span className="text-sm font-mono font-bold text-gray-700">
                    {clickFeedback.color.toUpperCase()}
                  </span>
                  <Pipette size={14} className="text-gray-400" />
                </div>
              )}
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
          <h3 className="text-lg font-bold text-text-main">設定</h3>

          {/* Mode Switch */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button
                  onClick={() => setMode('auto')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'auto' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  <Pipette size={16} />
                  自動削除
              </button>
              <button
                  onClick={() => setMode('eraser')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === 'eraser' 
                      ? 'bg-white shadow text-purple-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                  <Eraser size={16} />
                  消しゴム
              </button>
          </div>

          {mode === 'auto' ? (
            <>
              {/* Color Picker */}
              <div className="space-y-3 animate-in fade-in duration-300">
                <label className="text-sm font-bold text-text-sub flex items-center gap-2">
                  <Pipette size={16} />
                  削除する色
                </label>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <div
                    className="w-full sm:w-12 h-12 rounded-xl border-2 border-gray-200 shadow-inner shrink-0"
                    style={{ backgroundColor: rgbToHex(targetColor.r, targetColor.g, targetColor.b) }}
                  />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="#FFFFFF"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {isEyedropperActive ? "画像をクリックして色を選択" : ""}
                </p>
              </div>

              {/* Tolerance Slider */}
              <div className="space-y-3 animate-in fade-in duration-300 delay-100">
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
              <div className="space-y-3 animate-in fade-in duration-300 delay-200">
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
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
                 <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-800">
                    <span className="font-bold block mb-1">手動消去モード</span>
                    なぞった部分を透明にします。
                 </div>

                 <div className="space-y-3">
                    <label className="text-sm font-bold text-text-sub flex items-center justify-between">
                        ブラシサイズ
                        <span className="text-purple-600 font-bold">{eraserSize}px</span>
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="100"
                        value={eraserSize}
                        onChange={(e) => {
                            if (!isVip) {
                                setIsVipModalOpen(true);
                            } else {
                                setEraserSize(Number(e.target.value));
                            }
                        }}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                        disabled={!isVip}
                    />
                    {!isVip && (
                        <div 
                            className="p-3 rounded-xl border border-amber-300 shadow-sm flex items-center gap-2 justify-center"
                            style={{
                                background: 'linear-gradient(to right, #fef3c7, #fef9c3)'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span className="text-sm font-bold text-amber-600 whitespace-nowrap">ブラシサイズ調整可能</span>
                            <span className="flex items-center gap-0 px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                VIP
                            </span>
                        </div>
                    )}
                    <div className="flex justify-center h-24 items-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
                        <div 
                            className="bg-purple-400/50 rounded-full"
                            style={{ width: eraserSize, height: eraserSize }}
                        />
                    </div>
                 </div>
            </div>
          )}

          {/* Action Buttons */}
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

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                リセット
              </button>
            </div>
          </div>
        </div>
      )}
      {isVipModalOpen && <VipAuthModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} />}
      {mode === 'eraser' && <EraserCursor size={eraserSize} />}
    </div>
  );
}
