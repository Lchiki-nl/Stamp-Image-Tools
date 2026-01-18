"use client";

import { useState, useRef, useEffect, type RefObject } from "react";
import { Type, RotateCcw, Check, AlignCenter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
  { label: "丸文字", value: "'Kosugi Maru'" },
  { label: "851ポップ", value: "'851MkPOP'" },
  { label: "コーポレート・ロゴ", value: "'Corporate Logo'" },
  { label: "ドキドキファンタジア", value: "'DokiDoki Fantasia'" },
  { label: "ピクセル10", value: "'PixelMplus10'" },
  { label: "ピクセル12", value: "'PixelMplus12'" },
  { label: "全児童フェルトペン", value: "'Zenjido FeltPen'" },
  { label: "あずき", value: "'Azuki'" },
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
  const [isVertical, setIsVertical] = useState(false); // 縦書き
  const [rotation, setRotation] = useState(0); // degrees 0-360
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [strokeColor, setStrokeColor] = useState("#ffffff"); // 縁取り色
  const [strokeWidth, setStrokeWidth] = useState(0); // 縁取り太さ (0-20)
  const [, forceUpdate] = useState(0);

  // Explicitly load selected font when it changes
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts && fontFamily) {
      // Extract font name without quotes and fallbacks
      const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      // Use document.fonts.load() to trigger font loading
      document.fonts.load(`bold 40px "${fontName}"`).then(() => {
        forceUpdate(n => n + 1); // Force re-render after font loads
      }).catch(() => {
        // Font may not exist or failed to load, ignore
      });
    }
  }, [fontFamily]);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  // Draw text logic
  // Helper for curved text
  // The text center stays at (x, y), and arch controls how much the text bends
  const drawCurvedText = (
      ctx: CanvasRenderingContext2D, 
      textContent: string, 
      centerX: number, 
      centerY: number, 
      archValue: number
  ) => {
      const charWidth = fontSize + letterSpacing;
      const totalWidth = textContent.length * charWidth;
      
      // Convert arch (-100 to 100) to a curve amount
      const curveAmount = archValue / 100; // -1 to 1
      
      if (Math.abs(curveAmount) < 0.01) {
          // Nearly straight - just draw horizontally
          ctx.save();
          ctx.translate(centerX, centerY);
          
          if ('letterSpacing' in ctx) {
              ctx.letterSpacing = `${letterSpacing}px`;
          }

          if (strokeWidth > 0) {
              ctx.lineWidth = strokeWidth;
              ctx.strokeStyle = strokeColor;
              ctx.lineJoin = "round";
              ctx.miterLimit = 2;
              ctx.strokeText(textContent, 0, 0);
          }
          ctx.fillText(textContent, 0, 0);
          
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
          ctx.restore();
          return;
      }
      
      // Calculate the arc parameters
      const absAmount = Math.abs(curveAmount);
      const radius = totalWidth / (2 * Math.sin(absAmount * Math.PI / 2));
      const direction = curveAmount > 0 ? -1 : 1; // -1: center above, 1: center below
      
      const offsetY = Math.sqrt(Math.max(0, radius * radius - (totalWidth / 2) * (totalWidth / 2)));
      const circleCenterY = centerY + direction * offsetY;
      const circleCenterX = centerX;
      
      const halfAngle = Math.asin((totalWidth / 2) / radius);
      const startAngle = direction > 0 ? (-Math.PI / 2 - halfAngle) : (Math.PI / 2 + halfAngle);
      const angleStep = (2 * halfAngle) / (textContent.length - 1 || 1);
      
      ctx.save();
      for (let i = 0; i < textContent.length; i++) {
          const char = textContent[i];
          const angle = startAngle + (direction > 0 ? i : -i) * angleStep;
          
          const charX = circleCenterX + radius * Math.cos(angle);
          const charY = circleCenterY + radius * Math.sin(angle);
          
          ctx.save();
          ctx.translate(charX, charY);
          
          const tangentAngle = angle + (direction > 0 ? Math.PI / 2 : -Math.PI / 2);
          ctx.rotate(tangentAngle);
          
          if (strokeWidth > 0) {
              ctx.lineWidth = strokeWidth;
              ctx.strokeStyle = strokeColor;
              ctx.lineJoin = "round";
              ctx.miterLimit = 2;
              ctx.strokeText(char, 0, 0);
          }
          ctx.fillText(char, 0, 0);
          ctx.restore();
      }
      ctx.restore();
  };

  // Draw text logic
  const drawDetails = () => {
    const canvas = canvasRef.current?.getCanvas();
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    // Reset canvas with image first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const currentText = text;
    if (!currentText) return;

    // Setup Text Style
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";

    const x = (canvas.width * position.x) / 100;
    const y = (canvas.height * position.y) / 100;

    // Apply rotation
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-x, -y);

    if (arch === 0) {
      if (isVertical) {
        // Vertical text drawing
        const lineHeight = fontSize + letterSpacing;
        for (let i = 0; i < currentText.length; i++) {
          const charY = y + (i - (currentText.length - 1) / 2) * lineHeight;
          
          if (strokeWidth > 0) {
              ctx.lineWidth = strokeWidth;
              ctx.strokeStyle = strokeColor;
              ctx.lineJoin = "round";
              ctx.miterLimit = 2;
              ctx.strokeText(currentText[i], x, charY);
          }
          ctx.fillText(currentText[i], x, charY);
        }
        
        // Draw bounding box on hover
        if (isHovering && currentText) {
          const textHeight = currentText.length * lineHeight;
          const textWidth = fontSize * 1.2;
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x - textWidth / 2 - 4, y - textHeight / 2 - 8, textWidth + 8, textHeight + 16);
          ctx.setLineDash([]);
        }
      } else {
        // Horizontal text with line break support
        const lines = currentText.split('\n');
        const lineHeight = fontSize * 1.4;
        const totalHeight = lines.length * lineHeight;
        const startY = y - (totalHeight - lineHeight) / 2;
        
        if ('letterSpacing' in ctx) {
           ctx.letterSpacing = `${letterSpacing}px`;
        }
        
        lines.forEach((line, index) => {
          if (strokeWidth > 0) {
              ctx.lineWidth = strokeWidth;
              ctx.strokeStyle = strokeColor;
              ctx.lineJoin = "round";
              ctx.miterLimit = 2;
              ctx.strokeText(line, x, startY + index * lineHeight);
          }
          ctx.fillText(line, x, startY + index * lineHeight);
        });
        
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        
        // Draw bounding box on hover
        if (isHovering && currentText) {
          let maxWidth = 0;
          lines.forEach(line => {
            const metrics = ctx.measureText(line);
            if (metrics.width > maxWidth) maxWidth = metrics.width;
          });
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          // Adjust bounding box based on alignment
          let boxX = x - maxWidth / 2 - 8;
          if (textAlign === 'left') boxX = x - 8;
          if (textAlign === 'right') boxX = x - maxWidth - 8;
          ctx.strokeRect(boxX, startY - fontSize / 2 - 4, maxWidth + 16, totalHeight + 8);
          ctx.setLineDash([]);
        }
      }
    } else {
      drawCurvedText(ctx, currentText, x, y, arch);
      
      // Draw center indicator on hover for curved text
      if (isHovering && currentText) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, fontSize * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore(); // Restore rotation
  };

  // Track previous image to detect changes and reset state
  const prevImageRef = useRef<HTMLImageElement | null>(null);
  
  useEffect(() => {
    // Only reset if this is a NEW image (not initial mount or same image)
    if (embeddedImage && prevImageRef.current !== null && embeddedImage !== prevImageRef.current) {
      // Use queueMicrotask to defer state updates and avoid cascading render warning
      queueMicrotask(() => {
        setText("");
        setArch(0);
        setRotation(0);
        setPosition({ x: 50, y: 50 });
        setLetterSpacing(0);
      });
    }
    prevImageRef.current = embeddedImage ?? null;
  }, [embeddedImage]);

  // Re-draw on changes
  useEffect(() => {
    // Ensure fonts are loaded before drawing
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        drawDetails();
      });
    } else {
      drawDetails();
    }
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
    <div className={`flex flex-col lg:flex-row gap-8 items-center lg:items-start h-auto lg:h-full w-full ${className}`}>
      {/* Hidden font preload - forces browser to load all fonts */}
      <div className="sr-only" aria-hidden="true">
        {FONTS.map(f => (
          <span key={f.value} style={{ fontFamily: f.value }}>あ</span>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col w-full">
          {!image ? (
            <FileDropzone onFileSelect={handleFileSelect} className="h-[400px]" />
          ) : (
            <div 
              className="relative flex-1 lg:flex-1 bg-gray-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-200 min-h-[280px] max-h-[400px] lg:max-h-none"
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
        <div className="w-full lg:w-80 h-auto lg:h-full lg:max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Type size={20} />
                文字入れ
            </h3>
            


            {/* Main Input */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-text-sub">テキスト</label>
                <textarea
                    value={text} 
                    onChange={e => setText(e.target.value)}
                    placeholder="ここに文字を入力（改行可）"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
            </div>

            {/* Horizontal/Vertical Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                    onClick={() => setIsVertical(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isVertical ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    横書き
                </button>
                <button
                    onClick={() => setIsVertical(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isVertical ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    縦書き
                </button>
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

            {/* Size & Color */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-sub">サイズ</label>
                    <input 
                        type="range"
                        min="10"
                        max="200"
                        value={fontSize}
                        onChange={e => setFontSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="text-right text-xs text-gray-500">{fontSize}px</div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-sub">文字色</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm text-gray-600 font-mono">{color.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Stroke Style */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-sm font-bold text-text-sub flex items-center justify-between">
                    縁取り
                    <span className="text-xs font-normal text-gray-400">太さ: {strokeWidth}px</span>
                </label>
                <div className="grid grid-cols-2 gap-4 items-center">
                    <input 
                        type="range"
                        min="0"
                        max="20"
                        value={strokeWidth}
                        onChange={e => setStrokeWidth(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-gray-500">色:</span>
                        <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 ring-1 ring-gray-200"
                            disabled={strokeWidth === 0}
                        />
                    </div>
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
                    <span>両端が下</span>
                    <span>なし</span>
                    <span>両端が上</span>
                </div>
            </div>

            {/* Rotation Slider */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-text-sub flex items-center justify-between">
                    回転
                    <span className="text-primary font-bold">{rotation}°</span>
                </label>
                <input 
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal-500"
                />
            </div>

            {/* Text Alignment */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-text-sub">配置</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setTextAlign('left')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${textAlign === 'left' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        左
                    </button>
                    <button 
                        onClick={() => setTextAlign('center')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${textAlign === 'center' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        中央
                    </button>
                    <button 
                        onClick={() => setTextAlign('right')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${textAlign === 'right' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        右
                    </button>
                </div>
            </div>

            {/* Position Arrow Controls */}
            <div className="space-y-3 pt-2">
                 <label className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <AlignCenter size={12} />
                    位置微調整
                </label>
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => setPosition(p => ({ ...p, y: Math.max(0, p.y - 1) }))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    >
                        <ChevronUp size={16} className="text-gray-600" />
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPosition(p => ({ ...p, x: Math.max(0, p.x - 1) }))}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                        >
                            <ChevronLeft size={16} className="text-gray-600" />
                        </button>
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-mono">
                            {Math.round(position.x)},{Math.round(position.y)}
                        </div>
                        <button
                            onClick={() => setPosition(p => ({ ...p, x: Math.min(100, p.x + 1) }))}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                        >
                            <ChevronRight size={16} className="text-gray-600" />
                        </button>
                    </div>
                    <button
                        onClick={() => setPosition(p => ({ ...p, y: Math.min(100, p.y + 1) }))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    >
                        <ChevronDown size={16} className="text-gray-600" />
                    </button>
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
