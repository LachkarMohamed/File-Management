import { apiClient } from './client';
import { User } from '../types/auth';

interface CreateUserData {
  username: string;
  password: string;
  role: string;
  groups: string[];
  canUpload: boolean;
  canDownload: boolean;
}

interface UpdateUserData {
  username?: string;
  password?: string;
  role?: string;
  groups?: string[];
  canUpload?: boolean;
  canDownload?: boolean;
}

export const usersApi = {
  getUsers: async () => {
    const data = await apiClient.get<any[]>('/users');
    return data.map(user => ({
      ...user,
      id: user._id || user.id,  // Map _id to id
    })) as User[];
  },
  
  createUser: (data: CreateUserData) => 
    apiClient.post<User>('/users', data),
  
  updateUser: (id: string, data: UpdateUserData) =>
    apiClient.put<User>(`/users/${id}`, data),
  
  archiveUser: (id: string) =>
    apiClient.post<User>(`/users/${id}/archive`),
  
  getUserGroups: (id: string) =>
    apiClient.get<string[]>(`/users/${id}/groups`),
  
  updateUserPermissions: (id: string, data: UpdateUserData) =>
    apiClient.put<User>(`/users/${id}/permissions`, data),
};