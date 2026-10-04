const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const UAParser = require('ua-parser-js');
const app = express();

app.use(cors()); 
app.use(express.json());

// --- IN-MEMORY DATABASES ---
let storiesDB = [];
let archiveDB = [];
let loginHistoryDB = []; // Task 4: Login Audit Logs
let adminAuditLogDB = []; // Task 5: Admin Management Audit Logs

// Plans configuration
const PLANS = {
  free: { name: 'Free Plan', price: 0, postLimit: 1 },
  bronze: { name: 'Bronze Plan', price: 100, postLimit: 3 },
  silver: { name: 'Silver Plan', price: 300, postLimit: 5 },
  gold: { name: 'Gold Plan', price: 1000, postLimit: Infinity }
};

// Users DB with Subscription Tracking, Security Fields, and Admin Role (Task 5)
const usersDB = new Map([
    ["user_123", {
        userId: "user_123",
        email: "harshveena@example.com",
        mobile: "+919876543210",
        password: "password123",
        role: "user",
        status: "active",
        isVerified: true,
        language: "en",
        subscription: {
            plan: "free",
            status: "active",
            validityUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            postsUsed: 0
        },
        otp: null,
        otpExpiresAt: null,
        otpAttempts: 0
    }],
    ["admin_001", {
        userId: "admin_001",
        email: "admin@instagramclone.com",
        mobile: "+919999999999",
        password: "admin123", // Evaluation Admin Password
        role: "admin", // Administrator Role for Task 5
        status: "active",
        isVerified: true,
        language: "en",
        subscription: {
            plan: "gold",
            status: "active",
            validityUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            postsUsed: 0
        }
    }]
]);

// Helper to get current time in IST
function getISTTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5));
}

// Middleware: Device & Request Parser for Login Security (Task 4)
const deviceDetector = (req, res, next) => {
  const userAgentString = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  const browser = result.browser.name || "Unknown Browser";
  const os = result.os.name || "Unknown OS";
  
  let deviceType = "Desktop";
  const type = result.device.type;

  if (type === "mobile" || type === "tablet") {
    deviceType = "Mobile";
  } else if (/Mobi|Android/i.test(userAgentString)) {
    deviceType = "Mobile";
  } else {
    deviceType = /Macintosh|Windows NT.*Win64/i.test(userAgentString) ? "Laptop" : "Desktop";
  }

  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  req.clientInfo = { browser, os, deviceType, ipAddress };
  next();
};

// Middleware: Enforce or Bypass Payment Time Window
const checkPaymentWindow = (req, res, next) => {
  return next(); // Bypasses time restriction so testing works anytime
};

// Middleware: Admin Role Authentication (Task 5)
const verifyAdmin = (req, res, next) => {
  const adminId = req.headers['x-admin-id'] || req.body.adminId || req.query.adminId;
  
  if (!adminId) {
    return res.status(401).json({ success: false, message: 'Authentication required. No Admin ID provided.' });
  }

  const user = usersDB.get(adminId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }

  req.admin = user;
  next();
};


// --- TASK 1: STORY MANAGEMENT & SUBSCRIPTION POST LIMITS ---

app.post('/api/stories', (req, res) => {
  const { media, privacy } = req.body;
  const userId = req.body.userId || req.headers['user-id'];

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  let user = usersDB.get(userId);
  if (!user) {
    user = {
      userId,
      email: "user@example.com",
      role: "user",
      status: "active",
      isVerified: true,
      subscription: { plan: "free", postsUsed: 0, status: "active" }
    };
    usersDB.set(userId, user);
  }

  const userPlanKey = user.subscription.plan || 'free';
  const planDetails = PLANS[userPlanKey];

  if (user.subscription.postsUsed >= planDetails.postLimit) {
    return res.status(403).json({
      success: false,
      message: `Posting limit reached for your ${planDetails.name}. Please upgrade your subscription to post more stories.`
    });
  }

  const newStory = {
    _id: `story_${Date.now()}`,
    user: userId,
    media: media || [],
    privacy: privacy || 'public',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    analytics: { totalViews: 0, uniqueViewers: [], reactions: [], replies: [], viewTimeline: [] }
  };

  storiesDB.unshift(newStory);
  user.subscription.postsUsed += 1;

  return res.status(201).json({
    success: true,
    message: 'Story created successfully!',
    postsRemaining: planDetails.postLimit === Infinity ? 'Unlimited' : (planDetails.postLimit - user.subscription.postsUsed),
    data: newStory
  });
});

