import React, { useEffect, useState } from 'react';
import { File } from '../types/file';
import { filesApi } from '../api/files';
import { groupsApi } from '../api/groups';
import FolderContentsPage from './FolderContentsPage';

// Update FavoriteItem to include missing properties
interface FavoriteItem {
  _id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  fileType?: string;
  size?: number;
  uploadedBy?: string;
  uploadedAt?: string;
}

const FavoritesPage: React.FC = () => {
  const [favoriteFiles, setFavoriteFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch groups first
        const groups = await groupsApi.getGroupMap();
        
        // 2. Then fetch favorites
        const favorites = await filesApi.getFavorites();
        
        // 3. Map files USING THE GROUPS WE JUST FETCHED (not state)
        const mappedFiles = favorites.map((item: FavoriteItem) => {
          const pathSegments = item.path.split('/').filter(p => p !== '');
           // Get group name from path
            const groupName = pathSegments[0];
            
            // Get group ID from the nameToId map
            const groupId = groups.nameToId.get(groupName) || groupName;
          
          return {
            _id: item._id,
            name: item.name,
            path: `/${groupId}/${pathSegments.slice(1).join('/')}`,
            type: item.fileType || item.type,  // Use specific file type
            size: item.size || 0,
            uploadedBy: item.uploadedBy || 'Unknown',
            uploadedAt: item.uploadedAt || new Date().toISOString(),
            isFolder: item.type === 'folder',
            isFavorite: true
          };
        });

        setFavoriteFiles(mappedFiles);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <FolderContentsPage 
      files={favoriteFiles}
      loading={loading}
      disableNavigation={false}
    />
  );
};

export default FavoritesPage;