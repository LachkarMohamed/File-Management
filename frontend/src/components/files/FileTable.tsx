import React from 'react';
import { File } from '../../types/file';
import { File as FileIcon, MoreVertical, Star, Download, Folder } from 'lucide-react';
import { formatFileSize, formatDate } from '../../utils/formatters';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

interface FileTableProps {
  files: File[];
  onFileClick: (file: File) => void;
  onDownload: (file: File) => void;
  onToggleFavorite: (file: File) => void;
}

const FileTable: React.FC<FileTableProps> = ({
  files,
  onFileClick,
  onDownload,
  onToggleFavorite,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded On
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr 
              key={file._id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onFileClick(file)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-gray-500">
                    {file.isFolder ? (
                      <Folder className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <FileIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">
                  {file.isFolder ? 'Folder' : (file.fileType || file.type || 'File')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">{file.uploadedBy}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(file.uploadedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.isFolder ? '--' : formatFileSize(file.size || 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Menu as="div" className="relative group inline-block" onClick={(e) => e.stopPropagation()}>
                  <MenuButton className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 focus:outline-none">
                    {!file.isFolder && (
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => onDownload(file)}
                            className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left`}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </button>
                        )}
                      </MenuItem>
                    )}
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={() => onToggleFavorite(file)}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left`}
                        >
                          <Star className={`h-4 w-4 mr-2 ${file.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                          {file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileTable;