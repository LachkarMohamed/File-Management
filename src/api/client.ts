import { 
  notifyApiError, 
  notifyNetworkError,
  notifyUploadProgress,
  notifyUploadSuccess,
  notifyUploadError
} from '../utils/notify';

const API_URL = 'http://192.168.1.32:5000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`
      }));
      throw new Error(errorData.message);
    }
    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TypeError') {
          notifyNetworkError('Network connection error. Please check your internet connection.');
        } else {
          notifyApiError(error.message);
        }
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TypeError') {
          notifyNetworkError('Network connection error. Please check your internet connection.');
        } else {
          notifyApiError(error.message);
        }
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TypeError') {
          notifyNetworkError('Network connection error. Please check your internet connection.');
        } else {
          notifyApiError(error.message);
        }
      }
      throw error;
    }
  }

  async uploadWithProgress<T>(
    endpoint: string,
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            notifyUploadSuccess(formData.get('file')?.toString() || 'File');
            resolve(response);
          } catch (e) {
            notifyUploadError(formData.get('file')?.toString() || 'File', 'Invalid response from server');
            reject(new Error('Invalid response format'));
          }
        } else {
          notifyUploadError(formData.get('file')?.toString() || 'File', `Upload failed with status ${xhr.status}`);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        notifyUploadError(formData.get('file')?.toString() || 'File', 'Network error during upload');
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${API_URL}${endpoint}`);
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient();