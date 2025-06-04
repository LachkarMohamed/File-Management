const Folder = require('../models/Folder');
const Group = require('../models/Group');

const checkFolderAccess = (action) => {
  return async (req, res, next) => {
    try {
      // Superadmins bypass permissions
      if (req.user.role === 'superadmin' || req.user.role === 'admin') return next();
      
      const folder = await Folder.findById(req.params.folderId);
      const userGroup = await Group.findById(req.user.group);

      if (!userGroup) return res.status(403).json({ error: 'No group assigned' });

      const permission = folder.permissions.find(p => 
        p.group.equals(userGroup._id)
      );

      if (!permission || !permission[action]) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

module.exports = { checkFolderAccess };