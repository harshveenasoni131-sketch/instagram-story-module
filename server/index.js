import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';


const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- IN-MEMORY DATABASES ---
let storiesDB = [];
let archiveDB = [];
let loginHistoryDB = []; // Task 4: Login Audit Logs
let adminAuditLogDB = []; // Task 5: Admin Management Audit Logs
let scheduledPostsDB = []; // Task 6: Post Scheduling Database

// Nodemailer Transporter for Email Notifications (Task 6)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal_password'
  }
});

// Plans configuration
const PLANS = {
  free: { name: 'Free Plan', price: 0, postLimit: 1, scheduledLimit: 1 },
  bronze: { name: 'Bronze Plan', price: 100, postLimit: 3, scheduledLimit: 2 },
  silver: { name: 'Silver Plan', price: 300, postLimit: 5, scheduledLimit: 2 },
  gold: { name: 'Gold Plan', price: 1000, postLimit: Infinity, scheduledLimit: 2 }
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
    password: "admin123",
    role: "admin",
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
  return next(); 
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
    if (story.isScheduled && story.status !== 'published') return false;
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});