import { apiClient } from './client';
import { User } from '../types/auth';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },  
  getMe: () => apiClient.get<User>('/auth/me'),

};