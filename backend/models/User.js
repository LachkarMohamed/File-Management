const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// Define the User schema (structure of the User collection in MongoDB)
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true // No duplicate usernames allowed
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin', 'user'], // Only these roles are allowed
    default: 'user' // Default role is 'user'
  },
  groups: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Group',
  required: true
  }],
  canUpload: { 
    type: Boolean,
    default: true 
  },
  canDownload: { 
    type: Boolean,
    default: true 
  },

  favorites: [{
    itemType: {
      type: String,
      enum: ['File', 'Folder'], // Allowed types
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'favorites.itemType' // Dynamic reference based on itemType
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
});

// Hash the password BEFORE saving the user to the database
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is changed
  const salt = await bcrypt.genSalt(10); // Generate a "salt" (random string)
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Create the User model
module.exports = mongoose.model('User', UserSchema);