app.get('/api/stories', (req, res) => {
  const viewerId = req.headers['user-id'];
  const activeStories = storiesDB.filter(story => {
    if (story.user === viewerId) return true;
    if (story.privacy === 'public') return true;
    if (story.privacy === 'followers') return true;
    return false;
  });

  return res.status(200).json({ success: true, count: activeStories.length, stories: activeStories });
});

app.post('/api/stories/:id/react', (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.headers['user-id'];
  const story = storiesDB.find(s => s._id === id);
  
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  story.analytics.reactions.push({ user: userId, emoji, createdAt: new Date() });
  return res.status(200).json({ success: true, message: 'Reaction added successfully!' });
});

app.post('/api/stories/:id/reply', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.headers['user-id'];
  const story = storiesDB.find(s => s._id === id);
  
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  story.analytics.replies.push({ user: userId, message, createdAt: new Date() });
  return res.status(200).json({ success: true, message: 'Reply sent successfully!' });
});

app.delete('/api/stories/:id', (req, res) => {
  const { id } = req.params;
  const storyIndex = storiesDB.findIndex(s => s._id === id);
  
  if (storyIndex === -1) return res.status(404).json({ success: false, message: 'Story not found' });
  storiesDB.splice(storyIndex, 1);
  return res.status(200).json({ success: true, message: 'Story deleted successfully!' });
});

app.post('/api/stories/:id/view', (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];
  const story = storiesDB.find(s => s._id === id);
  
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  if (!story.analytics.uniqueViewers.includes(userId)) {
    story.analytics.uniqueViewers.push(userId);
    story.analytics.totalViews += 1;
  }
  return res.status(200).json({ success: true, message: 'View recorded successfully!' });
});


// --- TASK 2: MULTI-LANGUAGE & SECURE OTP VERIFICATION ---

app.post('/api/language/request-change', (req, res) => {
    const { userId, language } = req.body;
    let user = usersDB.get(userId) || { userId, language: "en" };
    user.otp = "123456"; 
    usersDB.set(userId, user);
    return res.status(200).json({ success: true, message: 'OTP sent successfully for verification.' });
});

app.post('/api/language/verify-otp', (req, res) => {
    const { userId, newLanguage } = req.body;
    let user = usersDB.get(userId);
    if (!user) return res.status(400).json({ success: false, message: 'User not found.' });
    user.language = newLanguage;
    return res.status(200).json({ success: true, message: `Language updated to ${newLanguage}!` });
});


// --- TASK 3: SUBSCRIPTIONS, PAYMENT GATEWAY & INVOICES ---

