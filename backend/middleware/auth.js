const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      // Allow register route if no users exist
      if (req.path === '/register' && (await User.countDocuments()) === 0) {
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('groups');
    
    if (req.user.isArchived) {
      return res.status(403).json({ error: 'Account archived' });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }  
};

module.exports = authenticate;