"use client";

import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { GalleryView } from "@/components/gallery/GalleryView";
import { UnifiedEditor } from "@/components/editor/UnifiedEditor";
import { useGallery } from "@/hooks/useGallery";
import { ProcessingModal, type ProcessingAction } from "@/components/gallery/ProcessingModal";
import { processRemoveBackground, processCrop, processSplit } from "@/lib/batch-processing";
import { type GalleryAction } from "@/types/gallery";

type ViewMode = "gallery" | "editor";

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
  
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editorInitialTool, setEditorInitialTool] = useState<"background" | "crop" | "split">("background");

  // Batch Processing State
  const [processingAction, setProcessingAction] = useState<ProcessingAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

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
       setViewMode("editor");
    }
    prevImageCount.current = images.length;
  }, [images]);

  // Gallery Action Handler
  const handleGalleryAction = async (action: GalleryAction) => {
      if (action === 'delete') {
          const ids = selectedImages.map(img => img.id);
          if (confirm(`${ids.length}枚の画像を削除しますか？`)) {
              removeImages(ids);
          }
          return;
      }
      
      if (action === 'download') {
          if (selectedImages.length === 0) return;
          
          if (selectedImages.length === 1) {
              const img = selectedImages[0];
              const a = document.createElement("a");
              a.href = img.previewUrl;
              a.download = img.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          } else {
              // Batch Download as Zip
              const zip = new JSZip();
              selectedImages.forEach(img => {
                  zip.file(img.name, img.file);
              });
              const content = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(content);
              const a = document.createElement("a");
              a.href = url;
              a.download = "images.zip";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
          }
          return;
      }
      
      
      // Single image split -> Open Unified Editor
      if (action === 'split' && selectedImages.length === 1) {
          setEditingImageId(selectedImages[0].id);
          setEditorInitialTool('split');
          setViewMode('editor');
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
    setEditingImageId(id);
    setEditorInitialTool("background");
    setViewMode("editor");
  };

  // 編集完了/戻る
  const handleBackToGallery = () => {
    setEditingImageId(null);
    setViewMode("gallery");
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

  if (viewMode === "editor" && editingImage) {
    return (
        <UnifiedEditor 
            previewUrl={editingImage.previewUrl}  
            onBack={handleBackToGallery}
            onApply={handleApply}
            embeddedImage={null}
            onFileSelect={(file) => handleAddFiles([file])}
            initialTool={editorInitialTool}
        />
    );
  }

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
        
        <ProcessingModal
            isOpen={!!processingAction}
            onClose={() => setProcessingAction(null)}
            action={processingAction}
            selectedCount={selectedCount}
            isProcessing={isProcessing}
            progress={progress}
            onExecute={handleBatchExecute}
        />
    </>
  );
}
