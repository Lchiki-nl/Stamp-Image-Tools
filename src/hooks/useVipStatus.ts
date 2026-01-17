import { useState, useEffect } from 'react';

// Simple obfuscation to prevent casual console manipulation
// Note: Client-side security is never foolproof, but this deters casual tampering
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
    if (password === 'vip') { // Dummy password
      sessionStorage.setItem(STORAGE_KEY, encode(true));
      setIsVip(true);
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
