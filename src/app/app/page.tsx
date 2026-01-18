"use client";

import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { GalleryView } from "@/components/gallery/GalleryView";
import { UnifiedEditor } from "@/components/editor/UnifiedEditor";
import { useGallery, MAX_IMAGES_NORMAL, MAX_IMAGES_VIP } from "@/hooks/useGallery";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { ProcessingModal, type ProcessingAction, type AIProcessingMode } from "@/components/gallery/ProcessingModal";
import { DeleteConfirmModal } from "@/components/gallery/DeleteConfirmModal";
import { processRemoveBackground, processRemoveBackgroundAI, processCrop, processSplit, processResize, type AIConfig } from "@/lib/batch-processing";
import { getImageDimensions } from "@/lib/image-utils";
import { type GalleryAction } from "@/types/gallery";
import { VipAuthModal } from "@/components/gallery/VipAuthModal";
import { trackImageSave, trackBulkDownload } from "@/lib/analytics";


// type ViewMode = "gallery" | "editor"; // Removed


export default function AppPage() {
  const { 
    images, 
    addImages, 
    removeImages, 
    selectAll, 
    selectedCount, 
    selectedImages, 
    addProcessedImage,
    overwriteImage,
    toggleSelection 
  } = useGallery();
  
  const { isVip } = useVipStatus();
  const maxImages = isVip ? MAX_IMAGES_VIP : MAX_IMAGES_NORMAL;
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  
  // Daily usage limit for free users (AI Background Removal)
  const { remaining, incrementUsage } = useDailyUsage(3);
  
  // const [viewMode, setViewMode] = useState<ViewMode>("gallery"); // Removed
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editorInitialTool, setEditorInitialTool] = useState<"background" | "crop" | "split" | "resize">("background");

  // Batch Processing State
  const [processingAction, setProcessingAction] = useState<ProcessingAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);



  // 編集対象の画像を取得
  const editingImage = images.find(img => img.id === editingImageId);

  // 画像が追加された時の処理
  const handleAddFiles = (files: File[]) => {
    const success = addImages(files, maxImages);
    if (!success) {
        setIsVipModalOpen(true);
    }
  };

  // 前回の画像数を保持して、0 -> 1 の変化を検知する
  const prevImageCount = useRef(0);

  useEffect(() => {
    // 画像数が 0 -> 1 になった時のみ、自動でエディタに遷移
    if (prevImageCount.current === 0 && images.length === 1) {
       const firstImage = images[0];
       setEditingImageId(firstImage.id);
       setEditorInitialTool("background");
       // setViewMode("editor"); 
    }
    prevImageCount.current = images.length;
  }, [images]);

  // Gallery Action Handler
  const handleGalleryAction = async (action: GalleryAction) => {
      if (action === 'delete') {
          if (selectedImages.length > 0) {
              setIsDeleteModalOpen(true);
          }
          return;
      }
      
      if (action === 'download') {
          if (selectedImages.length === 0) return;

          // Helper to get extension
          const getExt = (name: string, type: string) => {
              if (name.includes('.')) return name.split('.').pop() || 'png';
              return type.split('/')[1] || 'png';
          };

          // Smart Naming Logic
          const processedFiles: { file: File, name: string }[] = [];
          
          let otherCounter = 1;
          const nameMap = new Map<string, number>();

          // Process all selected images to determine names
          // Use Promise.all to fetch dimensions in parallel
          const targets = await Promise.all(selectedImages.map(async (img) => {
              try {
                  const dims = await getImageDimensions(img.file);
                  return { img, ...dims };
              } catch {
                  return { img, width: 0, height: 0 };
              }
          }));

          for (const target of targets) {
              const { img, width, height } = target;
              let baseName = "";
              const isMain = width === 240 && height === 240;
              const isTab = width === 96 && height === 74;

              if (isMain) {
                  baseName = "main";
              } else if (isTab) {
                  baseName = "tab";
              } else {
                  // Other
                  if (selectedImages.length > 1) {
                      // Batch mode: sequential numbers
                      // 絵文字(180x180)は3桁(001), スタンプ(370x320等)は2桁(01)
                      const isEmoji = width === 180 && height === 180;
                      const padding = isEmoji ? 3 : 2;
                      baseName = otherCounter.toString().padStart(padding, '0');
                      otherCounter++;
                  } else {
                      // Single mode: original name
                      baseName = img.name.replace(/\.[^/.]+$/, "");
                  }
              }

              // Handle duplicates for main/tab (or accidental collision)
              // Only apply duplicate logic if it's main or tab, OR if we somehow have name collision in others 
              // (though others follow sequential counter so usually won't collide unless we have main named "01" etc.)
              if (isMain || isTab) {
                  const count = nameMap.get(baseName) || 0;
                  if (count > 0) {
                      // main(2), main(3)...
                      // Use temporary variable to not mess up the map key for next iteration
                      const numberedName = `${baseName}(${count + 1})`;
                      nameMap.set(baseName, count + 1);
                      baseName = numberedName;
                  } else {
                      nameMap.set(baseName, 1);
                  }
              } else {
                  // For "Others" (01, 02...), we just assume they are unique enough or don't need (N) unless requested otherwise.
                  // But let's be safe against existing "main" collision strictly speaking? 
                  // The user only asked for main/tab special handling and others sequential.
                  // "01", "02" are unique by definition of counter.
              }

              const ext = getExt(img.name, img.type);
              processedFiles.push({
                  file: img.file,
                  name: `${baseName}.${ext}`
              });
          }
          
          if (processedFiles.length === 1) {
              const { file, name } = processedFiles[0];
              const url = URL.createObjectURL(file);
              const a = document.createElement("a");
              a.href = url;
              a.download = name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
          } else {
              try {
                  // Batch Download as Zip
                  const zip = new JSZip();
                  processedFiles.forEach(({ file, name }) => {
                      zip.file(name, file);
                  });
                  
                  const content = await zip.generateAsync({ type: "blob" });
                  const url = URL.createObjectURL(content);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `images_${new Date().getTime()}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
              } catch (e) {
                  console.error("Zip generation failed:", e);
                  alert("ZIP作成に失敗しました");
              }
          }
          
          trackBulkDownload(processedFiles.length);
          return;
      }
      
      
      // Single image split -> Open Unified Editor
      if (action === 'split' && selectedImages.length === 1) {
          setEditingImageId(selectedImages[0].id);
          setEditorInitialTool('split');
          // setViewMode('editor');
          return;
      }

      // Single image resize -> Open Unified Editor
      if (action === 'resize' && selectedImages.length === 1) {
          setEditingImageId(selectedImages[0].id);
          setEditorInitialTool('resize');
          return;
      }

      // Open Modal for processing actions
      setProcessingAction(action as ProcessingAction);
  };

  // Execute Batch Processing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBatchExecute = async (config: any, overwrite: boolean, aiMode?: AIProcessingMode, aiConfig?: AIConfig) => {
      if (!processingAction) return;

      // Safety limit for AI processing to prevent browser crash
      if (processingAction === 'remove-background-ai' && selectedImages.length > 10) {
          alert("一度にAI処理できるのは10枚までです。\nブラウザ負荷軽減のため、小分けにして実行してください。");
          return;
      }

      // Check daily limit for AI removal (Server Mode)
      if (processingAction === 'remove-background-ai' && aiMode === 'server' && !isVip) {
          // Check if user has enough remaining quota for selected images
          // Note: Currently we count "batches" or "images"? 
          // Requirement: "1日3回" usually means 3 actions or 3 images. 
          // Let's assume 3 images for now as safe default, or 3 batch executions?
          // Given the context of "remaining" from useDailyUsage(3), it implies 3 executions/items.
          // If user selects 5 images, they need 5 quota? Or 1 batch = 1 usage?
          // Usually "images". Let's restrict based on count.
          
          const currentRemaining = remaining ?? 0;
          if (currentRemaining <= 0) {
              alert(`無料版の高精度AI削除は1日3回までです。\nVIP会員になると無制限で利用できます。`);
              setIsVipModalOpen(true);
              return;
          }
          
          if (selectedImages.length > currentRemaining) {
              alert(`本日の残りはあと ${currentRemaining} 回です。\n${selectedImages.length} 枚の画像を選択しています。\nVIP会員になると無制限で利用できます。`);
              setIsVipModalOpen(true);
              return;
          }
      }

      setIsProcessing(true);
      const targets = [...selectedImages];
      setProgress({ current: 0, total: targets.length });

      try {

          for (let i = 0; i < targets.length; i++) {
              const img = targets[i];
              const file = img.file;

              
              let resultBlobs: Blob[] = [];

              // Process based on action
              if (processingAction === 'remove-background') {
                  const blob = await processRemoveBackground(file, config);
                  resultBlobs = [blob];
              } else if (processingAction === 'remove-background-ai') {
                  if (aiMode === 'server') {
                      // Use Cloudflare Pages Function Proxy
                      const formData = new FormData();
                      formData.append('file', file);
                      if (aiConfig?.aiModel) formData.append('model', aiConfig.aiModel);
                      if (aiConfig?.alphaMatting !== undefined) formData.append('a', String(aiConfig.alphaMatting));
                      if (aiConfig?.foregroundThreshold !== undefined) formData.append('af', String(aiConfig.foregroundThreshold));
                      if (aiConfig?.backgroundThreshold !== undefined) formData.append('ab', String(aiConfig.backgroundThreshold));
                      
                      const response = await fetch('/server/remove-bg', {
                          method: 'POST',
                          body: formData,
                      });
                      
                      // サーバースリープ中の場合
                      if (response.status === 503) {
                          const errorData = await response.json() as { error?: string };
                          alert(`${errorData.error || 'サーバー起動中'}\n\n少し待ってから再度お試しください。`);
                          setIsProcessing(false);
                          setProcessingAction(null);
                          return;
                      }
                      
                      if (!response.ok) {
                          const errorData = await response.json().catch(() => ({})) as { error?: string };
                          throw new Error(errorData.error || `処理に失敗しました (${response.status})`);
                      }
                      
                      // レスポンスはPNG画像のBlob
                      const resultBlob = await response.blob();
                      resultBlobs = [resultBlob];
                  } else {
                      // Use local browser WASM processing
                      const blob = await processRemoveBackgroundAI(file);
                      resultBlobs = [blob];
                  }
              } else if (processingAction === 'crop') {
                  const blob = await processCrop(file, config);
                  resultBlobs = [blob];
              } else if (processingAction === 'split') {
                  resultBlobs = await processSplit(file, config);

              } else if (processingAction === 'resize') {
                  const blob = await processResize(file, config);
                  resultBlobs = [blob];
              }

              // Add results to gallery
              const baseName = img.name.replace(/\.[^/.]+$/, "");
              
              if (resultBlobs.length === 0) {
                  console.warn("No result blobs generated");
              }

              // Handle overwrite vs new save
              if (overwrite && resultBlobs.length === 1) {
                  // 上書きモード: 単一結果のみ
                  const newFile = new File([resultBlobs[0]], `${baseName}.png`, { type: 'image/png' });
                  overwriteImage(img.id, newFile);
              } else {
                  // 新規保存モード or 複数結果(Split)
                  for (let index = 0; index < resultBlobs.length; index++) {
                      const blob = resultBlobs[index];
                      const suffix = resultBlobs.length > 1 ? `_${index + 1}` : '_processed';
                      const newFile = new File([blob], `${baseName}${suffix}.png`, { type: 'image/png' });

                      const success = addProcessedImage(newFile, img.id);
                      if (!success) {
                          setIsVipModalOpen(true);
                          setIsProcessing(false);
                          return;
                      }
                  }
              }

              // Apply dummy delay for UI update visibility
              await new Promise(r => setTimeout(r, 50));
              
              if (processingAction === 'remove-background-ai' && !isVip) {
                  incrementUsage();
              }
              setProgress(prev => ({ ...prev, current: i + 1 }));
          }
          
          // Close modal after success
          setTimeout(() => {
              setIsProcessing(false);
              setProcessingAction(null);
              // selectAll(false); // 処理後に選択を解除しない
          }, 500);

      } catch (e) {
          console.error("Batch processing error:", e);
          alert("処理中にエラーが発生しました");
          setIsProcessing(false);
      }
  };


  // ギャラリーからの選択
  const handleSelectForEdit = (id: string) => {
    // 選択モード中（1つ以上選択されている）なら、エディタを開かずに選択状態を切り替える
    if (selectedCount > 0) {
        toggleSelection(id);
        return;
    }

    setEditingImageId(id);
    setEditorInitialTool("background");
    // Add history entry
    window.history.pushState({ mode: "editor" }, "", window.location.pathname);
  };
  
  // Handle Browser Back Button
  useEffect(() => {
    const handlePopState = () => {
        // If we go back and editingImageId is set, clean it up
        setEditingImageId(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 編集完了/戻る (UIボタンから)
  const handleBackToGallery = () => {
    // History state check: Only go back if we pushed a state
    const state = window.history.state;
    if (state && state.mode === "editor") {
        window.history.back();
    } else {
        // Otherwise just close the modal manually
        setEditingImageId(null);
    }
  };

  // Navigation Logic
  const currentImageIndex = images.findIndex(img => img.id === editingImageId);
  
  const handleNextImage = () => {
      if (currentImageIndex !== -1 && currentImageIndex < images.length - 1) {
          const nextImg = images[currentImageIndex + 1];
          setEditingImageId(nextImg.id);
          // Tool state might need reset or persist? Currently resets to initialTool default
      }
  };

  const handlePrevImage = () => {
      if (currentImageIndex > 0) {
          const prevImg = images[currentImageIndex - 1];
          setEditingImageId(prevImg.id);
      }
  };

  // 適用 (UnifiedEditorからのコールバック)
  const handleApply = (blob: Blob | Blob[], overwrite: boolean) => {
      if (Array.isArray(blob)) {
          // 複数画像 (Split等) - 常に新規追加
          const currDate = new Date().toISOString().replace(/[:.]/g, "-");
          const newFiles = blob.map((b, i) => 
              new File([b], `processed_${currDate}_${i + 1}.png`, { type: "image/png" })
          );
          addImages(newFiles, maxImages);
          trackImageSave('new', blob.length);
      } else if (overwrite && editingImageId) {
          // 上書きモード
          const newFile = new File([blob], "edited_image.png", { type: "image/png" });
          overwriteImage(editingImageId, newFile);
          trackImageSave('overwrite', 1);
      } else {
          // 新規保存モード
          const newFile = new File([blob], "edited_image.png", { type: "image/png" });
          addImages([newFile], maxImages);
          trackImageSave('new', 1);
      }
  };

  const handleConfirmDelete = () => {
    const ids = selectedImages.map(img => img.id);
    removeImages(ids);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
        <GalleryView 
            images={images}
            onAddImages={handleAddFiles}
            onRemoveImages={removeImages}
            onSelect={handleSelectForEdit}
            onToggleSelect={toggleSelection}
            selectedCount={selectedCount}
            onSelectAll={selectAll}
            onAction={handleGalleryAction}
            onRequestVip={() => setIsVipModalOpen(true)}
            onClearSelection={() => selectAll(false)}
        />
        
        {/* Editor Modal Overlay */}
        {editingImage && (
            <div 
                className="fixed inset-0 z-50 bg-background-soft animate-in slide-in-from-bottom-5 duration-300"
                onClick={(e) => {
                    // Close if clicking the backdrop itself
                    if (e.target === e.currentTarget) {
                        handleBackToGallery();
                    }
                }}
            >
                <UnifiedEditor 
                    previewUrl={editingImage.previewUrl}  
                    onBack={handleBackToGallery}
                    onApply={handleApply}
                    embeddedImage={null}
                    onFileSelect={(file) => handleAddFiles([file])}
                    initialTool={editorInitialTool}
                    onNext={currentImageIndex < images.length - 1 ? handleNextImage : undefined}
                    onPrev={currentImageIndex > 0 ? handlePrevImage : undefined}
                    onDelete={() => {
                        if (!editingImageId) return;
                        
                        const deletingIndex = currentImageIndex;
                        const hasNext = deletingIndex < images.length - 1;
                        const hasPrev = deletingIndex > 0;
                        
                        // Determine next image to show
                        if (hasNext) {
                            // Navigate to next (which will shift down after delete)
                            const nextImage = images[deletingIndex + 1];
                            setEditingImageId(nextImage.id);
                        } else if (hasPrev) {
                            // Navigate to previous
                            const prevImage = images[deletingIndex - 1];
                            setEditingImageId(prevImage.id);
                        } else {
                            // No more images, go back to gallery
                            handleBackToGallery();
                        }
                        
                        // Remove the image
                        removeImages([editingImageId]);
                    }}
                />
            </div>
        )}

        <ProcessingModal
            isOpen={!!processingAction}
            onClose={() => setProcessingAction(null)}
            action={processingAction}
            selectedCount={selectedCount}
            isProcessing={isProcessing}
            progress={progress}
            onExecute={handleBatchExecute}
            isVip={isVip}
            remaining={remaining}
        />

        <DeleteConfirmModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            count={selectedCount}
        />

        <VipAuthModal
            isOpen={isVipModalOpen}
            onClose={() => setIsVipModalOpen(false)}
        />
    </>
  );
}
