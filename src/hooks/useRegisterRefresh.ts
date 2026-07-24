import { useEffect } from 'react';
import { usePageRefresh } from '../contexts/PageRefreshContext';

export const useRegisterRefresh = (fn: () => Promise<void>) => {
  const { registerRefresh, unregisterRefresh } = usePageRefresh();

  useEffect(() => {
    registerRefresh(fn);
    return () => unregisterRefresh();
  }, [fn, registerRefresh, unregisterRefresh]);
};