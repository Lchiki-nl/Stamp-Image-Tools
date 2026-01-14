"use client";

import { ImageGrid } from "./ImageGrid";
import { FloatingActionBar } from "./FloatingActionBar";
import { type GalleryAction, type GalleryImage } from "@/types/gallery";

interface GalleryViewProps {
  images: GalleryImage[];
  onAddImages: (files: File[]) => void;
  onRemoveImages: (ids: string[]) => void;
  onSelect: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll?: (selected: boolean) => void;
  onAction: (action: GalleryAction) => void;
  onClearSelection: () => void;
  selectedCount: number;
}

export function GalleryView({ 
  images, 
  onAddImages, 
  onRemoveImages, 
  onSelect,
  onToggleSelect,
  onAction,
  onClearSelection,
  selectedCount 
}: GalleryViewProps) {
  return (
    <div className="min-h-screen bg-background-soft">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-text-main">ギャラリー</h1>
            <p className="text-sm text-text-sub mt-1">
              {images.length} 枚の画像 (最大30枚)
            </p>
          </div>
          
          {images.length > 0 && onSelectAll && (
              <button
                  onClick={() => onSelectAll(selectedCount !== images.length)}
                  className="px-4 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
              >
                  {selectedCount === images.length ? "選択解除" : "全選択"}
              </button>
          )}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm min-h-[600px] border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto">
            <ImageGrid
              images={images}
              onSelect={onSelect}
              onToggleSelect={onToggleSelect}
              onRemove={(id) => onRemoveImages([id])}
              onAddFiles={onAddImages}
            />
          </div>
        </div>

        {selectedCount > 0 && (
          <FloatingActionBar
            count={selectedCount}
            onAction={onAction}
            onClearSelection={onClearSelection}
          />
        )}
      </div>
    </div>
  );
}
