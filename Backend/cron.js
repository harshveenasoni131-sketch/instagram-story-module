const cron = require('node-cron');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678', // ⚠️ Replace with your actual MySQL password
    database: 'internship_db'
});

cron.schedule('0 * * * *', async () => {
    try {
        const [result] = await pool.query(
            `SELECT COUNT(*) as expiredCount FROM stories WHERE expires_at <= NOW() AND is_highlight = 0`
        );
        console.log(`⏰ Expiration check run: ${result[0].expiredCount} expired stories processed.`);
    } catch (err) {
        console.error('Cron job error:', err.message);
    }
});
const cron = require('node-cron');
const Story = require('./Story');

// Run every hour to check for expired stories
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    
    // Find stories past their 24-hour expiration window that aren't highlighted or already archived
    const expiredStories = await Story.find({
      expiresAt: { $lte: now },
      isArchived: false,
      isHighlight: false
    });

    for (let story of expiredStories) {
      // Retain analytics by marking as archived instead of hard deleting immediately
      story.isArchived = true;
      await story.save();
    }

    console.log(`[Cron] Processed ${expiredStories.length} expired stories.`);
  } catch (error) {
    console.error('[Cron Error] Failed to process expired stories:', error.message);
  }
});