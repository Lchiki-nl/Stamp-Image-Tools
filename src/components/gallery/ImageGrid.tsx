import { FileDropzone } from "@/components/shared/FileDropzone";
import { ImageCard } from "./ImageCard";
import { type GalleryImage } from "@/types/gallery";
import { ImageMinus, Crop, Grid3X3, Upload } from "lucide-react";

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
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Feature Showcase */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-text-main">
                画像加工をもっと手軽に。
                <span className="text-primary block sm:inline-block">ブラウザだけで完結。</span>
              </h2>
              <p className="text-text-sub leading-relaxed">
                <span className="inline-block">スタンプ画像作成に便利なツールをひとまとめにしました。登録不要、すべての処理はお使いのブラウザで行われます。</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ImageMinus size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-text-main">背景削除</h3>
                  <p className="text-sm text-text-sub mt-1">ワンクリックで背景を透過。色指定や許容値の調整も可能です。</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Crop size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-text-main">スマートトリミング</h3>
                  <p className="text-sm text-text-sub mt-1">スライダーで余白を一括カット。手動での微調整も簡単です。</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <Grid3X3 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-text-main">グリッド分割</h3>
                  <p className="text-sm text-text-sub mt-1">画像を均等に分割。複数の画像をまとめて切り出すのに便利です。</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-gray-50 rounded-3xl p-2 border border-dashed border-gray-200">
            <FileDropzone 
                onFileSelect={(file) => onAddFiles([file])} 
                className="h-[400px] bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-primary/20 transition-all"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Upload size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg text-text-main mb-1">画像をアップロード</p>
                        <p className="text-sm text-text-sub">ドラッグ＆ドロップ または クリック</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">PNG, JPG, WebP / 最大30枚</p>
                </div>
            </FileDropzone>
          </div>

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
