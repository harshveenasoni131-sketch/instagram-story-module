const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdminAuditLog = require('../models/AdminAuditLog');
const verifyAdmin = require('../middleware/adminAuth');

// Apply admin authentication middleware to all admin routes
router.use(verifyAdmin);

// ==========================================
// 1. DASHBOARD SUMMARY STATISTICS API
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' }); // Adjust field if needed
    
    // Fallback counts or counts from other models if available
    const totalPosts = req.db?.collection('posts') ? await req.db.collection('posts').countDocuments() : 0;
    const totalStories = req.db?.collection('stories') ? await req.db.collection('stories').countDocuments() : 0;
    const totalSubscriptions = req.db?.collection('subscriptions') ? await req.db.collection('subscriptions').countDocuments() : 0;
    const totalReports = req.db?.collection('reports') ? await req.db.collection('reports').countDocuments() : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalPosts,
        totalStories,
        totalSubscriptions,
        totalReports,
        engagementRate: '88.4%' // Placeholder or calculated metric
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
});

// ==========================================
// 2. USER MANAGEMENT CRUD & ADVANCED FILTERS
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const { search, status, plan, verified, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search,$options: 'i' } },
        { email: { $regex: search,$options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (plan) query.subscriptionPlan = plan;
    if (verified !== undefined) query.isVerified = verified === 'true';

    const users = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update User (Admin Action with Audit Log)
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    
    // Log audit action
    await AdminAuditLog.create({
      adminId: req.admin._id,
      action: 'UPDATE_USER',
      targetType: 'User',
      targetId: req.params.id,
      details: `Updated user profile for ID: ${req.params.id}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete User (Admin Action with Audit Log)
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    // Log audit action
    await AdminAuditLog.create({
      adminId: req.admin._id,
      action: 'DELETE_USER',
      targetType: 'User',
      targetId: req.params.id,
      details: `Deleted user with ID: ${req.params.id}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// ==========================================
// 3. AUDIT LOGS VIEW API
// ==========================================
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AdminAuditLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

module.exports = router; 