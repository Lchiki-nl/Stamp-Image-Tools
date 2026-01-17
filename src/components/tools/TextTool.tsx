"use client";

import { useState, useRef, useEffect, type RefObject } from "react";
import { Type, RotateCcw, Check, Palette, AlignCenter } from "lucide-react";
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
  { label: "手書き風", value: "cursive" },
  { label: "丸文字", value: "'Kosugi Maru', sans-serif" }, // Requires Google Font loading if using specific fonts
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

  // Draw text logic
  const drawDetails = () => {
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
      ctx.fillText(text, x, y);
    } else {
      // Curved Text
      drawCurvedText(ctx, text, x, y, arch);
    }
  };

  const drawCurvedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, curvature: number) => {
    // Curvature: -100 (down) to 100 (up). 
    // Convert to radius. Small curvature = large radius.
    // Limit curvature to avoid div by zero.
    
    // Direction: Positive = Arch Up (Center is below), Negative = Arch Down (Center is above)
    // Actually, let's say Curvature 100 = Smiley (Ends up), -100 = Frowny (Ends down).
    // Radius calculation needs to be inversely proportional to curvature.
    
    // Just a heuristic for usability:
    // Radius = R. If curvature is high, R is small (tight curve).
    // Let's assume curvature 100 approx matches a circle of radius = font size * 2?
    // Let's implement a standard circular text path.
    
    const radius = 10000 / (Math.abs(curvature) + 1); // Avoid 0
    const anglePerChar = Math.min(fontSize / radius, 0.5); // Radians per char approx
    const totalAngle = anglePerChar * (text.length - 1);
    
    // Center point of the circle
    // If curvature > 0 (Smile), center is BELOW (y + radius)
    // If curvature < 0 (Agony), center is ABOVE (y - radius)
    const direction = curvature > 0 ? 1 : -1;
    const cy = y + radius * direction;
    const cx = x;

    ctx.save();
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Calculate angle for this char. 
        // Centered around -PI/2 (top) if smile? No, centered around 0 angle relative to arc center?
        // Let's use simple angle offset from vertical.
        
        // Index relative to center
        const charIndex = i - (text.length - 1) / 2;
        const angle = charIndex * anglePerChar; // Angle offset from vertical
        
        // Position
        // If direction 1 (Smile, center below):
        // Angle 0 is Up (neg Y). But canvas angles: 0 is Right, PI/2 Down, -PI/2 Up.
        // We want char at angle -PI/2 + angle.
        
        // Wait, simpler transform:
        // Translate to Center (cx, cy).
        // Rotate by angle.
        // Translate along radius (up or down).
        
        ctx.save();
        ctx.translate(cx, cy);
        
        if (direction > 0) {
            // Smile
            // Center is below. Text is at top of circle.
            // Rotation: angle (0 is vertical up from center? No, standard rotate).
            // We want 0 angle to correspond to 12 o'clock, which is -90deg (-PI/2).
            ctx.rotate(-Math.PI / 2 + angle);
            ctx.translate(0, -radius);
        } else {
            // Frown
            // Center is above. Text is at bottom of circle.
            // We want 0 angle to correspond to 6 o'clock, which is +90deg (PI/2).
            ctx.rotate(Math.PI / 2 - angle); // Reverse angle ordering for correct left-to-right reading?
            // Actually for frown, left chars should be left.
            // i=0 (leftmost) -> charIndex negative.
            // If we rotate by +90 + angle:
            // charIndex neg -> angle neg -> less than 90 -> to the right? No.
            // 90 is Down.
            // Let's re-verify.
            // Smile: left char (neg idx) -> angle neg. -90 + neg = -110 (Left-ish Up). Correct.
            // Frown: left char (neg idx) -> should be Left-ish Down.
            // 90 is Down. We want < 90? No, Left-ish Down is > 90 (e.g. 110).
            // So 90 - angle (since angle is neg).
            ctx.rotate(Math.PI / 2 - angle);
            ctx.translate(0, -radius); 
             // Wait, if center is above, we translate DOWN to get to text. 
             // But rotate handles direction?
             // If we rotate 90 (Down), translate (0, radius)? No, usually translate (0, -radius) draws at origin?
             // Standard ctx text draws at 0,0.
             // Let's stick to: Rotate to correct spoke, Move out to rim.
            
             // For Frown, letters need to be upright? Or rotated with curve? Rotated.
             // But upside down? Usually readable. 
             // Let's just rotate 180 relative to Smile?
             ctx.rotate(Math.PI); // Flip text?
        }

        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    ctx.restore();
  };

  // Re-draw when any state changes
  useEffect(() => {
    drawDetails();
  }, [text, fontSize, color, fontFamily, arch, position, image]);


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
    if (canvasRef.current && image) {
        const ctx = canvasRef.current.getContext();
        const canvas = canvasRef.current.getCanvas();
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
        }
    }
  };

  const handleApply = async () => {
    if (!canvasRef.current || !onApply) return;
    const blob = await canvasRef.current.toBlob("image/png");
    if (blob) onApply(blob);
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
                    className="max-h-[500px] shadow-lg"
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
                >
                    {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
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
                    <label className="text-sm font-bold text-text-sub">サイズ (px)</label>
                    <input 
                        type="number"
                        value={fontSize}
                        onChange={e => setFontSize(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
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

            {/* Position Sliders (Simple alternative to canvas drag for now) */}
            <div className="space-y-3 pt-2">
                 <label className="text-sm font-bold text-text-sub flex items-center gap-2">
                    <AlignCenter size={14} />
                    位置調整 (%)
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">X (横)</label>
                        <input 
                            type="range" min="0" max="100" value={position.x}
                            onChange={e => setPosition(p => ({ ...p, x: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Y (縦)</label>
                        <input 
                            type="range" min="0" max="100" value={position.y}
                            onChange={e => setPosition(p => ({ ...p, y: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
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
