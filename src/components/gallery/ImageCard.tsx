import { Check, Trash2 } from "lucide-react";
import Image from "next/image";
import { type GalleryImage } from "@/types/gallery";

interface ImageCardProps {
  image: GalleryImage;
  onSelect: (id: string) => void;
  onToggleSelect: (id: string, isShift?: boolean) => void;
  onRemove: (id: string) => void;
}

export function ImageCard({ image, onSelect, onToggleSelect, onRemove }: ImageCardProps) {
  return (
    <div 
      className={`
        group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white
        ${image.isSelected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-gray-100 hover:border-gray-300"}
      `}
      onClick={(e) => {
        if (e.shiftKey) {
            e.preventDefault();
            onToggleSelect(image.id, true);
        } else {
            onSelect(image.id);
        }
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-full bg-gray-50">
        <Image
          src={image.previewUrl}
          alt={image.name || "image"}
          fill
          className="object-contain p-2"
          unoptimized
        />
      </div>

      {/* Selection Checkbox */}
      <div 
        className={`
          absolute top-3 left-3 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95
          ${image.isSelected 
            ? "bg-primary border-primary text-white scale-100" 
            : "bg-white/80 border-gray-300 text-transparent hover:text-gray-300" 
          }
        `}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(image.id, e.shiftKey);
        }}
      >
          <Check size={16} strokeWidth={3} />
      </div>

      {/* New Badge */}
      {image.status === 'pending' && !image.isSelected && (
        <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm pointer-events-none">
          NEW
        </div>
      )}

      {/* Remove Button (Hover only) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
        className="absolute bottom-3 right-3 z-10 w-9 h-9 bg-white/90 text-red-500 rounded-xl shadow-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-50"
        title="削除"
      >
        <Trash2 size={18} />
      </button>

      {/* Overlay for selection */}
      {image.isSelected && (
        <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
      )}
    </div>
  );
}
