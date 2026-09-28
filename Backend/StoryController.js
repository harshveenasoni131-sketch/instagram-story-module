// In-Memory Database Storage (100% reliable, zero local setup required)
let storiesDB = [];

// 1. Create a Story
exports.createStory = async (req, res) => {
  try {
    const { media, privacy } = req.body;
    const userId = req.body.userId || req.headers['user-id'];

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!media || !Array.isArray(media) || media.length === 0) {
      return res.status(400).json({ success: false, message: 'Media array is required' });
    }

    const newStory = {
      _id: `story_${Date.now()}`,
      user: userId,
      media: media,
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
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Get All Stories
exports.getStories = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: storiesDB.length,
      stories: storiesDB
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};