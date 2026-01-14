import { useState, useCallback, useEffect, useRef } from 'react';
import { GalleryImage } from '@/types/gallery';
import { saveGalleryState, loadGalleryState } from '@/lib/storage';

export const MAX_IMAGES = 30;

export function useGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const isLoadedRef = useRef(false);

  // Load from DB on mount
  useEffect(() => {
    let active = true;
    (async () => {
        const storedImages = await loadGalleryState();
        if (active && storedImages.length > 0) {
            setImages(storedImages);
        }
        isLoadedRef.current = true;
    })();
    return () => { active = false; };
  }, []);

  // Save to DB on change
  useEffect(() => {
    if (!isLoadedRef.current) return; // Don't save empty state before load
    
    // Debounce saving slightly or just save (IndexedDB is async/fast enough for small counts)
    const timeoutId = setTimeout(() => {
        saveGalleryState(images);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [images]);

  // Note: URL cleanup is handled in removeImages to avoid premature revocation

  const addImages = useCallback((files: File[]) => {
    setImages(prev => {
      const remainingSlots = MAX_IMAGES - prev.length;
      if (remainingSlots <= 0) {
        // TODO: 通知などで知らせる
        return prev;
      }

      const filesToAdd = files.slice(0, remainingSlots);
      const newImages: GalleryImage[] = filesToAdd.map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        width: 0, // ロード後に設定したいが、一旦0
        height: 0,
        status: 'pending',
        isSelected: false,
        createdAt: Date.now(),
      }));

      // 画像サイズを取得（非同期だが、State更新後に副作用で行うか、ここで待つか）
      // ここではシンプルにState更新を優先し、サイズは後で更新、あるいは表示時に取得する戦略をとる
      // ただし、正確なサイズが必要なら getImageSize ユーティリティを使うべき
      
      return [...prev, ...newImages];
    });
  }, []);

  const removeImages = useCallback((ids: string[]) => {
    setImages(prev => {
      const targets = prev.filter(img => ids.includes(img.id));
      targets.forEach(img => URL.revokeObjectURL(img.previewUrl));
      return prev.filter(img => !ids.includes(img.id));
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, isSelected: !img.isSelected } : img
    ));
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    setImages(prev => prev.map(img => ({ ...img, isSelected: selected })));
  }, []);

  const updateImageStatus = useCallback((id: string, status: GalleryImage['status']) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status } : img
    ));
  }, []);

  // 処理結果などを追加する場合（分割後画像など）
  const addProcessedImage = useCallback((file: File, originalId?: string) => {
     addImages([file]);
     // originalId があれば紐付けなどができるが、現状はフラットに追加
     if (originalId) {
         console.log("Processed from:", originalId);
     }
  }, [addImages]);

  const selectedImages = images.filter(img => img.isSelected);

  return {
    images,
    addImages,
    removeImages,
    toggleSelection,
    selectAll,
    updateImageStatus,
    addProcessedImage,
    selectedImages,
    selectedCount: selectedImages.length
  };
}
