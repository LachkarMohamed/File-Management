import { toast } from 'react-hot-toast';

const API_URL = 'http://192.168.1.32:5000/api';

// Centralized API client that handles authentication and requests
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
      toast.error(error.message);
    }
    throw error; // Add this line to fix the return type issue
  }
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
        toast.error(error.message);
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
        toast.error(error.message);
      }
      throw error;
    }
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();