const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

// --- IN-MEMORY DATABASES ---
let storiesDB = [];
let archiveDB = [];

// Plans configuration
const PLANS = {
  free: { name: 'Free Plan', price: 0, postLimit: 1 },
  bronze: { name: 'Bronze Plan', price: 100, postLimit: 3 },
  silver: { name: 'Silver Plan', price: 300, postLimit: 5 },
  gold: { name: 'Gold Plan', price: 1000, postLimit: Infinity }
};

// Users DB with Subscription Tracking
const usersDB = new Map([
    ["user_123", {
        userId: "user_123",
        email: "harshveena@example.com",
        mobile: "+919876543210",
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
    }]
]);

// Helper to get current time in IST
function getISTTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5));
}

// Middleware: Enforce Payment Time Window (5:00 AM to 11:00 AM IST)
const checkPaymentWindow = (req, res, next) => {
  const ist = getISTTime();
  const hours = ist.getHours();
  
  // Uncomment the line below if you want to bypass time restrictions during night testing
  // return next(); 

  if (hours < 5 || hours >= 11) {
    return res.status(400).json({
      success: false,
      message: 'Payments are currently unavailable. Payments are only accepted between 5:00 AM and 11:00 AM IST.'
    });
  }
  next();
};

// --- TASK 1: STORY MANAGEMENT & SUBSCRIPTION POST LIMITS ---

// Create Story Route (Validated against user's subscription plan post limits)
app.post('/api/stories', (req, res) => {
  const { media, privacy } = req.body;
  const userId = req.body.userId || req.headers['user-id'];

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  let user = usersDB.get(userId);
  if (!user) {
    // Default user setup if not found
    user = {
      userId,
      email: "user@example.com",
      subscription: { plan: "free", postsUsed: 0, status: "active" }
    };
    usersDB.set(userId, user);
  }

  const userPlanKey = user.subscription.plan || 'free';
  const planDetails = PLANS[userPlanKey];

  // Check if user has exceeded plan limit
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

// Get Stories Route
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

// React Route
app.post('/api/stories/:id/react', (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.headers['user-id'];
  const story = storiesDB.find(s => s._id === id);
  
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  story.analytics.reactions.push({ user: userId, emoji, createdAt: new Date() });
  return res.status(200).json({ success: true, message: 'Reaction added successfully!' });
});

// Reply Route
app.post('/api/stories/:id/reply', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.headers['user-id'];
  const story = storiesDB.find(s => s._id === id);
  
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  story.analytics.replies.push({ user: userId, message, createdAt: new Date() });
  return res.status(200).json({ success: true, message: 'Reply sent successfully!' });
});

// Delete Route
app.delete('/api/stories/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];
  const storyIndex = storiesDB.findIndex(s => s._id === id);
  
  if (storyIndex === -1) return res.status(404).json({ success: false, message: 'Story not found' });
  storiesDB.splice(storyIndex, 1);
  return res.status(200).json({ success: true, message: 'Story deleted successfully!' });
});

// View Route
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
    user.otp = "123456"; // Mock OTP for quick testing
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

// 1. Upgrade Subscription (Protected by Time-Window & Payment verification)
app.post('/api/subscriptions/upgrade', checkPaymentWindow, (req, res) => {
  const { userId, plan, paymentStatus } = req.body; // paymentStatus can be 'success' or 'failed'

  if (!PLANS[plan]) {
    return res.status(400).json({ success: false, message: 'Invalid subscription plan selected.' });
  }

  let user = usersDB.get(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Handle simulated payment failure
  if (paymentStatus === 'failed') {
    return res.status(400).json({
      success: false,
      message: 'Payment failed. Transaction declined by gateway. Please try again.'
    });
  }

  const selectedPlan = PLANS[plan];
  const validityDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

  // Update user subscription details
  user.subscription = {
    plan: plan,
    status: 'active',
    validityUntil: validityDate,
    nextRenewalDate: validityDate,
    postsUsed: 0 // Reset post count on upgrade
  };

  // Simulate sending invoice email
  const invoiceDetails = {
    invoiceId: `INV_${Date.now()}`,
    userEmail: user.email,
    planName: selectedPlan.name,
    amountPaid: `₹${selectedPlan.price}`,
    validityUntil: validityDate.toISOString().split('T')[0],
    nextRenewalDate: validityDate.toISOString().split('T')[0]
  };

  console.log(`[EMAIL DISPATCH] Invoice sent to ${user.email}:`, invoiceDetails);

  return res.status(200).json({
    success: true,
    message: `Successfully subscribed to ${selectedPlan.name}! Invoice sent to your email.`,
    subscription: user.subscription,
    invoice: invoiceDetails
  });
});

// 2. Subscription Status & Management
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

// 3. Cancel Subscription
app.post('/api/subscriptions/cancel', (req, res) => {
  const { userId } = req.body;
  const user = usersDB.get(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.subscription.status = 'cancelled';
  user.subscription.plan = 'free'; // Downgrade to free on cancellation

  return res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully. Account reverted to Free Plan.'
  });
});


// Start Server
app.listen(5000, () => {
  console.log('Server running fully loaded on port 5000');
});