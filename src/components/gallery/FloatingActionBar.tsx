"use client";

import { Eraser, Grid3X3, Crop, Download, Trash2, X, type LucideIcon } from "lucide-react";
import { type GalleryAction } from "@/types/gallery";

interface FloatingActionBarProps {
  count: number;
  onAction: (action: GalleryAction) => void;
  onClearSelection: () => void;
}

export function FloatingActionBar({ count, onAction, onClearSelection }: FloatingActionBarProps) {
  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-[calc(100%-2rem)] md:w-auto max-w-full">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl px-2 py-2 border border-gray-200/50 flex items-center gap-1 md:gap-2 justify-center">
        
        {/* Counter & Clear */}
        <div className="flex items-center gap-3 px-3 border-r border-gray-200 mr-1">
          <span className="font-black text-gray-800 whitespace-nowrap">
            {count} <span className="text-xs font-normal text-gray-500 hidden md:inline">選択中</span>
          </span>
          <button 
            onClick={onClearSelection}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="選択解除"
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        <ActionButton 
          icon={Eraser} 
          label="背景削除" 
          onClick={() => onAction('remove-background')} 
          color="green" 
        />
        <ActionButton 
          icon={Crop} 
          label="余白カット" 
          onClick={() => onAction('crop')} 
          color="orange" 
        />
        <ActionButton 
          icon={Grid3X3} 
          label="分割" 
          onClick={() => onAction('split')} 
          color="blue" 
        />

        <div className="w-px h-8 bg-gray-200 mx-1"></div>

        <ActionButton 
          icon={Download} 
          label="保存" 
          onClick={() => onAction('download')} 
          color="gray" 
        />
        <ActionButton 
          icon={Trash2} 
          label="削除" 
          onClick={() => onAction('delete')} 
          color="red" 
          variant="ghost"
        />
      </div>
    </div>
  );
}

interface ActionButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    color: string;
    variant?: 'solid' | 'ghost';
}

function ActionButton({ icon: Icon, label, onClick, color, variant = 'solid' }: ActionButtonProps) {
  const baseClass = "flex flex-col items-center justify-center w-10 h-10 md:w-16 md:h-14 rounded-xl transition-all gap-0.5 md:gap-1";
  
  // Tailwind colors need to be complete strings for safelist/JIT if not already used elsewhere.
  // Using direct classes for reliability.
  let colorClass = "";
  if (variant === 'ghost') {
     if (color === "red") colorClass = "hover:bg-red-50 text-red-500 hover:text-red-600";
     else colorClass = `hover:bg-${color}-50 text-${color}-500 hover:text-${color}-600`;
  } else {
     // solid-ish (colored text on hover)
     if (color === "green") colorClass = "hover:bg-green-50 text-gray-600 hover:text-green-600";
     else if (color === "orange") colorClass = "hover:bg-orange-50 text-gray-600 hover:text-orange-600";
     else if (color === "blue") colorClass = "hover:bg-blue-50 text-gray-600 hover:text-blue-600";
     else if (color === "gray") colorClass = "hover:bg-gray-100 text-gray-600 hover:text-gray-900";
     else if (color === "red") colorClass = "hover:bg-red-50 text-red-500 hover:text-red-600";
     else colorClass = `hover:bg-${color}-50 text-gray-600 hover:text-${color}-600`;
  }

  return (
    <button onClick={onClick} className={`${baseClass} ${colorClass}`}>
      <Icon size={20} className="md:mb-0.5" />
      <span className="text-[10px] font-bold hidden md:block">{label}</span>
    </button>
  );
}
