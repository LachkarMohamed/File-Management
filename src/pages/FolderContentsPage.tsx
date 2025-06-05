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

// Rest of the file remains unchanged