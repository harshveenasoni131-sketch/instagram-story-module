const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Support multiple media items per story post
  media: [
    {
      mediaUrl: { type: String, required: true },
      mediaType: { type: String, enum: ['image', 'video'], required: true }
    }
  ],
  privacy: {
    type: String,
    enum: ['public', 'followers', 'close_friends'],
    default: 'public'
  },
  // Automatically expires after 24 hours (indexed for efficient cleanup)
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  // Analytics data that remains retained even if the story expires/archives
  analytics: {
    totalViews: { type: Number, default: 0 },
    uniqueViewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    viewTimeline: [
      {
        viewedAt: { type: Date, default: Date.now },
        viewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ]
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);