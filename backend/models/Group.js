const mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
});
module.exports = mongoose.model('Group', GroupSchema);
