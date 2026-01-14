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
  onSelectAll,
  selectedCount 
}: GalleryViewProps) {
  return (
    <div className="min-h-screen bg-background-soft flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-text-main">ギャラリー</h1>
              <p className="text-sm text-text-sub mt-1">
                {images.length} 枚の画像 (最大30枚)
              </p>
            </div>
            <a 
              href="/how-to-use" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors ml-2"
            >
              使い方ガイド
            </a>
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

      {/* Gallery Footer */}
      <footer className="py-8 text-center text-text-sub text-sm">
        <div className="flex items-center justify-center gap-6 font-bold">
           <a 
             href="https://note.com/lchiki_nl/m/me2fbf42ae315" 
             target="_blank" 
             rel="noopener noreferrer"
             className="hover:text-primary transition-colors"
           >
             作者のnote
           </a>
           <a 
             href="https://store.line.me/emojishop/author/10517625/ja" 
             target="_blank" 
             rel="noopener noreferrer"
             className="hover:text-primary transition-colors"
           >
             作者のLINE絵文字
           </a>
        </div>
        <p className="mt-4 opacity-50 text-xs">
          © 2026 EzStampify
        </p>
      </footer>
    </div>
  );
}
