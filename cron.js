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