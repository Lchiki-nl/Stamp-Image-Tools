import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'stamp-tool-ai-usage-';

export function useDailyUsage(limit: number, featureKey: string = 'default') {
  const [remaining, setRemaining] = useState<number | null>(null);

  // Get today's date string YYYY-MM-DD
  const getTodayKey = useCallback(() => {
    const d = new Date();
    return `${STORAGE_PREFIX}${featureKey}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [featureKey]);

  useEffect(() => {
    const key = getTodayKey();
    const usage = parseInt(localStorage.getItem(key) || '0', 10);
    // Avoid synchronous setState warning
    const timer = setTimeout(() => {
        setRemaining(Math.max(0, limit - usage));
    }, 0);
    return () => clearTimeout(timer);
  }, [limit, getTodayKey]);

  const incrementUsage = (count: number = 1) => {
    const key = getTodayKey();
    const currentUsage = parseInt(localStorage.getItem(key) || '0', 10);
    const newUsage = currentUsage + count;
    localStorage.setItem(key, newUsage.toString());
    setRemaining(Math.max(0, limit - newUsage));
  };

  const checkCanUse = () => {
    const key = getTodayKey();
    const currentUsage = parseInt(localStorage.getItem(key) || '0', 10);
    return currentUsage < limit;
  };

  return {
    remaining,
    incrementUsage,
    checkCanUse
  };
}
