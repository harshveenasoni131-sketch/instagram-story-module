const express = require('express');
const router = express.Router();
const ScheduledPost = require('../models/ScheduledPost');

// Helper to validate future dates
const isFutureDate = (dateString) => {
  const scheduledTime = new Date(dateString).getTime();
  const currentTime = new Date().getTime();
  return scheduledTime > currentTime;
};

// 1. Schedule a new post
router.post('/schedule', async (req, res) => {
  try {
    const { userId, imageUrl, caption, hashtags, taggedUsers, location, scheduledFor, userPlan } = req.body;

    if (!userId || !imageUrl || !scheduledFor) {
      return res.status(400).json({ success: false, message: 'Missing required fields (userId, imageUrl, scheduledFor).' });
    }

    // Validation 1: Future date check
    if (!isFutureDate(scheduledFor)) {
      return res.status(400).json({ success: false, message: 'Scheduled date and time must be in the future.' });
    }

    // Validation 2: Active scheduled posts limit (Max 2)
    const activeScheduledCount = await ScheduledPost.countDocuments({
      userId,
      status: 'scheduled'
    });

    if (activeScheduledCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Quota exceeded: You can only have a maximum of 2 scheduled posts at any given time.'
      });
    }

    // Validation 3: Subscription limit check (optional custom rules per plan)
    if (userPlan === 'free' && activeScheduledCount >= 1) {
      return res.status(403).json({
        success: false,
        message: 'Free tier limit reached. Upgrade your subscription to schedule more posts.'
      });
    }

    const newPostId = 'sched_' + Date.now();
    const scheduledPost = new ScheduledPost({
      postId: newPostId,
      userId,
      imageUrl,
      caption: caption || '',
      hashtags: hashtags || [],
      taggedUsers: taggedUsers || [],
      location: location || '',
      scheduledFor: new Date(scheduledFor),
      status: 'scheduled'
    });

    await scheduledPost.save();

    res.status(201).json({
      success: true,
      message: 'Post scheduled successfully!',
      data: scheduledPost
    });

  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ success: false, message: 'Server error while scheduling post.' });
  }
});

// 2. Get user's scheduled posts (hidden from main feed)
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await ScheduledPost.find({ userId: req.params.userId }).sort({ scheduledFor: 1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving scheduled posts.' });
  }
});

// 3. Edit / Reschedule a post
router.put('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, hashtags, taggedUsers, location, scheduledFor } = req.body;

    const post = await ScheduledPost.findOne({ postId, status: 'scheduled' });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Scheduled post not found or already published/cancelled.' });
    }

    if (scheduledFor) {
      if (!isFutureDate(scheduledFor)) {
        return res.status(400).json({ success: false, message: 'Rescheduled date must be in the future.' });
      }
      post.scheduledFor = new Date(scheduledFor);
    }

    if (caption !== undefined) post.caption = caption;
    if (hashtags !== undefined) post.hashtags = hashtags;
    if (taggedUsers !== undefined) post.taggedUsers = taggedUsers;
    if (location !== undefined) post.location = location;

    await post.save();

    res.json({ success: true, message: 'Scheduled post updated successfully.', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating scheduled post.' });
  }
});

// 4. Cancel a scheduled post
router.patch('/:postId/cancel', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await ScheduledPost.findOne({ postId });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.status = 'cancelled';
    await post.save();

    res.json({ success: true, message: 'Scheduled post cancelled.', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling scheduled post.' });
  }
});

module.exports = router;