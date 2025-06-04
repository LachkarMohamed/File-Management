const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const Folder = require('../models/Folder');
const authenticate = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Create group (Superadmin only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name required' });

    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(409).json({ error: 'Group exists' });
    }

    // 1. Create the group
    const newGroup = new Group({ name });
    await newGroup.save();

    // 2. Create root folder document for this group
    const rootFolder = new Folder({
      name: name, // e.g., "informatics"
      path: `/${name}`, // Matches the group's directory
      group: newGroup._id, // Link to the group
      parentFolder: null // Root folder has no parent
    });
    await rootFolder.save();

    // 3. Create physical directory
    const groupPath = path.join(__dirname, '../../EPGDocs', name);
    fs.mkdirSync(groupPath, { recursive: true });

    // 4. Add group to admins/superadmins (existing code)
    await User.updateMany(
      { role: { $in: ['superadmin', 'admin'] } },
      { $addToSet: { groups: newGroup._id } }
    );

    res.status(201).json(newGroup);
  } catch (err) {
    console.error('Group creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/archive', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, archivedAt: Date.now() },
      { new: true }
    );
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    // Archive all folders in this group
    await Folder.updateMany(
      { group: group._id },
      { isArchived: true, archivedAt: Date.now() }
    );
    await File.updateMany(
      { group: group._id },
      { isArchived: true, archivedAt: Date.now() }
    );
    
    res.json({ message: 'Group archived', group });
  } catch (err) {
    res.status(500).json({ error: 'Archival failed' });
  }
});

router.post('/:id/restore', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    // Restore all folders in this group
    await Folder.updateMany(
      { group: group._id },
      { isArchived: false, archivedAt: null }
    );
    
    res.json({ message: 'Group restored', group });
  } catch (err) {
    res.status(500).json({ error: 'Restore failed' });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().select('name _id');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update group name
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    // Update root folder name
    await Folder.findOneAndUpdate(
      { group: group._id, parentFolder: null },
      { name: req.body.name, path: `/${req.body.name}` }
    );

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;