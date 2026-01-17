import { useState, useEffect, useRef } from 'react';
import { X, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface VipAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate?: (password: string) => boolean;
}

export function VipAuthModal({ isOpen, onClose, onAuthenticate }: VipAuthModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onAuthenticate ? onAuthenticate(password) : (password === 'vip');
    
    if (isValid) {
        setSuccess(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    } else {
        setError('パスワードが間違っています');
        setSuccess(false);
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
                    <h3 className="font-bold text-lg text-gray-800">VIP機能 認証</h3>
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
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">パスワードを入力</label>
                        <input
                            ref={inputRef}
                            type="password"
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
                        disabled={!password}
                        className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ロック解除
                        <ArrowRight size={18} />
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
