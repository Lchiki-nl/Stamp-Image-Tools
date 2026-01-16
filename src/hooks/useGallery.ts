import { useState, useCallback, useEffect, useRef } from 'react';
import { GalleryImage } from '@/types/gallery';
import { saveGalleryState, loadGalleryState } from '@/lib/storage';

export const MAX_IMAGES = 50;

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

  // Keep track of images for unmount cleanup
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup all URLs on unmount
  useEffect(() => {
      return () => {
          imagesRef.current.forEach(img => URL.revokeObjectURL(img.previewUrl));
      };
  }, []);

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

  const [lastInteractedIndex, setLastInteractedIndex] = useState<number | null>(null);

  const toggleSelection = useCallback((id: string, isShift: boolean = false) => {
    setImages(prev => {
      const currentIndex = prev.findIndex(img => img.id === id);
      if (currentIndex === -1) return prev;
      
      const newImages = [...prev];

      // Range Selection Logic
      if (isShift && lastInteractedIndex !== null) {
          const start = Math.min(lastInteractedIndex, currentIndex);
          const end = Math.max(lastInteractedIndex, currentIndex);
          
          // Select everything in range
          // Note: Standard OS behavior usually mimics the state of the "anchor" or simply selects all.
          // Here we'll select all in range (additive).
          for (let i = start; i <= end; i++) {
              newImages[i] = { ...newImages[i], isSelected: true };
          }
      } else {
          // Normal toggle
          newImages[currentIndex] = { 
              ...newImages[currentIndex], 
              isSelected: !newImages[currentIndex].isSelected 
          };
      }
      
      return newImages;
    });
    
    // Update last interacted index (even for shift clicks, the "end" becomes the new anchor usually)
    // We need to resolve the index from current state or just pass it if we trust it doesn't shift? 
    // Ideally we should find index again but id is stable.
    // For simplicity, we find index in the next render cycle or use the calculated one.
    // Since setImages is functional, we can't get new index easily outside. 
    // We'll just assume id mapping is stable enough for this operation.
    // But better to use `images` dependency if we need exact index? 
    // Actually using function updater `prev` is good for state, but for `lastInteractedIndex` we need 
    // to know the index at the time of click. 
    // We can just calculate it from current `images` if we didn't use functional update or...
    // Let's use functional update for `lastInteractedIndex` too or simplfy.
    
    // Since we need to know the index *before* update (which we did inside setImages), 
    // we can calculate `currentIndex` outside if we depend on `images`.
    // But `toggleSelection` is memoized. Let's rely on `images` dependency update or...
    // To avoid stale `images`, we can't simply find index outside if images changed without hook update.
    // But `images` is in dependency array of the hook (no, it is not! `useCallback` usually has it).
    // Ah, `toggleSelection` currently has `[]` dependency! That's a bug if we use `images` outside.
    // But previously it used functional update `prev => ...` so it was fine.
    
    // To implement range, we need access to the current list order to know indices.
    // So we MUST depend on `images` to know the order.
    // Updating dependency to `[images, lastInteractedIndex]`.
    
    setLastInteractedIndex(() => {
       // access images from closure (will require adding to deps)
       return images.findIndex(img => img.id === id);
    });

  }, [images, lastInteractedIndex]);

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

     }
  }, [addImages]);

  // 既存の画像を上書き
  const overwriteImage = useCallback((id: string, newFile: File) => {
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        // 古いpreviewUrlを解放
        URL.revokeObjectURL(img.previewUrl);
        return {
          ...img,
          file: newFile,
          previewUrl: URL.createObjectURL(newFile),
          name: newFile.name,
          type: newFile.type,
        };
      }
      return img;
    }));
  }, []);

  const selectedImages = images.filter(img => img.isSelected);

  return {
    images,
    addImages,
    removeImages,
    toggleSelection,
    selectAll,
    updateImageStatus,
    addProcessedImage,
    overwriteImage,
    selectedImages,
    selectedCount: selectedImages.length
  };
}
