const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Group = require('../models/Group'); // Add Group model

const sanitizePath = (path) => {
  return path
    .replace(/\.\./g, '')
    .replace(/\/\//g, '/')
    .replace(/^\//, '')
    .replace(/\/$/, '');
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Extract group name from path parameter
      const [groupName, ...restPath] = (req.query.path || '').split('/');
      const subPath = restPath.join('/');
      
      // Validate group exists and user has access
      const group = await Group.findOne({ name: groupName });
      if (!group) throw new Error('Group not found');
      
      if (!decoded.groups.includes(group._id.toString())) {
        throw new Error('User not authorized for this group');
      }

      const fullPath = path.join(
        __dirname,
        '../../EPGDocs',
        groupName,
        sanitizePath(subPath)
      );

      fs.mkdirSync(fullPath, { recursive: true });
      req.destination = fullPath;
      req.selectedGroup = group; // Attach group to request
      req.uploadSubPath = subPath;
      cb(null, fullPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    let counter = 1;

    const getUniqueName = (base, extension, count) => {
      const newName = count === 1 ? 
        `${base}${extension}` : 
        `${base} (${count - 1})${extension}`;

      if (fs.existsSync(path.join(req.destination, newName))) {
        return getUniqueName(base, extension, count + 1);
      }
      return newName;
    };

    cb(null, getUniqueName(originalName, ext, 1));
  }
});

const upload = multer({ storage });
module.exports = upload;