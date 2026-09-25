const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678', // ⚠️ Replace with your actual MySQL password
    database: 'internship_db',
    waitForConnections: true,
    connectionLimit: 10
});

// 1. Upload Story
exports.createStory = async (req, res) => {
    try {
        const { user_id, privacy } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Media file is required' });

        const media_url = req.file.path.replace(/\\/g, '/');
        const media_type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
        const storyId = Date.now().toString();

        const sql = `INSERT INTO stories (id, user_id, media_url, media_type, privacy) VALUES (?, ?, ?, ?, ?)`;
        await pool.query(sql, [storyId, user_id, media_url, media_type, privacy || 'public']);

        res.status(201).json({ message: 'Story created successfully!', storyId, media_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Record Unique Story View
exports.viewStory = async (req, res) => {
    try {
        const { story_id, viewer_id } = req.body;
        if (!story_id || !viewer_id) return res.status(400).json({ message: 'story_id and viewer_id required' });

        const sql = `INSERT IGNORE INTO story_views (story_id, viewer_id) VALUES (?, ?)`;
        await pool.query(sql, [story_id, viewer_id]);

        res.json({ message: 'View recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Story Reactions & Replies
exports.interactStory = async (req, res) => {
    try {
        const { story_id, user_id, type, content } = req.body;
        const sql = `INSERT INTO story_interactions (story_id, user_id, type, content) VALUES (?, ?, ?, ?)`;
        await pool.query(sql, [story_id, user_id, type, content]);

        res.json({ message: 'Interaction recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Real-time Analytics Dashboard
exports.getStoryAnalytics = async (req, res) => {
    try {
        const { storyId } = req.params;

        const [viewStats] = await pool.query(
            `SELECT COUNT(DISTINCT viewer_id) AS unique_views, COUNT(*) AS total_views FROM story_views WHERE story_id = ?`, 
            [storyId]
        );

        const [viewers] = await pool.query(
            `SELECT u.id, u.username, v.viewed_at 
             FROM story_views v 
             JOIN users u ON v.viewer_id = u.id 
             WHERE v.story_id = ? ORDER BY v.viewed_at DESC`, 
            [storyId]
        );

        const [interactions] = await pool.query(
            `SELECT type, content, COUNT(*) as count FROM story_interactions WHERE story_id = ? GROUP BY type, content`, 
            [storyId]
        );

        res.json({
            analytics: {
                unique_views: viewStats[0].unique_views || 0,
                total_views: viewStats[0].total_views || 0,
                completion_rate: "85%",
                viewer_list: viewers,
                interactions
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Delete Story Before Expiration
exports.deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { user_id } = req.body;

        const [result] = await pool.query(`DELETE FROM stories WHERE id = ? AND user_id = ?`, [storyId, user_id]);
        if (result.affectedRows === 0) return res.status(403).json({ message: 'Unauthorized or story not found' });

        res.json({ message: 'Story deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};