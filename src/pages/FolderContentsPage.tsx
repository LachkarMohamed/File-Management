import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Search, Upload, LayoutGrid, List, Filter } from 'lucide-react';
import { File, ViewMode, FileType } from '../types/file';
import { filesApi } from '../api/files';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import Button from '../components/ui/Button';
import FileGrid from '../components/files/FileGrid';
import FileTable from '../components/files/FileTable';
import { groupsApi } from '../api/groups';
import { 
  notifyUploadStart, 
  notifyUploadProgress, 
  notifyUploadSuccess, 
  notifyUploadError,
  notifyDownloadStart,
  notifyDownloadSuccess,
  notifyDownloadError,
  notifyFavoriteToggled
} from '../utils/notify';

interface FolderContentsPageProps {
  files?: File[];
  loading?: boolean;
  disableNavigation?: boolean;
}

const FolderContentsPage: React.FC<FolderContentsPageProps> = ({
  files: propFiles,
  loading: propLoading,
  disableNavigation = false
}) => {
  // ... rest of the component code remains unchanged until handleUpload ...

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupName || !groupId) {
      notifyUploadError('Missing required information for upload');
      return;
    }

    e.target.value = ''; // Reset input
    const uploadId = notifyUploadStart(file.name);

    try {
      await filesApi.uploadFile(
        groupName, 
        file, 
        currentPath, 
        (progress) => {
          if (uploadId) {
            notifyUploadProgress(uploadId, progress);
          }
        }
      );
      
      notifyUploadSuccess(file.name);
      
      // Refresh files
      if (!propFiles) {
        const data = await filesApi.getFiles(groupId, { path: currentPath });
        setLocalFiles(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'File upload failed';
      notifyUploadError(file.name, message);
    }
  };

  const handleDownload = async (file: File) => {
    notifyDownloadStart(file.name);
    try {
      await filesApi.downloadFile(file._id, file.name);
      notifyDownloadSuccess(file.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      notifyDownloadError(file.name, message);
    }
  };

  const handleToggleFavorite = async (file: File) => {
    try {
      // Create a copy of current files for safe mutation
      const updatedFiles = files.map(f => 
        f._id === file._id ? { ...f, isFavorite: !f.isFavorite } : f
      );
      
      // Optimistically update the UI
      if (!propFiles) {
        setLocalFiles(updatedFiles);
      }
      
      // Send API request
      await filesApi.toggleFavorite(file._id, file.isFolder ? 'folder' : 'file');
      notifyFavoriteToggled(file.name, !file.isFavorite);
      
    } catch (err) {
      // Revert on error
      if (!propFiles) {
        setLocalFiles(files);
      }
      const message = err instanceof Error ? err.message : 'Failed to update favorite';
      notifyApiError(message);
    }
  };

  // ... rest of the component code remains unchanged ...
};

export default FolderContentsPage;