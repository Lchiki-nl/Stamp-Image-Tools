"use client";

import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { GalleryView } from "@/components/gallery/GalleryView";
import { UnifiedEditor } from "@/components/editor/UnifiedEditor";
import { useGallery } from "@/hooks/useGallery";
import { ProcessingModal, type ProcessingAction } from "@/components/gallery/ProcessingModal";
import { DeleteConfirmModal } from "@/components/gallery/DeleteConfirmModal";
import { processRemoveBackground, processCrop, processSplit, processResize } from "@/lib/batch-processing";
import { type GalleryAction } from "@/types/gallery";


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
    toggleSelection 
  } = useGallery();
  
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
    addImages(files);
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
          
          if (selectedImages.length === 1) {
              const img = selectedImages[0];
              // Use file directly to ensure fresh content
              const url = URL.createObjectURL(img.file);
              const a = document.createElement("a");
              a.href = url;
              // Ensure extension
              let name = img.name;
              if (!name.includes('.')) {
                  const ext = img.type.split('/')[1] || 'png';
                  name = `${name}.${ext}`;
              }
              a.download = name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
          } else {
              try {
                  // Batch Download as Zip
                  const zip = new JSZip();
                  selectedImages.forEach(img => {
                      let name = img.name;
                      if (!name.includes('.')) {
                          const ext = img.type.split('/')[1] || 'png';
                          name = `${name}.${ext}`;
                      }
                      // Handle duplicate names
                      let finalName = name;
                      let counter = 1;
                      while (zip.file(finalName)) {
                          const parts = name.split('.');
                          const ext = parts.pop();
                          const base = parts.join('.');
                          finalName = `${base}_${counter}.${ext}`;
                          counter++;
                      }
                      zip.file(finalName, img.file);
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
  const handleBatchExecute = async (config: any) => {
      if (!processingAction) return;

      setIsProcessing(true);
      const targets = [...selectedImages];
      setProgress({ current: 0, total: targets.length });

      try {
          console.log("Starting batch execution. Action:", processingAction, "Config:", config);
          for (let i = 0; i < targets.length; i++) {
              const img = targets[i];
              const file = img.file;
              console.log(`Processing image ${i + 1}/${targets.length}:`, img.name);
              
              let resultBlobs: Blob[] = [];

              // Process based on action
              if (processingAction === 'remove-background') {
                  const blob = await processRemoveBackground(file, config);
                  resultBlobs = [blob];
              } else if (processingAction === 'crop') {
                  const blob = await processCrop(file, config);
                  resultBlobs = [blob];
              } else if (processingAction === 'split') {
                  resultBlobs = await processSplit(file, config);
                  console.log(`Split generated ${resultBlobs.length} parts`);
              } else if (processingAction === 'resize') {
                  const blob = await processResize(file, config);
                  resultBlobs = [blob];
              }

              // Add results to gallery
              const baseName = img.name.replace(/\.[^/.]+$/, "");
              
              if (resultBlobs.length === 0) {
                  console.warn("No result blobs generated");
              }

              resultBlobs.forEach((blob, index) => {
                  const suffix = resultBlobs.length > 1 ? `_${index + 1}` : '_processed';
                  const newFile = new File([blob], `${baseName}${suffix}.png`, { type: 'image/png' });
                  console.log("Adding new file:", newFile.name, newFile.size);
                  addProcessedImage(newFile, img.id);
              });

              // Apply dummy delay for UI update visibility
              await new Promise(r => setTimeout(r, 50));
              setProgress(prev => ({ ...prev, current: i + 1 }));
          }
          
          // Close modal after success
          setTimeout(() => {
              setIsProcessing(false);
              setProcessingAction(null);
              selectAll(false);
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
  const handleApply = (blob: Blob | Blob[]) => {
      if (Array.isArray(blob)) {
          // 複数画像 (Split等)
          const currDate = new Date().toISOString().replace(/[:.]/g, "-");
          const newFiles = blob.map((b, i) => 
              new File([b], `processed_${currDate}_${i + 1}.png`, { type: "image/png" })
          );
          addImages(newFiles);
      } else {
          // 単一画像
          const newFile = new File([blob], "edited_image.png", { type: "image/png" });
          addImages([newFile]);
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
        />

        <DeleteConfirmModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            count={selectedCount}
        />
    </>
  );
}
