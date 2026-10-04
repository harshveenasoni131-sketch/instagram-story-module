const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.adminId || req.query.adminId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. No user ID provided.' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }

    req.admin = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in admin verification', error: error.message });
  }
};

module.exports = verifyAdmin;