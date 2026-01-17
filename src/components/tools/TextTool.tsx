"use client";

import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import { Type, RotateCcw, Check, AlignCenter, Move } from "lucide-react";
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
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  const drawCurvedText = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number, curvature: number) => {
    // curvature: -100 (down/frown) to 100 (up/smile)
    // Radius inverse propertional.
    // Heuristic: Max curve (100) -> Radius ~ fontSize.
    const radius = Math.max(fontSize, 10000 / (Math.abs(curvature) + 1)); 
    
    // Angle per char + adjustments for spacing
    // Basic arc length per char is approx fontSize (or measured width).
    // Adding letterSpacing.
    const charWidth = fontSize + letterSpacing;
    const anglePerChar = charWidth / radius; 

    // Direction
    // Curvature > 0 (Smile): Text curves UP at ends. Center is BELOW.
    // Curvature < 0 (Frown): Text curves DOWN at ends. Center is ABOVE.
    const direction = curvature > 0 ? 1 : -1;
    
    // Center of the circle
    const cy = y + radius * direction;
    const cx = x;

    ctx.save();
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Centered index
        const charIndex = i - (text.length - 1) / 2;
        const angle = charIndex * anglePerChar; // Offset from vertical center line

        ctx.save();
        ctx.translate(cx, cy);

        if (direction > 0) {
            // Smile: Center is below. Text is on top rim.
            // 0 angle (vertical up) corresponds to -PI/2 in canvas rotation.
            // We rotate by `angle`.
            ctx.rotate(-Math.PI / 2 + angle);
            ctx.translate(0, -radius);
        } else {
            // Frown: Center is above. Text is on bottom rim.
            // 0 angle (vertical down) corresponds to +PI/2 in canvas.
            // We rotate by `-angle` (to match left-to-right reading).
            ctx.rotate(Math.PI / 2 + angle);
            ctx.translate(0, radius); 
             // Note: if we translate +radius, we go DOWN from center.
             // Text needs to be upright?
             // Usually Frown text is upright (readable).
             // If we just rotate + translate, the text base is at angle.
             // If we rotate PI/2 (down), text is sideways (pointing right).
             // We need to rotate text LOCAL to be upright.
             ctx.rotate(Math.PI); // Flip 180 to be readable
        }

        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    ctx.restore();
  }, [fontSize, letterSpacing]);

  // Draw text logic
  const drawDetails = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    // Reset canvas with image first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (!text) return;

    // Setup Text Style
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = (canvas.width * position.x) / 100;
    const y = (canvas.height * position.y) / 100;

    if (arch === 0) {
      // Normal Text
      // letterSpacing is supported in modern browsers
      if ('letterSpacing' in ctx) {
         ctx.letterSpacing = `${letterSpacing}px`;
      }
      ctx.fillText(text, x, y);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    } else {
      // Curved Text
      drawCurvedText(ctx, text, x, y, arch);
    }

  }, [canvasRef, image, text, fontSize, color, fontFamily, arch, position, letterSpacing, drawCurvedText]);

  // Re-draw on changes
  useEffect(() => {
    drawDetails();
  }, [drawDetails, text, fontSize, color, fontFamily, arch, position, letterSpacing, image]);

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
            <div className="relative flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200">
                <ImageCanvas
                    ref={canvasRef}
                    image={image}
                    showCheckerboard={true}
                    onImageLoaded={drawDetails}
                    className={`max-h-[500px] shadow-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
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
            
             <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-center">
                <Move size={14} />
                画像上のドラッグで位置を調整できます
            </div>

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
