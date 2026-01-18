import { useState, useEffect, useRef } from 'react';
import { X, Lock, CheckCircle2, ArrowRight, Crown, Sparkles, Loader2 } from 'lucide-react';

interface VipAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate?: (password: string) => boolean;
}

export function VipAuthModal({ isOpen, onClose, onAuthenticate, initialView = 'guide' }: VipAuthModalProps & { initialView?: 'guide' | 'auth' }) {
  const [view, setView] = useState<'guide' | 'auth'>(initialView);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Removed problematic useEffect that caused synchronous state updates.
     State is initialized via useState(initialView) and component remounts on open. */

  useEffect(() => {
    // Focus input when switching to auth view
    if (view === 'auth') {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }
  }, [view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
        // Use custom authenticator if provided (testing/legacy), otherwise use secure API
        let isValid = false;
        
        if (onAuthenticate) {
            isValid = onAuthenticate(password);
        } else {
            // Secure server-side verification
            const response = await fetch('/server/verify-vip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            
            if (response.ok) {
                const data = await response.json() as { success: boolean };
                isValid = data.success;
            } else {
                // API error or local fallback if needed
                console.error("Verification API failed");
                isValid = false; 
            }
        }
        
        if (isValid) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError('パスワードが間違っています');
            setSuccess(false);
        }
    } catch (err) {
        console.error("Verification error:", err);
        setError('認証サーバーに接続できませんでした');
    } finally {
        setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-amber-500">
                    <Lock size={24} />
                    <h3 className="font-bold text-lg text-gray-800">VIP機能</h3>
                </div>
                {!success && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {success ? (
                <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in duration-300">
                    <CheckCircle2 size={48} className="text-green-500 mb-4" />
                    <p className="text-lg font-bold text-gray-800">認証成功！</p>
                    <p className="text-sm text-gray-500 mt-2">VIP機能へアクセスします...</p>
                </div>
            ) : view === 'guide' ? (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                             <Crown size={32} className="text-amber-500 fill-amber-500" />
                        </div>
                        <h4 className="text-xl font-black text-gray-800">ここからはVIPモードです</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-bold">
                            この機能を使用するには<br/>
                            VIP認証（パスワード入力）が必要です。
                        </p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl space-y-2 border border-amber-100">
                        <p className="text-sm font-bold text-purple-700 flex items-center gap-2">
                             <Sparkles size={16} className="shrink-0 fill-purple-700" />
                             AI背景削除が無制限に使えます！
                        </p>
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                            <CheckCircle2 size={14} className="shrink-0" />
                            画像の保存枚数が最大100枚に増加
                        </p>
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                             <CheckCircle2 size={14} className="shrink-0" />
                            文字入れツールが使い放題
                        </p>
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                             <CheckCircle2 size={14} className="shrink-0" />
                            消しゴムのブラシサイズ調整
                        </p>
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                             <CheckCircle2 size={14} className="shrink-0" />
                            将来追加される全機能の制限解除
                        </p>
                    </div>

                    <button
                        onClick={() => setView('auth')}
                        className="w-full py-3 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                    >
                        VIPモードへ進む
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">パスワードを入力</label>
                        <input
                            ref={inputRef}
                            type="password"
                            autoComplete="off"
                            name="vip-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-lg outline-none transition-all
                                ${error 
                                    ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500' 
                                    : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/20'
                                }
                            `}
                            placeholder="Password"
                        />
                        {error && (
                            <p className="text-xs font-bold text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!password || isVerifying}
                        className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                確認中...
                            </>
                        ) : (
                            <>
                                ロック解除
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
