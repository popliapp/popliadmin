import { useAppSelector } from '@/redux/hooks';

export const usePermission = () => {
  const { user } = useAppSelector((state) => state.auth);

  const isSuperAdmin = user?.role === 'super_admin';

  const hasPermission = (key: string): boolean => {
    if (isSuperAdmin) return true;
    if (!user?.permissions) return false;
    return !!user.permissions[key];
  };

  const hasAnyPermission = (...keys: string[]): boolean => {
    if (isSuperAdmin) return true;
    return keys.some((k) => hasPermission(k));
  };

  return { hasPermission, hasAnyPermission, isSuperAdmin };
};