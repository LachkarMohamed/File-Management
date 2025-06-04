import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  }, []);

  const fetchUser = async () => {
    try {
      const user = await apiClient.get<User>('/auth/me');
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    await fetchUser();
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};