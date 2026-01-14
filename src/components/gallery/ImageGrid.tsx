import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCard } from "./ImageCard";
import { type GalleryImage } from "@/types/gallery";

interface ImageGridProps {
  images: GalleryImage[];
  onSelect: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddFiles: (files: File[]) => void;
}

export function ImageGrid({ images, onSelect, onToggleSelect, onRemove, onAddFiles }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="w-full max-w-xl">
           <FileDropzone onFileSelect={(file) => onAddFiles([file])} className="h-[300px]" />
           <p className="text-center text-gray-400 text-sm mt-4">
              画像をドラッグ&ドロップして開始 (最大30枚)
           </p>
        </div>
      </div>
    );
  }

  // FileDropzone は複数ファイル対応が必要だが、既存のコンポーネントが単一ファイルのみなら改修が必要。
  // 一旦、グリッドの最後に追加ボタン（ドロップゾーン）を置くスタイルにする。
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 pb-24">
      {images.map((img) => (
        <ImageCard
          key={img.id}
          image={img}
          onSelect={onSelect}
          onToggleSelect={onToggleSelect}
          onRemove={onRemove}
        />
      ))}
      
      {/* Add Button / Mini Dropzone */}
      <div className="aspect-square relative">
        <FileDropzone 
            onFileSelect={(file) => onAddFiles([file])} 
            className="w-full h-full min-h-0 border-2 border-dashed border-gray-200 hover:border-primary/50 bg-gray-50/50 hover:bg-primary/5 transition-colors rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
             <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                <span className="text-xl font-bold">+</span>
             </div>
             <span className="text-xs text-gray-500 font-bold">追加</span>
        </FileDropzone>
      </div>
    </div>
  );
}
