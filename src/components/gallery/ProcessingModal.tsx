import { useState } from "react";
import { Eraser, Grid3X3, Crop, Scaling, X, Check, Loader2, Lock, Unlock, Sparkles, Wifi, Server, Cpu } from "lucide-react";
import type { RemoveBackgroundConfig, CropConfig, SplitConfig, ResizeConfig, AIConfig } from "@/lib/batch-processing";

export type ProcessingAction = 'remove-background' | 'remove-background-ai' | 'split' | 'crop' | 'resize';
export type AIProcessingMode = 'browser' | 'server';

export interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: ProcessingAction | null;
  selectedCount: number;
  isProcessing: boolean;
  progress: { current: number; total: number };
  onExecute: (config: RemoveBackgroundConfig | CropConfig | SplitConfig | ResizeConfig, overwrite: boolean, aiMode?: AIProcessingMode, aiConfig?: AIConfig) => void;
  isVip?: boolean;
  remainingServer?: number | null;
  remainingBrowser?: number | null;
}

export function ProcessingModal({
  isOpen,
  onClose,
  action,
  selectedCount,
  isProcessing,
  progress,
  onExecute,
  isVip,
  remainingServer,
  remainingBrowser,
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
  const [uniformCrop, setUniformCrop] = useState(0);

  // Split
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    rows: 2,
    cols: 2,
  });

  // Resize
  const [resizeConfig, setResizeConfig] = useState<ResizeConfig>({
    width: 370,
    height: 320,
    keepAspectRatio: true
  });

  // Overwrite mode state (hidden for split)
  const [overwriteMode, setOverwriteMode] = useState(false); // false = 新規保存 by default for batch

  // AI Processing Mode (browser = local WASM, server = Hugging Face API)
  const [aiMode, setAiMode] = useState<AIProcessingMode>('browser');
  const [aiModel, setAiModel] = useState<string>('isnet-general-use');
  const [alphaMatting, setAlphaMatting] = useState(true);
  const [foregroundThreshold, setForegroundThreshold] = useState(240);
  const [backgroundThreshold, setBackgroundThreshold] = useState(10);

  if (!isOpen || !action) return null;

  const handleExecute = () => {
    let config: RemoveBackgroundConfig | CropConfig | SplitConfig | ResizeConfig;
    if (action === 'remove-background') config = bgConfig;
    else if (action === 'remove-background-ai') config = bgConfig; // Config not used but required for type
    else if (action === 'crop') config = cropConfig;
    else if (action === 'split') config = splitConfig;
    else if (action === 'resize') config = resizeConfig;
    else return;
    // Split always creates new images
    const shouldOverwrite = action === 'split' ? false : overwriteMode;
    // Pass AI mode for AI actions
    // Pass AI mode and config for AI actions
    const mode = action === 'remove-background-ai' ? aiMode : undefined;
    const aiConf = action === 'remove-background-ai' ? { 
      aiModel, 
      alphaMatting,
      foregroundThreshold,
      backgroundThreshold
    } : undefined;
    onExecute(config, shouldOverwrite, mode, aiConf);
  };

  const getTitle = () => {
    switch (action) {
      case 'remove-background': return '背景削除の一括処理';
      case 'remove-background-ai': return 'AI背景削除の一括処理';
      case 'crop': return '余白カットの一括処理';
      case 'split': return '画像分割の一括処理';
      case 'resize': return 'サイズ変更の一括処理';
      default: return '一括処理';
    }
  };

  const iconMap = {
      'remove-background': Eraser,
      'remove-background-ai': Sparkles,
      'crop': Crop,
      'split': Grid3X3,
      'resize': Scaling,
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
                action === 'remove-background-ai' ? 'bg-purple-100 text-purple-600' :
                action === 'resize' ? 'bg-pink-100 text-pink-600' :
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

              {action === 'remove-background-ai' && (
                <div className="space-y-4 text-center py-6">
                     <div className="bg-purple-50 p-6 rounded-2xl inline-block mb-2">
                        <Sparkles size={40} className="text-purple-600" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-800">AIによる自動背景削除</h3>
                     <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                        AIが被写体を自動で認識して切り抜きます。<br/>
                        細かい設定は不要です。
                     </p>

                     {/* Processing Mode Toggle */}
                     <div className="mt-4 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                        <p className="text-xs text-gray-500 font-bold mb-2">処理モード</p>
                        <div className="flex gap-2">
                           <button
                              onClick={() => setAiMode('browser')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5
                                 ${aiMode === 'browser'
                                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                    : 'bg-gray-50 text-gray-500 border border-gray-200'}
                              `}
                           >
                              <Cpu size={14} />
                              標準
                           </button>
                           <button
                              onClick={() => setAiMode('server')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5
                                 ${aiMode === 'server'
                                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                                    : 'bg-gray-50 text-gray-500 border border-gray-200'}
                              `}
                           >
                              <Server size={14} />
                              高精度
                           </button>
                        </div>
                     </div>
                     
                     {/* Advanced Settings (Server Mode Only) */}
                     {/* Advanced Settings (Server Mode Only) */}
                     {/* Advanced Settings (Server Mode Only) - Now Open to Everyone */}
                     {aiMode === 'server' && (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-4 animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                             
                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-gray-500">AIモデル選択</label>
                                 <select 
                                     value={aiModel}
                                     onChange={(e) => setAiModel(e.target.value)}
                                     className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                 >
                                     <option value="isnet-general-use">汎用・高精度 (推奨)</option>
                                     <option value="u2net_human_seg">人物特化</option>
                                     <option value="isnet-anime">アニメ・イラスト</option>
                                 </select>
                                 <p className="text-[10px] text-gray-400">
                                     {aiModel === 'isnet-general-use' && "最もバランスの良い標準モデルです"}
                                     {aiModel === 'u2net_human_seg' && "人の切り抜きに特化しています"}
                                     {aiModel === 'isnet-anime' && "2次元キャラクターに最適です"}
                                 </p>
                             </div>

                             <div className="flex items-center justify-between">
                                 <div className="space-y-0.5">
                                     <label className="text-xs font-bold text-gray-500">境界線処理 (Alpha Matting)</label>
                                     <p className="text-[10px] text-gray-400">髪の毛などを滑らかに処理します</p>
                                 </div>
                                 <button
                                     onClick={() => setAlphaMatting(!alphaMatting)}
                                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                                         ${alphaMatting ? 'bg-indigo-600' : 'bg-gray-200'}
                                     `}
                                 >
                                     <span
                                         className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                             ${alphaMatting ? 'translate-x-6' : 'translate-x-1'}
                                         `}
                                     />
                                 </button>
                             </div>

                             {alphaMatting && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 flex justify-between">
                                            前景閾値 (Foreground Threshold) <span className="text-indigo-600">{foregroundThreshold}</span>
                                        </label>
                                        <input 
                                            type="range" min="0" max="255" 
                                            value={foregroundThreshold}
                                            onChange={(e) => setForegroundThreshold(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-full accent-indigo-600"
                                        />
                                        <p className="text-[10px] text-gray-400">
                                            この値より明るいピクセルは前景と見なされます。
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 flex justify-between">
                                            背景閾値 (Background Threshold) <span className="text-indigo-600">{backgroundThreshold}</span>
                                        </label>
                                        <input 
                                            type="range" min="0" max="255" 
                                            value={backgroundThreshold}
                                            onChange={(e) => setBackgroundThreshold(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-full accent-indigo-600"
                                        />
                                        <p className="text-[10px] text-gray-400">
                                            この値より暗いピクセルは背景と見なされます。
                                        </p>
                                    </div>
                                </div>
                             )}
                        </div>
                     )}
                     
                     {/* Free Limit Badge - only show for browser mode */}
                     {/* Free Limit Badge */}
                     {!isVip && (
                        <div className="mt-4 bg-white border border-purple-100 rounded-xl p-3 inline-block shadow-sm">
                            <p className="text-xs text-purple-800 font-bold mb-1">本日の無料枠</p>
                            <div className="flex items-end justify-center gap-1">
                                <span className={`text-2xl font-black ${(aiMode === 'server' ? (remainingServer ?? 0) : (remainingBrowser ?? 0)) > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                                    {aiMode === 'server' ? remainingServer : remainingBrowser}
                                </span>
                                <span className="text-sm text-gray-400 font-bold pb-1">/ {aiMode === 'server' ? 3 : 5}</span>
                            </div>
                        </div>
                     )}

                     <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                        <Wifi size={12} />
                        通信状況の良い場所でご利用ください
                     </p>
                </div>
              )}

              {action === 'crop' && (
                <div className="space-y-4">
                     {/* Uniform Crop Slider */}
                     <div className="space-y-3 pb-4 border-b border-gray-100">
                       <label className="text-sm font-bold text-gray-700 flex justify-between">
                           一括カット (px) <span className="text-orange-600">{uniformCrop}</span>
                       </label>
                       <input 
                           type="range" min="0" max="100" 
                           value={uniformCrop}
                           onChange={(e) => {
                               const val = Number(e.target.value);
                               setUniformCrop(val);
                               setCropConfig(p => ({ 
                                   ...p, 
                                   manual: { top: val, right: val, bottom: val, left: val } 
                               }));
                           }}
                           className="w-full h-2 bg-gray-200 rounded-full accent-orange-600"
                       />
                     </div>

                     <p className="text-sm font-bold text-gray-700">個別調整 (px)</p>
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

              {action === 'resize' && (
                <div className="space-y-6">
                     <div className="space-y-2 pb-4 border-b border-gray-100">
                         <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700">プリセット</label>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                             {[
                                 { label: "メイン", w: 240, h: 240 },
                                 { label: "スタンプ", w: 370, h: 320 },
                                 { label: "タブ", w: 96, h: 74 },
                                 { label: "絵文字", w: 180, h: 180 },
                             ].map(preset => (
                                 <button
                                    key={preset.label}
                                    onClick={() => setResizeConfig(p => ({ ...p, width: preset.w, height: preset.h }))}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors
                                        ${resizeConfig.width === preset.w && resizeConfig.height === preset.h
                                            ? "bg-pink-50 text-pink-600 border-pink-200"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}
                                    `}
                                 >
                                    {preset.label} <span className="opacity-60 text-xs">({preset.w}x{preset.h})</span>
                                 </button>
                             ))}
                         </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700">カスタムサイズ</label>
                            <button
                                onClick={() => setResizeConfig(p => ({ ...p, keepAspectRatio: !p.keepAspectRatio }))}
                                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold
                                    ${resizeConfig.keepAspectRatio ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}
                                `}
                            >
                                {resizeConfig.keepAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
                                {resizeConfig.keepAspectRatio ? "比率固定" : "解除"}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">幅 (W)</label>
                                <input
                                    type="number"
                                    value={resizeConfig.width}
                                    onChange={(e) => setResizeConfig(p => ({ ...p, width: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center font-mono font-bold"
                                />
                            </div>
                            <span className="text-gray-300 pt-5">×</span>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">高さ (H)</label>
                                <input
                                    type="number"
                                    value={resizeConfig.height}
                                    onChange={(e) => setResizeConfig(p => ({ ...p, height: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center font-mono font-bold"
                                />
                            </div>
                        </div>
                     </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
            {/* Overwrite Toggle - Hidden for Split */}
            {action !== 'split' && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-sm font-bold text-gray-600">保存モード</span>
                <button
                  onClick={() => setOverwriteMode(!overwriteMode)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border
                    ${overwriteMode 
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-green-50 text-green-600 border-green-200'
                    }
                  `}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${overwriteMode ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                  {overwriteMode ? '上書き' : '新規保存'}
                </button>
              </div>
            )}
            <button
              onClick={handleExecute}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                ${action === 'remove-background' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' :
                  action === 'remove-background-ai' ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-200' :
                  action === 'crop' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' :
                  action === 'resize' ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-200' :
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
