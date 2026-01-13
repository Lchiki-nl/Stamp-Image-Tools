"use client";

import { useCallback, useState, type DragEvent, type ChangeEvent, type ReactNode } from "react";
import { Upload } from "lucide-react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  children?: ReactNode;
  className?: string;
}

export function FileDropzone({
  onFileSelect,
  accept = "image/png,image/jpeg,image/webp",
  children,
  className = "",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full aspect-video border-4 border-dashed rounded-2xl
        flex flex-col items-center justify-center cursor-pointer
        transition-all duration-200
        ${isDragging
          ? "border-primary bg-primary-light/50 scale-[1.02]"
          : "border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-primary-light/20"
        }
        ${className}
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {children || (
        <div className="text-center pointer-events-none">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-500">
            ドラッグ＆ドロップ または クリック
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP</p>
        </div>
      )}
    </div>
  );
}
