import { useState } from "react";
import { Eraser, Grid3X3, Crop, X, Check, Loader2 } from "lucide-react";
import type { RemoveBackgroundConfig, CropConfig, SplitConfig } from "@/lib/batch-processing";

export type ProcessingAction = 'remove-background' | 'split' | 'crop';

export interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: ProcessingAction | null;
  selectedCount: number;
  isProcessing: boolean;
  progress: { current: number; total: number };
  onExecute: (config: RemoveBackgroundConfig | CropConfig | SplitConfig) => void;
}

export function ProcessingModal({
  isOpen,
  onClose,
  action,
  selectedCount,
  isProcessing,
  progress,
  onExecute,
}: ProcessingModalProps) {
  // --- Configuration States ---
  
  // Background Removal
  const [bgConfig, setBgConfig] = useState<RemoveBackgroundConfig>({
    targetColor: "#FFFFFF",
    tolerance: 30,
    feather: 0,
  });

  // Crop
  const [cropConfig, setCropConfig] = useState<CropConfig>({
    mode: 'manual',
    manual: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // Split
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    rows: 2,
    cols: 2,
  });

  if (!isOpen || !action) return null;

  const handleExecute = () => {
    let config: RemoveBackgroundConfig | CropConfig | SplitConfig;
    if (action === 'remove-background') config = bgConfig;
    else if (action === 'crop') config = cropConfig;
    else if (action === 'split') config = splitConfig;
    else return;
    
    onExecute(config);
  };

  const getTitle = () => {
    switch (action) {
      case 'remove-background': return '背景削除の一括処理';
      case 'crop': return '余白カットの一括処理';
      case 'split': return '画像分割の一括処理';
      default: return '一括処理';
    }
  };

  const iconMap = {
      'remove-background': Eraser,
      'crop': Crop,
      'split': Grid3X3,
  };
  
  const ActionIcon = action ? iconMap[action] : Check;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
                action === 'remove-background' ? 'bg-green-100 text-green-600' :
                action === 'crop' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
            }`}>
              <ActionIcon size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{getTitle()}</h2>
              <p className="text-xs text-gray-500 font-bold">{selectedCount} 枚の画像を選択中</p>
            </div>
          </div>
          {!isProcessing && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative w-24 h-24">
                 <Loader2 className="w-24 h-24 text-primary animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-primary">
                        {Math.round((progress.current / progress.total) * 100)}%
                    </span>
                 </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-gray-800">処理中...</h3>
                <p className="text-text-sub font-mono text-xl">
                  <span className="font-bold text-primary">{progress.current}</span>
                  <span className="text-gray-300 mx-2">/</span>
                  <span className="font-bold text-gray-400">{progress.total}</span>
                </p>
                <p className="text-xs text-gray-400">
                  そのままお待ちください
                </p>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Settings based on action */}
              
              {action === 'remove-background' && (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">削除する色 (Hex)</label>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: bgConfig.targetColor }} />
                        <input 
                            type="text" 
                            value={bgConfig.targetColor}
                            onChange={(e) => setBgConfig(p => ({ ...p, targetColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            placeholder="#FFFFFF"
                        />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                        許容値 <span className="text-green-600">{bgConfig.tolerance}</span>
                    </label>
                    <input 
                        type="range" min="0" max="100" 
                        value={bgConfig.tolerance}
                        onChange={(e) => setBgConfig(p => ({ ...p, tolerance: Number(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-full accent-green-600"
                    />
                  </div>
                   <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                        境界ぼかし <span className="text-green-600">{bgConfig.feather}</span>
                    </label>
                    <input 
                        type="range" min="0" max="50" 
                        value={bgConfig.feather}
                        onChange={(e) => setBgConfig(p => ({ ...p, feather: Number(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-full accent-green-600"
                    />
                  </div>
                </>
              )}

              {action === 'crop' && (
                <div className="space-y-4">
                     <p className="text-sm font-bold text-gray-700">カット量 (px)</p>
                     <div className="grid grid-cols-2 gap-3">
                        {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                            <div key={side}>
                                <label className="text-xs text-gray-500 capitalize">{side}</label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={cropConfig.manual?.[side] ?? 0}
                                    onChange={(e) => setCropConfig(p => ({ 
                                        ...p, 
                                        manual: { 
                                            top: p.manual?.top ?? 0,
                                            right: p.manual?.right ?? 0,
                                            bottom: p.manual?.bottom ?? 0,
                                            left: p.manual?.left ?? 0,
                                            [side]: Number(e.target.value) 
                                        } 
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base"
                                />
                            </div>
                        ))}
                     </div>
                </div>
              )}

              {action === 'split' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500">行数</label>
                             <div className="flex items-center gap-2">
                                 <input 
                                    type="number" min="1" max="10"
                                    value={splitConfig.rows}
                                    onChange={(e) => setSplitConfig(p => ({ ...p, rows: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center text-lg font-bold text-blue-600"
                                 />
                                 <span className="text-gray-400">行</span>
                             </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500">列数</label>
                             <div className="flex items-center gap-2">
                                 <input 
                                    type="number" min="1" max="10"
                                    value={splitConfig.cols}
                                    onChange={(e) => setSplitConfig(p => ({ ...p, cols: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center text-lg font-bold text-blue-600"
                                 />
                                 <span className="text-gray-400">列</span>
                             </div>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                         <p className="text-sm font-bold text-blue-700">
                            1画像あたり {splitConfig.rows * splitConfig.cols} 枚に分割
                         </p>
                         <p className="text-xs text-blue-400 mt-1">
                            合計出力: {selectedCount * splitConfig.rows * splitConfig.cols} 枚
                         </p>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleExecute}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                ${action === 'remove-background' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' :
                  action === 'crop' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' :
                  'bg-blue-500 hover:bg-blue-600 shadow-blue-200'}
              `}
            >
              処理を実行
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
