import { useState, useEffect, useRef } from 'react';
import { X, Lock, CheckCircle2, ArrowRight, Crown, Sparkles, Loader2, CreditCard, Key, Settings, ArrowUpCircle, Check } from 'lucide-react';
import { useVipStatus } from '@/hooks/useVipStatus';

interface VipAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate?: (password: string) => boolean;
}

  type ViewType = 'guide' | 'purchase' | 'confirmation' | 'enter-key' | 'manage';

  // State for Confirmation Flow
  const [selectedPlanForConfirmation, setSelectedPlanForConfirmation] = useState<'subscription' | 'onetime' | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const startPurchaseFlow = (type: 'subscription' | 'onetime') => {
    setSelectedPlanForConfirmation(type);
    setIsAgreed(false);
    setView('confirmation');
  };

  const handleFinalPurchase = async () => {
    if (!selectedPlanForConfirmation || !isAgreed) return;

    setIsLoading(true);
    setError('');
    
    try {
      // 既存ユーザーがアップグレードする場合は、既存のCustomer IDを渡す
      const existingCustomerId = localStorage.getItem('vip_license_key');
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: selectedPlanForConfirmation,
          // 買い切りへのアップグレード時のみ既存IDを使用
          ...(selectedPlanForConfirmation === 'onetime' && existingCustomerId ? { customerId: existingCustomerId } : {})
        }),
      });
      
      if (response.ok) {
        const data = await response.json() as { url: string };
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        try {
          const errorData = await response.json() as { error?: string };
          setError(errorData.error || '決済ページの作成に失敗しました');
        } catch {
          setError('決済ページの作成に失敗しました');
        }
      }
    } catch {
      setError('接続エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Legacy support for onAuthenticate prop
      if (onAuthenticate) {
        const isValid = onAuthenticate(licenseKey);
        if (isValid) {
          unlockVip();
          setSuccess(true);
          // setTimeout(() => onClose(), 1500);
        } else {
          setError('無効なライセンスキーです');
        }
        setIsLoading(false);
        return;
      }

      // Verify via API
      const response = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey }),
      });

      if (response.status === 429) {
        setError('リクエストが多すぎます。しばらくお待ちください');
        return;
      }

      if (response.ok) {
        const data = await response.json() as { valid: boolean; error?: string; type?: string };
        if (data.valid) {
          localStorage.setItem('vip_license_key', licenseKey);
          if (data.type) {
            localStorage.setItem('vip_plan_type', data.type);
            setPlanType(data.type as 'subscription' | 'onetime');
          }
          unlockVip();
          setSuccess(true);
          // setTimeout(() => onClose(), 1500);
        } else {
          setError(data.error || '無効なライセンスキーです');
        }
      } else {
        setError('検証に失敗しました');
      }
    } catch {
      setError('接続エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    const savedKey = localStorage.getItem('vip_license_key');
    if (!savedKey) {
      setError('ライセンスキーが保存されていません');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: savedKey }),
      });

      if (response.ok) {
        const data = await response.json() as { url: string };
        if (data.url) {
          window.open(data.url, '_blank');
        }
      } else {
        setError('管理ページを開けませんでした');
      }
    } catch {
      setError('接続エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

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
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300 w-full">
              <CheckCircle2 size={48} className="text-green-500 mb-2" />
              <p className="text-xl font-bold text-gray-800 mb-4">認証成功！</p>
              
              <div className="bg-amber-50 rounded-xl p-4 w-full mb-6 border border-amber-100">
                <p className="text-xs font-bold text-amber-800 text-center mb-2">
                  重要：ライセンスキーを保存してください
                </p>
                <div className="bg-white rounded-lg border border-amber-200 p-2 flex items-center justify-between gap-2">
                   <code className="flex-1 font-mono text-xs text-gray-600 truncate">
                      {typeof window !== 'undefined' ? localStorage.getItem('vip_license_key') : '...'}
                   </code>
                   <button 
                    onClick={handleCopy}
                    className={`text-xs font-bold px-2 py-1 rounded transition-colors whitespace-nowrap ${
                       copySuccess 
                         ? 'bg-green-100 text-green-600' 
                         : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                     }`}
                   >
                     {copySuccess ? '完了!' : 'コピー'}
                   </button>
                </div>
                 <p className="text-[10px] text-amber-600/70 text-center mt-2 leading-tight">
                    ※ 機種変更時や再ログイン時に必要になります。<br/>
                    ※ メモ帳などに貼り付けて保管してください。
                 </p>
              </div>

              <div className="space-y-3 w-full">
                <button 
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all"
                >
                  はじめる
                </button>
                <p className="text-xs text-center text-gray-400">
                  ※ 右上のVIPボタンからいつでも確認できます
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="text-amber-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">処理中...</p>
            </div>
          ) : view === 'guide' ? (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Crown size={32} className="text-amber-500 fill-amber-500" />
                </div>
                <h4 className="text-xl font-black text-gray-800">VIPプランのご案内</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-bold">
                  今すぐVIPになって<br/>すべての機能を解放しましょう！
                </p>
                {/* Error Display for Auto-Login failures */}
                {error && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-200">
                    ⚠️ {error}
                  </div>
                )}
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
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setView('purchase')}
                  className="w-full py-3 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                >
                  <CreditCard size={18} />
                  VIPプランを購入する
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => setView('enter-key')}
                  className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-amber-400 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  <Key size={16} />
                  ライセンスキーをお持ちの方
                </button>
              </div>
            </div>
          ) : view === 'manage' ? (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
               <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Crown size={32} className="text-amber-500 fill-amber-500" />
                </div>
                <h4 className="text-xl font-black text-gray-800">VIPプラン利用中</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-bold">
                  現在、すべての機能が<br/>解放されています
                </p>
              </div>

                <div className="bg-green-50 p-4 rounded-xl space-y-3 border border-green-100">
                <p className="text-sm font-bold text-green-700 flex items-center gap-2 justify-center">
                  <CheckCircle2 size={18} className="fill-green-700 text-white" />
                  VIP機能が有効です
                </p>
                
                {/* License Key Display */}
                <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-800 font-bold mb-1 text-center">あなたのライセンスキー</p>
                  <button 
                    onClick={handleCopy}
                    className="w-full flex items-center justify-between bg-green-100/50 px-3 py-2 rounded border border-green-200 group hover:bg-green-100 transition-colors"
                  >
                    <code className="text-xs font-mono text-green-900 truncate flex-1 text-left">
                      {typeof window !== 'undefined' ? localStorage.getItem('vip_license_key') : '...'}
                    </code>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ml-2 transition-all ${
                        copySuccess
                            ? 'bg-green-500 text-white border-green-600'
                            : 'bg-white text-green-600 border-green-200 group-hover:bg-green-50'
                    }`}>
                      {copySuccess ? '完了!' : 'コピー'}
                    </span>
                  </button>
                  <p className="text-[10px] text-green-600 mt-1.5 leading-tight text-center">
                    ※ 機種変更時などに必要になります。<br/>大切に保管してください。
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* 月額プランユーザーのみ: 買い切りに切り替えボタン */}
                {planType === 'subscription' && (
                  <button
                    onClick={() => handlePurchase('onetime')}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle size={18} />
                    買い切りプランに切り替える
                  </button>
                )}
                
                {/* 月額プランのみ: 解約ボタン */}
                {planType === 'subscription' && (
                  <>
                    <button
                      onClick={handleOpenPortal}
                      className="w-full py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold hover:border-amber-400 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Settings size={18} />
                      契約内容の確認・解約
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      お支払い情報の変更や解約手続きはこちら
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : view === 'purchase' ? (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setView('guide')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
              >
                ← 戻る
              </button>

              <div className="text-center mb-2">
                <h4 className="text-lg font-bold text-gray-800">プランを選択</h4>
              </div>

              {/* Subscription Plan */}
              <button
                onClick={() => handlePurchase('subscription')}
                className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 transition-all text-left"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">月額プラン</span>
                  <span className="text-amber-600 font-black">¥100/月</span>
                </div>
                <p className="text-xs text-gray-500">いつでも解約可能</p>
              </button>

              {/* One-time Plan */}
              <button
                onClick={() => handlePurchase('onetime')}
                className="p-4 rounded-xl border-2 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">買い切りプラン</span>
                  <span className="text-purple-600 font-black">¥500</span>
                </div>
                <p className="text-xs text-gray-500">永久にVIP機能を利用可能</p>
              </button>

              {error && (
                <p className="text-xs font-bold text-red-500 text-center">{error}</p>
              )}
            </div>
          ) : (
            </form>
          ) : view === 'confirmation' && selectedPlanForConfirmation ? (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
               <button
                onClick={() => setView('purchase')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
              >
                ← 戻る
              </button>

              <div className="text-center mb-1">
                <h4 className="text-lg font-bold text-gray-800">申し込み内容の確認</h4>
              </div>

               {/* Plan Summary Card */}
              <div className={`p-4 rounded-xl border-2 ${selectedPlanForConfirmation === 'subscription' ? 'border-amber-400 bg-amber-50' : 'border-purple-400 bg-purple-50'} shadow-sm`}>
                 <div className="flex justify-between items-end mb-2 border-b border-gray-200/50 pb-2">
                    <span className="font-bold text-gray-700 text-sm">プラン名</span>
                    <span className="font-bold text-gray-900">
                        {selectedPlanForConfirmation === 'subscription' ? 'VIPプラン (月額)' : 'VIPプラン (買い切り)'}
                    </span>
                 </div>
                 <div className="flex justify-between items-end mb-2 border-b border-gray-200/50 pb-2">
                    <span className="font-bold text-gray-700 text-sm">支払い金額</span>
                    <div className="text-right">
                        <span className={`text-xl font-black ${selectedPlanForConfirmation === 'subscription' ? 'text-amber-600' : 'text-purple-600'}`}>
                            {selectedPlanForConfirmation === 'subscription' ? '¥100' : '¥500'}
                        </span>
                        <span className="text-xs text-gray-500 font-bold ml-1">(税込)</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-700 text-sm shrink-0">支払時期</span>
                    <span className="text-xs text-gray-600 text-right font-medium">
                        {selectedPlanForConfirmation === 'subscription' 
                            ? '初回は即時決済。以降は1ヶ月ごとの自動更新となります。' 
                            : '即時決済 (1回のみ)。追加請求はありません。'}
                    </span>
                 </div>
              </div>

              {/* Legal Info */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-[11px] text-gray-500 space-y-2 leading-relaxed">
                  <p>
                      <span className="font-bold text-gray-700">【解約・更新について】</span><br/>
                      {selectedPlanForConfirmation === 'subscription'
                        ? 'マイページの「解約」ボタンからいつでも解約可能です。次回更新日の前日までに解約すれば、翌月分の請求は発生しません。'
                        : '買い切りプランのため、更新や解約の手続きはありません。'
                      }
                  </p>
                  <p>
                      <span className="font-bold text-gray-700">【返品・返金について】</span><br/>
                      デジタルコンテンツの性質上、決済完了後の返品・返金には原則として応じられません。予めご了承ください。
                  </p>
                   <p>
                      <span className="font-bold text-gray-700">【事業者】</span><br/>
                      Nashiki Leon (個人運営) / お問い合わせは<a href="https://forms.gle/ZHXoTYuuEW8rfVrw9" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">こちら</a>
                  </p>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isAgreed ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                      {isAgreed && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                  />
                  <span className="text-xs text-gray-600 leading-tight">
                      <a href="/terms" target="_blank" className="text-blue-500 underline hover:text-blue-700 font-bold">利用規約</a>
                      および
                      <a href="/privacy" target="_blank" className="text-blue-500 underline hover:text-blue-700 font-bold">プライバシーポリシー</a>
                      の内容を確認し、同意します。
                  </span>
              </label>

               <button
                onClick={handleFinalPurchase}
                disabled={!isAgreed || isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    決済へ進む
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          ) : (
        </div>
      </div>
    </div>
  );
}
