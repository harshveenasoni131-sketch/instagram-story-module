const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const authController = require('./authController');
const storyController = require('./storyController');
require('./cron');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678', // ⚠️ Make sure this matches your MySQL password
    database: 'internship_db'
});

db.connect((err) => {
    if (err) console.error('❌ Database connection failed:', err.message);
    else console.log('✅ Connected to MySQL Database successfully!');
});

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Story Routes
app.post('/api/stories/upload', upload.single('media'), storyController.createStory);
app.post('/api/stories/view', storyController.viewStory);
app.post('/api/stories/interact', storyController.interactStory);
app.get('/api/stories/:storyId/analytics', storyController.getStoryAnalytics);
app.delete('/api/stories/:storyId', storyController.deleteStory);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});