import React from 'react';
import { File } from '../../types/file';
import FileCard from './FileCard';

interface FileGridProps {
  files: File[];
  onFileClick: (file: File) => void;
  onDownload: (file: File) => void;
  onToggleFavorite: (file: File) => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  onFileClick,
  onDownload,
  onToggleFavorite,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileCard
          key={file._id}
          file={file}
          onClick={() => onFileClick(file)}
          onDownload={() => onDownload(file)}
          onToggleFavorite={() => onToggleFavorite(file)}
        />
      ))}
    </div>
  );
};

export default FileGrid;