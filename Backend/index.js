const express = require('express');
const cors = require('cors'); // <--- Add this line
const app = express();

app.use(cors()); // <--- Add this line right here
app.use(express.json());

// In-memory storage (Zero setup, 100% working)
let storiesDB = [];

// Create Story Route
app.post('/api/stories', (req, res) => {
  const { media, privacy } = req.body;
  const userId = req.body.userId || req.headers['user-id'];

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  const newStory = {
    _id: `story_${Date.now()}`,
    user: userId,
    media: media || [],
    privacy: privacy || 'public',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    analytics: {
      totalViews: 0,
      uniqueViewers: [],
      reactions: [],
      replies: [],
      viewTimeline: []
    }
  };

  storiesDB.unshift(newStory);

  return res.status(201).json({
    success: true,
    message: 'Story created successfully!',
    data: newStory
  });
});

// Get Stories with Privacy Tier Filtering
app.get('/api/stories', (req, res) => {
  const viewerId = req.headers['user-id']; // The person viewing the stories
  
  const activeStories = storiesDB.filter(story => {
    if (story.user === viewerId) return true;
    if (story.privacy === 'public') return true;
    if (story.privacy === 'followers') return true;
    if (story.privacy === 'close_friends') return false;
    return false;
  });

  return res.status(200).json({
    success: true,
    count: activeStories.length,
    stories: activeStories
  });
});

// 1. React to a Story
app.post('/api/stories/:id/react', (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.headers['user-id'];

  const story = storiesDB.find(s => s._id === id);
  if (!story) {
    return res.status(404).json({ success: false, message: 'Story not found' });
  }

  story.analytics.reactions.push({ user: userId, emoji, createdAt: new Date() });

  return res.status(200).json({
    success: true,
    message: 'Reaction added successfully!',
    reactionsCount: story.analytics.reactions.length
  });
});

// 2. Reply to a Story
app.post('/api/stories/:id/reply', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.headers['user-id'];

  const story = storiesDB.find(s => s._id === id);
  if (!story) {
    return res.status(404).json({ success: false, message: 'Story not found' });
  }

  story.analytics.replies.push({ user: userId, message, createdAt: new Date() });

  return res.status(200).json({
    success: true,
    message: 'Reply sent successfully!',
    repliesCount: story.analytics.replies.length
  });
});

// 3. Delete a Story (Story Management)
app.delete('/api/stories/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];

  const storyIndex = storiesDB.findIndex(s => s._id === id);
  if (storyIndex === -1) {
    return res.status(404).json({ success: false, message: 'Story not found' });
  }

  if (storiesDB[storyIndex].user !== userId) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this story' });
  }

  storiesDB.splice(storyIndex, 1);

  return res.status(200).json({
    success: true,
    message: 'Story deleted successfully!'
  });
});

// 4. View a Story with Unique Viewer Deduplication
app.post('/api/stories/:id/view', (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required to track views' });
  }

  const story = storiesDB.find(s => s._id === id);
  if (!story) {
    return res.status(404).json({ success: false, message: 'Story not found' });
  }

  const alreadyViewed = story.analytics.uniqueViewers.includes(userId);

  if (!alreadyViewed) {
    story.analytics.uniqueViewers.push(userId);
    story.analytics.totalViews += 1;
    story.analytics.viewTimeline.push({ user: userId, viewedAt: new Date() });
  }

  return res.status(200).json({
    success: true,
    message: alreadyViewed ? 'View already recorded' : 'View recorded successfully!',
    totalViews: story.analytics.totalViews,
    uniqueViewersCount: story.analytics.uniqueViewers.length
  });
});

// Archive storage for expired stories
let archiveDB = [];

// Automated 24-Hour Expiry Check (Runs every minute)
setInterval(() => {
  const now = new Date();
  const activeStories = [];

  storiesDB.forEach(story => {
    if (new Date(story.expiresAt) > now) {
      activeStories.push(story);
    } else {
      archiveDB.push({ ...story, archivedAt: now });
    }
  });

  if (storiesDB.length !== activeStories.length) {
    console.log(`[Cron] Cleaned up ${storiesDB.length - activeStories.length} expired story/stories.`);
    storiesDB = activeStories;
  }
}, 60 * 1000);

// --- TASK 2: MULTI-LANGUAGE & SECURE OTP VERIFICATION ---

// Mock Users Database for Task 2
const usersDB = new Map([
    ["user_123", {
        userId: "user_123",
        email: "harshveena@example.com",
        mobile: "+919876543210",
        language: "en",
        otp: null,
        otpExpiresAt: null,
        otpAttempts: 0
    }]
]);

// 1. Request Language Change & Trigger OTP
app.post('/api/language/request-change', (req, res) => {
    const { userId, language } = req.body;
    const supportedLanguages = ['en', 'es', 'hi', 'pt', 'zh', 'fr'];

    if (!supportedLanguages.includes(language)) {
        return res.status(400).json({ success: false, message: 'Invalid language selection' });
    }

    let user = usersDB.get(userId);
    if (!user) {
        user = { userId, email: "user@example.com", mobile: "+919876543210", language: "en", otp: null, otpExpiresAt: null, otpAttempts: 0 };
        usersDB.set(userId, user);
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = generatedOtp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;

    if (language === 'fr') {
        console.log(`[SECURITY] Sending Email OTP ${generatedOtp} to ${user.email} for French language request.`);
        return res.status(200).json({
            success: true,
            message: `OTP sent to your registered email (${user.email}) for French verification.`,
            verificationChannel: 'email'
        });
    } else {
        console.log(`[SECURITY] Sending SMS OTP ${generatedOtp} to ${user.mobile} for ${language.toUpperCase()} language request.`);
        return res.status(200).json({
            success: true,
            message: `OTP sent to your registered mobile (${user.mobile}) for verification.`,
            verificationChannel: 'mobile'
        });
    }
});

// 2. Verify OTP and Update Language Preference
app.post('/api/language/verify-otp', (req, res) => {
    const { userId, otp, newLanguage } = req.body;
    const user = usersDB.get(userId);

    if (!user || !user.otp) {
        return res.status(400).json({ success: false, message: 'No active OTP request found. Please request a change first.' });
    }

    if (user.otpAttempts >= 3) {
        user.otp = null;
        user.otpExpiresAt = null;
        return res.status(429).json({ success: false, message: 'Too many failed verification attempts. Please request a new OTP.' });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
        user.otpAttempts += 1;
        const remainingAttempts = 3 - user.otpAttempts;
        return res.status(400).json({ 
            success: false, 
            message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.` 
        });
    }

    user.language = newLanguage;
    user.otp = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;

    return res.status(200).json({
        success: true,
        message: `Language successfully updated to ${newLanguage}! Preference persisted.`,
        currentLanguage: user.language
    });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});