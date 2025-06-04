import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FolderIcon, Star, Archive } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const sidebarItems = [
    {
      name: 'All Files',
      icon: <FolderIcon className="w-5 h-5" />,
      path: '/',
    },
    {
      name: 'Favorites',
      icon: <Star className="w-5 h-5" />,
      path: '/favorites',
    },
    {
      name: 'Archive',
      icon: <Archive className="w-5 h-5" />,
      path: '/archive',
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 h-[calc(100vh-56px)] bg-white shadow-md transition-all duration-300 z-40 ${
        isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'
      }`}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;