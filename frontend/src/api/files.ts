import { apiClient } from './client';
import { File } from '../types/file';

interface FileListParams {
  path?: string;
}

export const filesApi = {
  getFiles: async (groupId: string, params?: FileListParams) => {
    const queryParams = params?.path ? `?path=${params.path}` : '';
    const data = await apiClient.get<any[]>(`/files/list/${groupId}${queryParams}`);
    
    return data.map(file => ({
      _id: file._id,
      name: file.name,
      type: file.type,
      path: file.path,
      fileType: file.fileType,
      isFolder: file.type === 'folder',
      size: file.size || 0,
      uploadedBy: file.uploadedBy?.username || 'Unknown',
      uploadedAt: file.uploadedOn || new Date().toISOString(),
      isFavorite: file.isFavorite || false
    }));
  },
  
 uploadFile: (
    groupName: string, 
    file: globalThis.File, 
    currentPath: string | undefined,
    onProgress: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('originalName', file.name);
    
    const queryParams = new URLSearchParams();
    let fullPath = groupName;
    if (currentPath) fullPath += `/${currentPath}`;
    if (fullPath) queryParams.append('path', fullPath);

    return apiClient.uploadWithProgress<{ success: boolean }>(
      `/files/upload?${queryParams.toString()}`,
      formData,
      onProgress
    );
  },
  downloadFile: async (fileId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://192.168.1.32:5000/api/files/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // Filename will come from Content-Disposition header
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  toggleFavorite: (itemId: string, type: 'file' | 'folder') => {
    return apiClient.post<{ message: string }>(
      `/files/${itemId}/favorite?type=${type}`
    );
  },

  getFavorites: async () => {
    return apiClient.get<Array<{
      _id: string;
      name: string;
      path: string;
      type: 'file' | 'folder';
      fileType?: string; 
      size?: number;    
      uploadedBy?: string;
      uploadedAt?: string;
    }>>('/files/favorites');
  },

  
  
};