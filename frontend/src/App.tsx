import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import GroupsPage from './pages/GroupsPage';
import FolderContentsPage from './pages/FolderContentsPage';
import MainLayout from './components/layout/MainLayout';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <AuthRoute>
          <LoginPage />
        </AuthRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<GroupsPage />} />
        <Route path="group/:groupId" element={<FolderContentsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="archive" element={<FolderContentsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;