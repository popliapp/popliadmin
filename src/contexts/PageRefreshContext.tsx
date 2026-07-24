import React, { createContext, useContext, useRef, useCallback, useState } from 'react';

interface PageRefreshContextValue {
  registerRefresh: (fn: () => Promise<void>) => void;
  unregisterRefresh: () => void;
  triggerRefresh: () => Promise<void>;
  isRefreshing: boolean;
  hasRefreshHandler: boolean;
}

const PageRefreshContext = createContext<PageRefreshContextValue | null>(null);

export const PageRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlerRef = useRef<(() => Promise<void>) | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasRefreshHandler, setHasRefreshHandler] = useState(false);

  const registerRefresh = useCallback((fn: () => Promise<void>) => {
    handlerRef.current = fn;
    setHasRefreshHandler(true);
  }, []);

  const unregisterRefresh = useCallback(() => {
    handlerRef.current = null;
    setHasRefreshHandler(false);
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (!handlerRef.current || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await handlerRef.current();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return (
    <PageRefreshContext.Provider value={{ registerRefresh, unregisterRefresh, triggerRefresh, isRefreshing, hasRefreshHandler }}>
      {children}
    </PageRefreshContext.Provider>
  );
};

export const usePageRefresh = () => {
  const ctx = useContext(PageRefreshContext);
  if (!ctx) throw new Error('usePageRefresh must be used inside PageRefreshProvider');
  return ctx;
};  