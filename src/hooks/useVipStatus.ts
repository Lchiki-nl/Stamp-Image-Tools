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

/**
 * Hook to manage VIP status.
 * Persists status in sessionStorage with basic obfuscation.
 */
export function useVipStatus() {
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    // Check storage on mount
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && decode(stored)) {
      setTimeout(() => setIsVip(true), 0);
    }
  }, []);

  const unlockVip = (password: string): boolean => {
    const correctPassword = process.env.NEXT_PUBLIC_VIP_PASSWORD;
    if (password === correctPassword) {
      sessionStorage.setItem(STORAGE_KEY, encode(true));
      setIsVip(true);
      trackVipAuth();
      return true;
    }
    return false;
  };

  const lockVip = (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsVip(false);
  };

  return { isVip, unlockVip, lockVip };
}
