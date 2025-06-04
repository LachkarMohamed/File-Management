import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderArchive, Menu, X, FilesIcon, LogOut, UserCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white shadow-md px-4 py-3 fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
          
          <div className="flex items-center" onClick={() => navigate('/')} role="button">
            <FolderArchive className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-800 hidden sm:block">EPGDocs</h1>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1">
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
          >
            <FilesIcon className="h-5 w-5 mr-2" />
            <span>Files</span>
          </button>
        </div>
              
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
              title="Admin Panel"
            >
              <Shield className="h-6 w-6" />
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <UserCircle className="h-7 w-7 text-gray-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                {user && (
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;