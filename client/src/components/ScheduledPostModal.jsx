import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Calendar, AlertCircle } from 'lucide-react';

const ScheduledPostsModal = ({ userId = 'user_123', onClose }) => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://http://localhost:5000/api/api/scheduled-posts/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setScheduledPosts(data.data);
      }
    } catch (err) {
      console.error('Error fetching scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, [userId]);

  const handleCancelPost = async (postId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled post?')) return;

    try {
      const res = await fetch(`https://http://localhost:5000/api/api/scheduled-posts/${postId}/cancel`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Post cancelled successfully.');
        fetchScheduledPosts();
      }
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#121212', color: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Clock size={20} /> My Scheduled Posts
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {message && <div style={{ color: '#4dff88', marginBottom: '10px' }}>{message}</div>}

        {loading ? (
          <p>Loading scheduled posts...</p>
        ) : scheduledPosts.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>No scheduled posts found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scheduledPosts.map((post) => (
              <div key={post.postId} style={{ background: '#1e1e1e', padding: '12px', borderRadius: '6px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{post.caption || 'No caption'}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(post.scheduledFor).toLocaleString()}
                  </p>
                  <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: post.status === 'scheduled' ? '#ff9900' : '#444', color: '#000', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
                    {post.status.toUpperCase()}
                  </span>
                </div>

                {post.status === 'scheduled' && (
                  <button 
                    onClick={() => handleCancelPost(post.postId)} 
                    style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    title="Cancel Post"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledPostsModal;