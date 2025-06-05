const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const File = require('../models/File');
const Group = require('../models/Group');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const Folder = require('../models/Folder');
const path = require('path');
const archiver = require('archiver');
const fs = require('fs');
const fsPromises = require('fs').promises;



const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' Bytes';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
};

// Upload file with permissions
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.selectedGroup) {
      return res.status(403).json({ error: 'Group access not validated' });
    }


    if (!req.user.canUpload) {
      return res.status(403).json({ error: 'Upload permission denied' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const typeMap = {
      '.pdf': 'pdf',
      '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image', '.bmp': 'image', '.svg': 'image',
      '.csv': 'csv',
      '.doc': 'doc', '.docx': 'doc',
      '.xls': 'xlsx', '.xlsx': 'xlsx',
      '.ppt': 'pptx', '.pptx': 'pptx',
      '.txt': 'txt',
      '.zip': 'zip', '.rar': 'archive', '.7z': 'archive',
      '.mp3': 'audio', '.wav': 'audio',
      '.mp4': 'video', '.mov': 'video', '.avi': 'video'
    };


    // Construct clean path for response
    const cleanPath = path.join(
      '/',
      req.selectedGroup.name,
      req.uploadSubPath || '',
      path.basename(req.file.path)
    ).replace(/\\/g, '/');

    const newFile = new File({
      name: req.file.filename,
      path: cleanPath,
      size: req.file.size,
      group: req.selectedGroup._id,
      uploadedBy: req.user.id,
      fileType: typeMap[ext] || 'other', // Map extension to type
      permissions: []
    });

    await newFile.save();

    res.json({
      message: 'File uploaded successfully',
      file: {
        ...newFile.toObject(),
        path: cleanPath,
        formattedSize: formatFileSize(newFile.size)
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      error: 'Upload failed',
      details: err.message
    });
  }
});

// Archive file
router.post('/:id/archive', authenticate, async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(
      req.params.id,
      { 
        isArchived: true, 
        archivedAt: Date.now() 
      },
      { new: true }
    ).populate('group', 'name');
    
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    res.json({
      ...file.toObject(),
      formattedSize: formatFileSize(file.size),
      uploadedOn: file.uploadedOn,
      path: file.path.replace(/^.*EPGDocs/, '')
    });
  } catch (err) {
    console.error('Archive error:', err);
    res.status(500).json({ 
      error: 'Archival failed',
      details: err.message
    });
  }
});

//Archive Filtering

router.get('/', authenticate, async (req, res) => {
  try {
    const { isArchived } = req.query;
    const files = await File.find({ isArchived: isArchived === 'true' });
    
    const formattedFiles = files.map(file => ({
      ...file.toObject(),
      formattedSize: formatFileSize(file.size)
    }));
    
    res.json(formattedFiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Download a file (Check permissions)
router.get('/download/:id', authenticate, async (req, res) => {
  try {
    // Additional security check
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!req.user.canDownload) {
      return res.status(403).json({ error: 'Download permission denied' });
    }

    const file = await File.findById(req.params.id)
      .populate('group', 'name')
      .populate('permissions.user', 'role groups');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Enhanced permission check with proper group ID comparison
    const hasAccess = ['superadmin', 'admin'].includes(req.user.role) || 
      (file.group && req.user.groups.some(g => g._id.equals(file.group._id))) ||
      file.permissions.some(p => 
        p.user._id.equals(req.user._id) && p.canDownload
      );

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied',
        details: 'You lack permissions to download this file'
      });
    }

    // Construct proper file path
    const filePath = path.join(
      __dirname, // Current directory (routes folder)
      '../../', // Move up to project root
      'EPGDocs',
      file.group.name,
      ...file.path.split('/').slice(2) // Split and spread path components
    );

    // Verify file exists using fs.existsSync
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, file.name);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
});

// Download folder as ZIP
router.get('/download-folder/:groupId', authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const folderPath = path.join(
      __dirname,
      '../../',
      'EPGDocs',
      group.name,
      req.query.path || ''
    );

    const archive = archiver('zip');
    res.attachment(`${group.name}.zip`);
    archive.pipe(res);
    archive.directory(folderPath, false);
    archive.finalize();

  } catch (err) {
    res.status(500).json({ error: 'Folder download failed', details: err.message });
  }
});

// List folder contents
router.get('/list/:groupId', authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Construct path WITHOUT /EPGDocs
    const fullPath = path.join(
      '/', 
      group.name, 
      req.query.path || ''
    ).replace(/\\/g, '/');

    // Match files and folders directly under this path
    const regexPath = fullPath === '/' ? 
      `^/${group.name}/[^/]+$` : 
      `^${fullPath}/[^/]+$`;

    // Fetch files and folders
    const files = await File.find({ 
      group: group._id,
      path: { $regex: regexPath } 
    }).populate('uploadedBy', 'username');

    const folders = await Folder.find({
      group: group._id,
      path: { $regex: regexPath }
    });

    const result = [
      ...folders.map(f => ({ ...f.toObject(), type: 'folder' })),
      ...files.map(f => ({ ...f.toObject(), type: 'file' }))
    ];

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Toggle favorite status
router.post('/:id/favorite', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // Expect 'file' or 'folder' in the query
    const user = await User.findById(req.user._id);

    // Validate type
    if (!['file', 'folder'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    // Check if the item exists
    const Model = type === 'file' ? File : Folder;
    const item = await Model.findById(id);
    if (!item) return res.status(404).json({ error: `${type} not found` });

    // Toggle favorite
    const index = user.favorites.findIndex(fav => 
      fav.itemId.equals(id) && fav.itemType === Model.modelName
    );

    if (index === -1) {
      user.favorites.push({ itemType: Model.modelName, itemId: id });
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json({ message: 'Favorite toggled', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Get favorited files
// In files.js
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .lean(); // Convert to plain object for easier manipulation

    // Separate files and folders
    const fileFavorites = user.favorites.filter(fav => fav.itemType === 'File');
    const folderFavorites = user.favorites.filter(fav => fav.itemType === 'Folder');

    // Populate files and folders separately
    const populatedFiles = await File.find({
      _id: { $in: fileFavorites.map(f => f.itemId) }
    }).select('name path');

    const populatedFolders = await Folder.find({
      _id: { $in: folderFavorites.map(f => f.itemId) }
    }).select('name path');

    // Merge results
    const result = [
      ...populatedFiles.map(file => ({ ...file.toObject(), type: 'file' })),
      ...populatedFolders.map(folder => ({ ...folder.toObject(), type: 'folder' }))
    ];

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});
// Get all archived items
router.get('/archived-items', authenticate, async (req, res) => {
  try {
    const [files, folders, users, groups] = await Promise.all([
      File.find({ isArchived: true }),
      Folder.find({ isArchived: true }),
      User.find({ isArchived: true }).select('-password'),
      Group.find({ isArchived: true })
    ]);
    
    res.json({ files, folders, users, groups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch archived items' });
  }
});
module.exports = router;