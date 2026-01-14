import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, count }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <Trash2 size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">画像を削除しますか？</h2>
            <p className="text-gray-500 mt-2">
              選択した {count} 枚の画像を削除します。<br/>
              この操作は取り消せません。
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
