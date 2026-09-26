// In-Memory Storage (Bypasses MongoDB completely)
let storiesDB = [];

// 1. Create Story
exports.createStory = async (req, res) => {
  try {
    const { media, mediaUrl, mediaType, privacy } = req.body;
    const userId = req.user.id;
    const storyPrivacy = privacy || 'public';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (Array.isArray(media) && media.length > 0) {
      const createdStories = media.map((item, index) => ({
        _id: `story_${Date.now()}_${index}`,
        user: userId,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType || 'image',
        privacy: storyPrivacy,
        expiresAt,
        viewsCount: 0,
        uniqueViewers: [],
        viewTimeline: [],
        reactions: [],
        replies: []
      }));
      
      storiesDB.push(...createdStories);
      return res.status(201).json({ success: true, count: createdStories.length, stories: createdStories });
    }

    const newStory = {
      _id: `story_${Date.now()}`,
      user: userId,
      mediaUrl,
      mediaType,
      privacy: storyPrivacy,
      expiresAt,
      viewsCount: 0,
      uniqueViewers: [],
      viewTimeline: [],
      reactions: [],
      replies: []
    };

    storiesDB.push(newStory);
    res.status(201).json({ success: true, story: newStory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. View Story
exports.viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = storiesDB.find((s) => s._id === storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (!story.uniqueViewers.includes(userId)) {
      story.uniqueViewers.push(userId);
      story.viewsCount += 1;
      story.viewTimeline.push({ viewer: userId, viewedAt: new Date() });
    }
    res.status(200).json({ success: true, viewsCount: story.viewsCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Analytics
exports.getStoryAnalytics = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = storiesDB.find((s) => s._id === storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    res.status(200).json({
      success: true,
      analytics: {
        viewsCount: story.viewsCount,
        uniqueViewsCount: story.uniqueViewers.length,
        uniqueViewers: story.uniqueViewers,
        viewTimeline: story.viewTimeline,
        reactions: story.reactions,
        replies: story.replies,
        expiresAt: story.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Delete Story
exports.deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const index = storiesDB.findIndex((s) => s._id === storyId);
    if (index === -1) return res.status(404).json({ message: "Story not found" });

    if (storiesDB[index].user !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this story" });
    }

    storiesDB.splice(index, 1);
    res.status(200).json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. React to Story
exports.reactToStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const story = storiesDB.find((s) => s._id === storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    story.reactions.push({ user: userId, emoji, reactedAt: new Date() });
    res.status(200).json({ success: true, message: "Reaction added successfully", reactions: story.reactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. Reply to Story
exports.replyToStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const story = storiesDB.find((s) => s._id === storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    story.replies.push({ user: userId, message, repliedAt: new Date() });
    res.status(200).json({ success: true, message: "Reply sent successfully", replies: story.replies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};