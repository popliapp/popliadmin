export type UserRole = 
  | 'super_admin' 
  | 'moderator' 
  | 'finance_admin' 
  | 'support_admin' 
  | 'marketing_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
