"use client";

import { useState, useRef, useEffect, type RefObject } from "react";
import { Type, RotateCcw, Check, AlignCenter } from "lucide-react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCanvas, type ImageCanvasHandle } from "@/components/shared/ImageCanvas";

interface TextToolProps {
  className?: string;
  embeddedImage?: HTMLImageElement | null;
  embeddedCanvasRef?: RefObject<ImageCanvasHandle>;
  onApply?: (blob: Blob) => void;
}

const FONTS = [
  { label: "ゴシック", value: "sans-serif" },
  { label: "明朝", value: "serif" },
  { label: "手書き風", value: "'Yomogi', cursive" },
  { label: "丸文字", value: "'Kosugi Maru', sans-serif" },
];

export function TextTool({ className = "", embeddedImage, embeddedCanvasRef, onApply }: TextToolProps) {
  const [internalImage, setInternalImage] = useState<HTMLImageElement | null>(null);
  const internalCanvasRef = useRef<ImageCanvasHandle>(null);

  const image = embeddedImage !== undefined ? embeddedImage : internalImage;
  const canvasRef = embeddedCanvasRef || internalCanvasRef;
  const isEmbedded = embeddedImage !== undefined;

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [color, setColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [arch, setArch] = useState(0); // -100 to 100
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage 0-100
  const [letterSpacing, setLetterSpacing] = useState(0); // px

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  // Draw text logic
  const drawDetails = () => {
    const canvas = canvasRef.current?.getCanvas();
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    // Reset canvas with image first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (!text) return;

    // Helper for curved text
    const drawCurvedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, curvature: number) => {
        const radius = Math.max(fontSize, 10000 / (Math.abs(curvature) + 1)); 
        const charWidth = fontSize + letterSpacing;
        const anglePerChar = charWidth / radius; 
        const direction = curvature > 0 ? 1 : -1;
        const cy = y + radius * direction;
        const cx = x;

        ctx.save();
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charIndex = i - (text.length - 1) / 2;
            const angle = charIndex * anglePerChar;

            ctx.save();
            ctx.translate(cx, cy);

            if (direction > 0) {
                ctx.rotate(-Math.PI / 2 + angle);
                ctx.translate(0, -radius);
            } else {
                ctx.rotate(Math.PI / 2 + angle);
                ctx.translate(0, radius); 
                ctx.rotate(Math.PI);
            }

            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    };

    // Setup Text Style
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = (canvas.width * position.x) / 100;
    const y = (canvas.height * position.y) / 100;

    if (arch === 0) {
      if ('letterSpacing' in ctx) {
         ctx.letterSpacing = `${letterSpacing}px`;
      }
      ctx.fillText(text, x, y);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      
      // Draw bounding box on hover
      if (isHovering && text) {
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize * 1.2;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - textWidth / 2 - 8, y - textHeight / 2 - 4, textWidth + 16, textHeight + 8);
        ctx.setLineDash([]);
      }
    } else {
      drawCurvedText(ctx, text, x, y, arch);
      
      // Draw center indicator on hover for curved text
      if (isHovering && text) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, fontSize * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

  };

  // Re-draw on changes
  useEffect(() => {
    drawDetails();
  });

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        if (!isEmbedded) {
            setInternalImage((prev) => {
                if (prev && prev.src.startsWith("blob:")) URL.revokeObjectURL(prev.src);
                return img;
            });
        }
    };
    img.src = url;
  };

  const handleReset = () => {
    setText("");
    setArch(0);
    setLetterSpacing(0);
    setPosition({ x: 50, y: 50 });
    if (canvasRef.current && image) {
        // Redraw Clean
        drawDetails();
    }
  };

  const handleApply = async () => {
    if (!canvasRef.current || !onApply) return;
    const blob = await canvasRef.current.toBlob("image/png");
    if (blob) onApply(blob);
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging || !canvasRef.current) return;
      const canvas = canvasRef.current.getCanvas();
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Calculate delta in canvas pixels
      // Actually simpler: Just calculate new position from mouse position
      const clientX = e.clientX;
      const clientY = e.clientY;

      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      
      // Convert to percentage
      const newX = Math.max(0, Math.min(100, (x / canvas.width) * 100));
      const newY = Math.max(0, Math.min(100, (y / canvas.height) * 100));

      setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  // Touch support for drag
  const handleTouchStart = () => {
      setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDragging || !canvasRef.current) return;
      
      const touch = e.touches[0];
      const canvas = canvasRef.current.getCanvas();
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      const newX = Math.max(0, Math.min(100, (x / canvas.width) * 100));
      const newY = Math.max(0, Math.min(100, (y / canvas.height) * 100));

      setPosition({ x: newX, y: newY });
  };


  return (
    <div className={`flex flex-col lg:flex-row gap-8 items-start h-full ${className}`}>
      {/* Canvas */}
      <div className="flex-1 flex flex-col">
          {!image ? (
            <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
          ) : (
            <div 
              className="relative flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => { handleMouseUp(); setIsHovering(false); }}
            >
                <ImageCanvas
                    ref={canvasRef}
                    image={image}
                    showCheckerboard={true}
                    onImageLoaded={drawDetails}
                    className={`max-h-[500px] shadow-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                />
            </div>
          )}
      </div>

      {/* Controls */}
      {image && (
        <div className="w-full lg:w-80 h-full max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Type size={20} />
                文字入れ
            </h3>
            


            {/* Main Input */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-text-sub">テキスト</label>
                <input 
                    type="text" 
                    value={text} 
                    onChange={e => setText(e.target.value)}
                    placeholder="ここに文字を入力"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            {/* Font Select */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-text-sub">フォント</label>
                <select
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    style={{ fontFamily: fontFamily }}
                >
                    {FONTS.map(f => (
                        <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                    ))}
                </select>
            </div>

            {/* Color & Size */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-sub">カラー</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400 font-mono">{color.toUpperCase()}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-sub">サイズ</label>
                    <input 
                        type="number"
                        min="10"
                        max="200"
                        value={fontSize}
                        onChange={e => setFontSize(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Spacing */}
             <div className="space-y-2">
                <label className="text-sm font-bold text-text-sub flex justify-between">
                    文字間隔
                    <span className="text-primary font-bold">{letterSpacing}px</span>
                </label>
                <input 
                    type="range"
                    min="-20"
                    max="100"
                    value={letterSpacing}
                    onChange={e => setLetterSpacing(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
                />
            </div>

            {/* Arch Slider */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-bold text-text-sub flex items-center justify-between">
                    アーチ (変形)
                    <span className="text-primary font-bold">{arch}</span>
                </label>
                <input 
                    type="range"
                    min="-100"
                    max="100"
                    value={arch}
                    onChange={e => setArch(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                    <span>下へ</span>
                    <span>なし</span>
                    <span>上へ</span>
                </div>
            </div>

            {/* Position Manual Sliders */}
            <div className="space-y-3 pt-2 opacity-50 hover:opacity-100 transition-opacity">
                 <label className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <AlignCenter size={12} />
                    微調整 (%)
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <input 
                            type="range" min="0" max="100" value={position.x}
                            onChange={e => setPosition(p => ({ ...p, x: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-400"
                        />
                    </div>
                    <div className="space-y-1">
                        <input 
                            type="range" min="0" max="100" value={position.y}
                            onChange={e => setPosition(p => ({ ...p, y: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-400"
                        />
                    </div>
                </div>
            </div>

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
           </div>
        </div>
      )}
    </div>
  );
}
