const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Import Story Controllers
const { 
  createStory, 
  viewStory, 
  getStoryAnalytics, 
  deleteStory,
  reactToStory,
  replyToStory
} = require('./StoryController');

// Test auth middleware
const verifyAuth = (req, res, next) => {
  req.user = { id: req.headers['user-id'] || '60c72b2f9b1d8b2d88f12345' };
  next();
};

// Story Routes
app.post('/api/stories', verifyAuth, createStory);
app.post('/api/stories/:storyId/view', verifyAuth, viewStory);
app.get('/api/stories/:storyId/analytics', verifyAuth, getStoryAnalytics);
app.delete('/api/stories/:storyId', verifyAuth, deleteStory);
app.post('/api/stories/:storyId/react', verifyAuth, reactToStory);
app.post('/api/stories/:storyId/reply', verifyAuth, replyToStory);

app.listen(5000, () => {
  console.log('🚀 Server running smoothly on http://localhost:5000');
});