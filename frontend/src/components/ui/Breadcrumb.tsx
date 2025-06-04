import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  groupId?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, groupId }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-500 hover:text-blue-600"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              to={item.path}
              className={`ml-1 text-sm font-medium md:ml-2 ${
                index === items.length - 1
                  ? 'text-blue-600 cursor-default pointer-events-none'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;