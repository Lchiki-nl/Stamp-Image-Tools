import { useState, useEffect } from 'react';

/**
 * Hook to manage VIP status.
 * Persists status in sessionStorage so it survives page reloads but clears on close.
 */
export function useVipStatus() {
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    // Check storage on mount
    const stored = sessionStorage.getItem('stamp_tool_vip');
    if (stored === 'true') {
      setTimeout(() => setIsVip(true), 0);
    }
  }, []);

  const unlockVip = (password: string): boolean => {
    if (password === 'vip') { // Dummy password
      sessionStorage.setItem('stamp_tool_vip', 'true');
      setIsVip(true);
      return true;
    }
    return false;
  };

  return { isVip, unlockVip };
}
