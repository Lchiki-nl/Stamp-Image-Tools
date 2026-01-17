declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// ツール使用イベント
export const trackToolUsed = (toolName: string) => {
  trackEvent('tool_used', {
    tool_name: toolName,
  });
};

// 画像保存イベント
export const trackImageSave = (saveType: 'new' | 'overwrite', count: number) => {
  trackEvent('image_save', {
    save_type: saveType,
    image_count: count,
  });
};

// 一括ダウンロード
export const trackBulkDownload = (count: number) => {
  trackEvent('bulk_download', {
    image_count: count,
  });
};

// VIP認証
export const trackVipAuth = () => {
  trackEvent('vip_authenticated');
};
