const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema({
  postId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  caption: { 
    type: String, 
    default: '' 
  },
  hashtags: { 
    type: [String], 
    default: [] 
  },
  taggedUsers: { 
    type: [String], 
    default: [] 
  },
  location: { 
    type: String, 
    default: '' 
  },
  scheduledFor: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'published', 'cancelled', 'failed'], 
    default: 'scheduled' 
  },
  retryCount: { 
    type: Number, 
    default: 0 
  },
  errorMessage: { 
    type: String, 
    default: '' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ScheduledPost', scheduledPostSchema);