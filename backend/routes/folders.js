const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Group = require('../models/Group');
const authenticate = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Create a new folder (with physical directory)
router.post('/create', async (req, res) => {
  const { name, parentFolderId, groupId } = req.body;

  try {
    const parentFolder = await Folder.findById(parentFolderId);
    let folderPath;

    if (parentFolder) {
      folderPath = `${parentFolder.path}/${name}`;
    } else {
      // Root folder for the group: "/EPGDocs/groupName"
      const group = await Group.findById(groupId); 
      if (!group) return res.status(404).json({ error: 'Group not found' });
      folderPath = `/EPGDocs/${group.name}/${name}`;
    }

    // Create folder document
    const newFolder = new Folder({
      name,
      path: folderPath,
      parentFolder: parentFolderId,
      group: groupId
    });
    await newFolder.save();

    // Create physical directory
    const fullPath = path.join(__dirname, '../../', folderPath);
    fs.mkdirSync(fullPath, { recursive: true });

    res.json({ message: 'Folder created!', folder: newFolder });
  } catch (err) {
    console.error('Folder creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Archive folder
router.post('/:id/archive', authenticate, async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { 
        isArchived: true, 
        archivedAt: Date.now() 
      },
      { new: true }
    );
    
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: 'Archival failed' });
  }
});



module.exports = router; 