import { v4 as uuidv4 } from 'uuid';

// Base notification function
export const notify = (data: {
  type: 'success' | 'error' | 'info' | 'upload';
  title: string;
  message?: string;
  progress?: number;
}) => {
  const event = new CustomEvent('notify', { detail: data });
  window.dispatchEvent(event);
  return data.type === 'upload' ? uuidv4() : null;
};

// Auth notifications
export const notifyLoginSuccess = (username: string) => {
  notify({
    type: 'success',
    title: 'Welcome back!',
    message: `Successfully logged in as ${username}`
  });
};

export const notifyLoginError = (message: string) => {
  notify({
    type: 'error',
    title: 'Login Failed',
    message
  });
};

export const notifyLogout = () => {
  notify({
    type: 'info',
    title: 'Logged Out',
    message: 'You have been successfully logged out'
  });
};

// User management notifications
export const notifyUserCreated = (username: string) => {
  notify({
    type: 'success',
    title: 'User Created',
    message: `Successfully created user ${username}`
  });
};

export const notifyUserUpdated = (username: string) => {
  notify({
    type: 'success',
    title: 'User Updated',
    message: `Successfully updated user ${username}`
  });
};

export const notifyUserArchived = (username: string) => {
  notify({
    type: 'info',
    title: 'User Archived',
    message: `User ${username} has been archived`
  });
};

export const notifyPermissionsUpdated = (username: string) => {
  notify({
    type: 'success',
    title: 'Permissions Updated',
    message: `Successfully updated permissions for ${username}`
  });
};

// Group management notifications
export const notifyGroupCreated = (name: string) => {
  notify({
    type: 'success',
    title: 'Group Created',
    message: `Successfully created group ${name}`
  });
};

export const notifyGroupUpdated = (name: string) => {
  notify({
    type: 'success',
    title: 'Group Updated',
    message: `Successfully updated group ${name}`
  });
};

export const notifyGroupArchived = (name: string) => {
  notify({
    type: 'info',
    title: 'Group Archived',
    message: `Group ${name} has been archived`
  });
};

// File operation notifications
export const notifyUploadStart = (filename: string) => {
  return notify({
    type: 'upload',
    title: 'Upload Started',
    message: filename,
    progress: 0
  });
};

export const notifyUploadProgress = (id: string, progress: number) => {
  const event = new CustomEvent('updateProgress', { 
    detail: { id, progress } 
  });
  window.dispatchEvent(event);
};

export const notifyUploadSuccess = (filename: string) => {
  notify({
    type: 'success',
    title: 'Upload Complete',
    message: `Successfully uploaded ${filename}`
  });
};

export const notifyUploadError = (filename: string, error?: string) => {
  notify({
    type: 'error',
    title: 'Upload Failed',
    message: `Failed to upload ${filename}${error ? `: ${error}` : ''}`
  });
};

export const notifyDownloadStart = (filename: string) => {
  notify({
    type: 'info',
    title: 'Download Started',
    message: `Starting download of ${filename}`
  });
};

export const notifyDownloadSuccess = (filename: string) => {
  notify({
    type: 'success',
    title: 'Download Complete',
    message: `Successfully downloaded ${filename}`
  });
};

export const notifyDownloadError = (filename: string, error?: string) => {
  notify({
    type: 'error',
    title: 'Download Failed',
    message: `Failed to download ${filename}${error ? `: ${error}` : ''}`
  });
};

export const notifyFavoriteToggled = (filename: string, isFavorite: boolean) => {
  notify({
    type: 'success',
    title: isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
    message: filename
  });
};

// System notifications
export const notifyNetworkError = (message: string) => {
  notify({
    type: 'error',
    title: 'Network Error',
    message
  });
};

export const notifyApiError = (message: string) => {
  notify({
    type: 'error',
    title: 'API Error',
    message
  });
};