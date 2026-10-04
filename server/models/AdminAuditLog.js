const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'DELETE_USER', 'UPDATE_POST', 'RESOLVE_REPORT'
  targetType: { type: String, required: true }, // e.g., 'User', 'Post', 'Subscription'
  targetId: { type: mongoose.Schema.Types.ObjectId, required: false },
  details: { type: String, required: false },
  ipAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);