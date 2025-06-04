const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const authenticate = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all users
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('groups');
    res.json(users);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's groups
router.get('/me/groups', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('groups')
      .lean();
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.groups || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's groups by ID
router.get('/:id/groups', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('groups', 'name _id');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.groups || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (Superadmin only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { username, password, role } = req.body;

    // Check existing user
    if (await User.findOne({ username })) {
      return res.status(409).json({ error: 'Username exists' });
    }

    // Create and save
    const newUser = new User({
      username,
      password,
      role,
      canUpload: true,
      canDownload: true,
      groups: []
    });

    await newUser.save();
    
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'Creation failed' });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const updates = {};

    // Only superadmin can update username and role
    if (req.user.role === 'superadmin') {
      if (username) updates.username = username;
      if (role) updates.role = role;
    }

    // Handle password update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Update user permissions
router.put('/:id/permissions', authenticate, async (req, res) => {
  try {
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { canUpload, canDownload, groups } = req.body;
    const updates = {};

    if (typeof canUpload === 'boolean') updates.canUpload = canUpload;
    if (typeof canDownload === 'boolean') updates.canDownload = canDownload;
    if (Array.isArray(groups)) updates.groups = groups;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Permission update error:', err);
    res.status(500).json({ error: 'Permission update failed' });
  }
});

// Archive user
router.post('/:id/archive', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.user._id.equals(req.params.id)) {
      return res.status(400).json({ error: 'Cannot archive yourself' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, archivedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Archival error:', err);
    res.status(500).json({ error: 'Archival failed' });
  }
});

// Add groups to user
router.post('/:id/groups', authenticate, async (req, res) => {
  try {
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { groups: { $each: req.body.groups } } },
      { new: true }
    ).populate('groups');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;