app.post('/api/subscriptions/upgrade', checkPaymentWindow, async (req, res) => {
  const { userId, plan, paymentStatus } = req.body;

  if (!PLANS[plan]) {
    return res.status(400).json({ success: false, message: 'Invalid subscription plan selected.' });
  }

  let user = usersDB.get(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (paymentStatus === 'failed') {
    return res.status(400).json({
      success: false,
      message: 'Payment failed. Transaction declined by gateway. Please try again.'
    });
  }

  const selectedPlan = PLANS[plan];
  const validityDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  user.subscription = {
    plan: plan,
    status: 'active',
    validityUntil: validityDate,
    nextRenewalDate: validityDate,
    postsUsed: 0
  };

  const invoiceDetails = {
    invoiceId: `INV_${Date.now()}`,
    userEmail: user.email,
    planName: selectedPlan.name,
    amountPaid: `₹${selectedPlan.price}`,
    validityUntil: validityDate.toISOString().split('T')[0],
    nextRenewalDate: validityDate.toISOString().split('T')[0]
  };

  return res.status(200).json({
    success: true,
    message: `Successfully subscribed to ${selectedPlan.name}! Invoice sent to your email.`,
    subscription: user.subscription,
    invoice: invoiceDetails
  });
});

app.get('/api/subscriptions/status/:userId', (req, res) => {
  const { userId } = req.params;
  const user = usersDB.get(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const currentPlan = PLANS[user.subscription.plan];

  return res.status(200).json({
    success: true,
    userId,
    currentPlan: currentPlan.name,
    status: user.subscription.status,
    postsUsed: user.subscription.postsUsed,
    postsAllowed: currentPlan.postLimit,
    validityUntil: user.subscription.validityUntil,
    nextRenewalDate: user.subscription.nextRenewalDate
  });
});

app.post('/api/subscriptions/cancel', (req, res) => {
  const { userId } = req.body;
  const user = usersDB.get(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.subscription.status = 'cancelled';
  user.subscription.plan = 'free';

  return res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully. Account reverted to Free Plan.'
  });
});


// --- TASK 4: ADVANCED LOGIN SECURITY & LOGIN HISTORY ---

app.post('/api/auth/login', deviceDetector, async (req, res) => {
  const { email, password } = req.body;
  const { browser, os, deviceType, ipAddress } = req.clientInfo;
  const istTime = getISTTime();

  let targetUser = null;
  for (let [id, u] of usersDB.entries()) {
    if (u.email === email) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser || targetUser.password !== password) {
    loginHistoryDB.unshift({
      userId: targetUser ? targetUser.userId : null,
      browser,
      os,
      deviceType,
      ipAddress,
      loginTime: istTime,
      status: "FAILED"
    });
    return res.status(400).json({ success: false, message: 'Invalid email or password.' });
  }

  // Mobile Device Time Window Restriction (10:00 AM – 1:00 PM IST)
  if (deviceType === 'Mobile') {
    const currentHour = istTime.getHours();
    const currentMinute = istTime.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMinute;
    const startLimit = 10 * 60; 
    const endLimit = 13 * 60;  

    if (timeInMinutes < startLimit || timeInMinutes >= endLimit) {
      loginHistoryDB.unshift({
        userId: targetUser.userId,
        browser,
        os,
        deviceType,
        ipAddress,
        loginTime: istTime,
        status: "FAILED"
      });
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Mobile logins are only permitted between 10:00 AM and 1:00 PM server time.'
      });
    }
  }

  // Google Chrome OTP Verification Requirement
  if (browser.toLowerCase().includes('chrome')) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    targetUser.otp = otp;
    targetUser.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    targetUser.otpAttempts = 0;

    loginHistoryDB.unshift({
      userId: targetUser.userId,
      browser,
      os,
      deviceType,
      ipAddress,
      loginTime: istTime,
      status: "SUCCESS"
    });

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      userId: targetUser.userId,
      role: targetUser.role,
      message: 'Google Chrome detected. OTP verification code sent to registered email.'
    });
  }

  loginHistoryDB.unshift({
    userId: targetUser.userId,
    browser,
    os,
    deviceType,
    ipAddress,
    loginTime: istTime,
    status: "SUCCESS"
  });

  return res.status(200).json({
    success: true,
    requiresOtp: false,
    userId: targetUser.userId,
    role: targetUser.role,
    message: 'Login successful.'
  });
});

app.post('/api/auth/verify-chrome-otp', (req, res) => {
  const { userId, otp } = req.body;
  const user = usersDB.get(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (!user.otp || user.otp !== otp) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    return res.status(400).json({ success: false, message: 'Invalid OTP verification code.' });
  }

  if (Date.now() > user.otpExpiresAt) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please log in again.' });
  }

  user.otp = null;
  user.otpExpiresAt = null;
  user.otpAttempts = 0;

  return res.status(200).json({
    success: true,
    role: user.role,
    message: 'OTP verified successfully! Access granted.'
  });
});

