const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  path: { 
    type: String, 
    required: true 
  }, // Changed to "/EPGDocs" format
  parentFolder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Folder' 
  },
  group: { // Added group reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  permissions: [{
    group: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Group' 
    },
    canUpload: Boolean,
    canDownload: Boolean
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
});

module.exports = mongoose.model('Folder', FolderSchema);