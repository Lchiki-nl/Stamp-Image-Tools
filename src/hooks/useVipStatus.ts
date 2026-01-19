import { useState, useEffect } from 'react';
import { trackVipAuth } from '@/lib/analytics';

/**
 * ⚠️ 警告 / WARNING ⚠️
 * このコードの解析や改ざんは利用規約違反です。
 * Analyzing or tampering with this code violates the Terms of Service.
 * 不正なアクセス試行はログに記録される場合があります。
 * Unauthorized access attempts may be logged.
 */

// 🔒 Obfuscated authentication - DO NOT MODIFY
const STORAGE_KEY = '_ezs_auth';

function encode(value: boolean): string {
  const data = { ts: Date.now(), v: value ? '1' : '0', r: Math.random().toString(36) };
  return btoa(JSON.stringify(data));
}

function decode(token: string): boolean {
  try {
    const data = JSON.parse(atob(token));
    // Simple validation: check structure
    return data.v === '1' && typeof data.ts === 'number';
  } catch {
    return false;
  }
}

// Custom event name
const VIP_STATUS_EVENT = 'vip-status-changed';

/**
 * Hook to manage VIP status.
 * Persists status in sessionStorage with basic obfuscation.
 * Now reactive across components using custom events.
 */
export function useVipStatus() {
  const [isVip, setIsVip] = useState(false);

  // Initial check
  useEffect(() => {
    const checkStatus = () => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && decode(stored)) {
        setIsVip(true);
      } else {
        setIsVip(false);
      }
    };

    checkStatus();

    // Listen for changes from other components
    const handleStatusChange = () => checkStatus();
    window.addEventListener(VIP_STATUS_EVENT, handleStatusChange);
    
    // Listen for storage changes (multi-tab support)
    window.addEventListener('storage', handleStatusChange);

    return () => {
      window.removeEventListener(VIP_STATUS_EVENT, handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
    };
  }, []);

  const unlockVip = (): void => {
    sessionStorage.setItem(STORAGE_KEY, encode(true));
    setIsVip(true);
    trackVipAuth();
    // Notify other components
    window.dispatchEvent(new Event(VIP_STATUS_EVENT));
  };

  const lockVip = (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsVip(false);
    // Notify other components
    window.dispatchEvent(new Event(VIP_STATUS_EVENT));
  };

  return { isVip, unlockVip, lockVip };
}
