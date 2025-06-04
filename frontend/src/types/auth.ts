export interface User {
  _id: string;
  username: string;
  role: 'superadmin' | 'admin' | 'user';
  canUpload: boolean;
  canDownload: boolean;
  groups: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}