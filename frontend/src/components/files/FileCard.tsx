import React, { useState } from 'react';
import { File as FileType } from '../../types/file';
import { File, Folder, MoreVertical, Download, Star } from 'lucide-react';
import { formatFileSize, formatDate } from '../../utils/formatters';

interface FileCardProps {
  file: FileType;
  onClick: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  onClick,
  onDownload,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Determine file icon based on file type
  const renderIcon = () => {
    if (file.isFolder) {
      return <Folder className="h-12 w-12 text-yellow-500" />;
    }
    
    // Map file types to appropriate styling
    if (file.type.includes('image')) {
      return <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <File className="h-6 w-6 text-purple-500" />
      </div>;
    } else if (file.type.includes('pdf')) {
      return <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
        <File className="h-6 w-6 text-red-500" />
      </div>;
    } else if (file.type.includes('document') || file.type.includes('word')) {
      return <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <File className="h-6 w-6 text-blue-500" />
      </div>;
    } else {
      return <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <File className="h-6 w-6 text-gray-500" />
      </div>;
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer relative hover:border-blue-200"
      onClick={onClick}
    >
      <div className="absolute top-2 right-2">
        {file.isFavorite && (
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        )}
      </div>
      
      <div className="flex flex-col items-center space-y-3 pt-2">
        {renderIcon()}
        
        <div className="w-full text-center mt-3">
          <h3 className="text-sm font-medium text-gray-800 truncate" title={file.name}>
            {file.name}
          </h3>
          
          <p className="text-xs text-gray-500 mt-1">
              {file.isFolder ? 'Folder' : (file.fileType || file.type)}
          </p>
          
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(file.uploadedAt)}
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2">
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
              {!file.isFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                  setShowMenu(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Star className={`h-4 w-4 mr-2 ${file.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                {file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCard;