export interface File {
  _id: string;
  name: string;
  type: string;
  fileType?: string;
  path: string;
  size?: number;
  uploadedBy?: string;
  uploadedAt?: string;
  isFolder: boolean;
  isFavorite?: boolean;
}

export type ViewMode = 'grid' | 'table';

export type FileType = 'all' | 'documents' | 'images' | 'videos' | 'audio' | 'other';