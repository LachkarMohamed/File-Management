const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const authenticate = require('../middleware/auth');

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    // Create a JWT token (expires in 1 hour)
    const token = jwt.sign(
  { 
    id: user._id,
    role: user.role,
    groups: user.groups,
    canUpload: user.canUpload,
    canDownload: user.canDownload
  },
  process.env.JWT_SECRET,
  { expiresIn: '5h' }
);

    res.json({ token }); // Send the token to the client (React app)

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register Route (Only superadmins can create new users)
// Register Route - Allow initial superadmin creation
router.post('/register', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    
    // First user bypass
    if (userCount > 0) {
      if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const { username, password, role, groups } = req.body;

    

    // Validate groups exist
    const validGroups = await Group.find({ _id: { $in: groups || [] } });
    if (groups && validGroups.length !== groups.length) {
      return res.status(400).json({ error: 'Invalid group IDs' });
    }

    // Create user
    const newUser = new User({
      username,
      password,
      role: userCount === 0 ? 'superadmin' : role,
      groups: userCount === 0 ? 
        (await Group.find()).map(g => g._id) : 
        (groups || [])
    });

    await newUser.save();
    res.json({ message: 'User created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user (simplified)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('_id username role canUpload canDownload');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;