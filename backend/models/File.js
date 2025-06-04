const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  path: { 
    type: String, 
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'csv', 'doc', 'docx', 'xlsx', 'pptx', 'txt', 'zip', 'archive', 'audio', 'video', 'other'],
    required: true
  },
  size: { 
    type: Number,
    required: true
  },
  uploadedOn: { 
    type: Date,
    default: Date.now
  },
  archivedAt: Date,
  permissions: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    canUpload: Boolean,
    canDownload: Boolean,
  }],
});

module.exports = mongoose.model('File', FileSchema);