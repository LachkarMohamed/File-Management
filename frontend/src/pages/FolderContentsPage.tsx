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
import { notifyUploadStart, notifySuccess, notifyError } from '../components/notifications/NotificationCenter';

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
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType>('all');
  const [groupName, setGroupName] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUpload, setCurrentUpload] = useState('');

  const query = new URLSearchParams(location.search);
  const currentPath = query.get('path') || '';

  // Use props if provided, otherwise use local state
  const files = propFiles || localFiles;
  const loading = propLoading !== undefined ? propLoading : localLoading;

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!currentPath) return [{ label: 'Root', path: `/group/${groupId}` }];
    
    const segments = currentPath.split('/');
    return segments.map((segment, index) => ({
      label: segment,
      path: `/group/${groupId}?path=${segments.slice(0, index + 1).join('/')}`
    }));
  };

  // Memoized filtered files to prevent unnecessary re-renders
  const filteredFiles = useMemo(() => {
    let result = [...files];
    
    if (searchQuery) {
      result = result.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (fileTypeFilter !== 'all') {
      const typeMap = {
        documents: ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'pptx'],
        images: ['image'],
        videos: ['video'],
        audio: ['audio'],
        other: ['zip', 'archive', 'other']
      };
      
      result = result.filter(file => {
        // Only show files (not folders) of the selected type
        if (file.isFolder) return false;
        
        const fileType = file.fileType || file.type || '';
        
        if (fileTypeFilter === 'other') {
          return !Object.values(typeMap)
            .flat()
            .some(t => fileType.includes(t));
        }
        
        return typeMap[fileTypeFilter].some(t => fileType.includes(t));
      });
    }

    return result;
  }, [files, searchQuery, fileTypeFilter]);

  useEffect(() => {
    if (!propFiles && groupId) {
      const fetchFiles = async () => {
        setLocalLoading(true);
        try {
          const params = currentPath ? { path: currentPath } : undefined;
          const data = await filesApi.getFiles(groupId, params);
          
          if (!data) throw new Error('Invalid group ID');
          
          setLocalFiles(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load files');
          setLocalFiles([]);
        } finally {
          setLocalLoading(false);
        }
      };
      fetchFiles();
    }
  }, [groupId, currentPath, propFiles]);

  // Favorite sync effect
  useEffect(() => {
    const syncFavorites = async () => {
      try {
        const favorites = await filesApi.getFavorites();
        const updatedFiles = files.map(file => ({
          ...file,
          isFavorite: favorites.some(fav => fav._id === file._id)
        }));
        
        // Only update state if we're managing local files
        if (!propFiles) {
          setLocalFiles(updatedFiles);
        }
      } catch (err) {
        console.error('Error syncing favorites:', err);
      }
    };

    if (!loading) syncFavorites();
  }, [files, loading, propFiles]);

  useEffect(() => {
    const fetchGroupName = async () => {
      if (groupId) {
        try {
          const groups = await groupsApi.getGroups();
          const targetGroup = groups.find(g => g._id === groupId);
          if (targetGroup) {
            setGroupName(targetGroup.name);
          }
        } catch (err) {
          setError('Failed to load group information');
        }
      }
    };
    
    fetchGroupName();
  }, [groupId]);

  const handleFileClick = (file: File) => {
    if (file.isFolder) {
      if (groupId && !disableNavigation) {
        const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
        navigate(`/group/${groupId}?path=${encodeURIComponent(newPath)}`);
      }
      else {
        const pathSegments = file.path.split('/').filter(p => p !== '');
        const targetGroupId = pathSegments[0];
        const targetPath = pathSegments.slice(1).join('/');
        navigate(`/group/${targetGroupId}?path=${encodeURIComponent(targetPath)}`);
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupName || !groupId) {
      notifyError('Missing required information for upload');
      return;
    }

    e.target.value = ''; // Reset input
    const notificationId = notifyUploadStart(file.name);

    try {
      await filesApi.uploadFile(
        groupName, 
        file, 
        currentPath, 
        (progress) => {
          // Update progress globally
          const event = new CustomEvent('updateProgress', { 
            detail: { id: notificationId, progress } 
          });
          window.dispatchEvent(event);
        }
      );
      
      notifySuccess(`${file.name} uploaded successfully!`);
      
      // Refresh files
      if (!propFiles) {
        const data = await filesApi.getFiles(groupId, { path: currentPath });
        setLocalFiles(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'File upload failed';
      notifyError(message);
    }
  };

  const handleDownload = (file: File) => {
    filesApi.downloadFile(file._id, file.name);
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
      
    } catch (err) {
      // Revert on error
      if (!propFiles) {
        setLocalFiles(files);
      }
      setError('Failed to update favorite');
    }
  };

  return (
    <div>
      <Breadcrumb items={generateBreadcrumbs()} groupId={groupId} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          {disableNavigation ? 'Favorites' : 'Your Files'}
        </h1>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <form onSubmit={(e) => e.preventDefault()} className="flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              
            </div>
          </form>
          
          {!disableNavigation && (
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="sr-only"
                onChange={handleUpload}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                {isUploading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : 'Upload File'}
              </label>

            </div>
          )}
          {isUploading && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 truncate max-w-[200px]">
                      {currentUpload}
                    </span>
                    <span className="text-blue-600 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ease-out ${
                        uploadProgress === 100 
                          ? 'bg-green-500 animate-pulse-bar' 
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${
              viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md ${
              viewMode === 'table' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <select
            className="form-select border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value as FileType)}
          >
            {['all', 'documents', 'images', 'videos', 'audio', 'other'].map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <div className="p-6 bg-red-50 rounded-lg inline-block">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No files found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <FileGrid
          files={filteredFiles}
          onFileClick={handleFileClick}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <FileTable
          files={filteredFiles}
          onFileClick={handleFileClick}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default FolderContentsPage;