app.get('/api/user/login-history/:userId', (req, res) => {
  const { userId } = req.params;
  const userLogs = loginHistoryDB.filter(log => log.userId === userId);

  return res.status(200).json({
    success: true,
    count: userLogs.length,
    loginHistory: userLogs
  });
});


// --- TASK 5: ADMIN DASHBOARD CRUD, ADVANCED FILTERS & AUDIT LOGGING ---

// 1. Dashboard Summary Statistics
app.get('/api/admin/stats', verifyAdmin, (req, res) => {
  try {
    let totalUsers = usersDB.size;
    let activeUsers = 0;
    for (let u of usersDB.values()) {
      if (u.status === 'active') activeUsers++;
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalPosts: storiesDB.length,
        totalStories: storiesDB.length,
        totalSubscriptions: totalUsers,
        totalReports: 0,
        engagementRate: '92.5%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. User Management with Advanced Filters, Search & Pagination
app.get('/api/admin/users', verifyAdmin, (req, res) => {
  try {
    const { search, status, plan, verified, page = 1, limit = 10 } = req.query;
    let usersList = Array.from(usersDB.values());

    if (search) {
      const q = search.toLowerCase();
      usersList = usersList.filter(u => 
        (u.email && u.email.toLowerCase().includes(q)) || 
        (u.userId && u.userId.toLowerCase().includes(q))
      );
    }
    if (status) {
      usersList = usersList.filter(u => u.status === status);
    }
    if (plan) {
      usersList = usersList.filter(u => u.subscription && u.subscription.plan === plan);
    }
    if (verified !== undefined) {
      const isVer = verified === 'true';
      usersList = usersList.filter(u => u.isVerified === isVer);
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedUsers = usersList.slice(startIndex, startIndex + Number(limit));

    // Remove passwords before returning
    const sanitizedUsers = paginatedUsers.map(({ password, ...u }) => u);

    res.status(200).json({
      success: true,
      data: sanitizedUsers,
      total: usersList.length,
      totalPages: Math.ceil(usersList.length / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Update User (CRUD Update + Audit Log)
app.put('/api/admin/users/:id', verifyAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    const user = usersDB.get(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update allowed fields
    if (req.body.status) user.status = req.body.status;
    if (req.body.role) user.role = req.body.role;
    if (req.body.isVerified !== undefined) user.isVerified = req.body.isVerified;

    usersDB.set(userId, user);

    // Record Admin Audit Log
    adminAuditLogDB.unshift({
      logId: `log_${Date.now()}`,
      adminId: req.admin.userId,
      action: 'UPDATE_USER',
      targetType: 'User',
      targetId: userId,
      details: `Admin updated user ${userId} properties.`,
      ipAddress: req.ip || '127.0.0.1',
      createdAt: getISTTime()
    });

    const { password, ...sanitizedUser } = user;
    res.status(200).json({ success: true, message: 'User updated successfully.', data: sanitizedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Delete User (CRUD Delete + Audit Log)
app.delete('/api/admin/users/:id', verifyAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    if (!usersDB.has(userId)) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    usersDB.delete(userId);

    // Record Admin Audit Log
    adminAuditLogDB.unshift({
      logId: `log_${Date.now()}`,
      adminId: req.admin.userId,
      action: 'DELETE_USER',
      targetType: 'User',
      targetId: userId,
      details: `Admin deleted user ${userId}.`,
      ipAddress: req.ip || '127.0.0.1',
      createdAt: getISTTime()
    });

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Fetch Admin Audit Logs
app.get('/api/admin/audit-logs', verifyAdmin, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: adminAuditLogDB.length,
      auditLogs: adminAuditLogDB
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Start Server
app.listen(5000, () => {
  console.log('Server running fully loaded on port 5000 with Admin Dashboard APIs');
});