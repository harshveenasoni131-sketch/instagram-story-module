import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

const SAMPLE_POSTS = [
  {
    id: 'post_1',
    username: 'alex_travels',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Kyoto, Japan',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    likes: 1240,
    caption: 'Wandering through the bamboo groves of Arashiyama 🎋✨ #japan #travel #vibes',
    commentsCount: 42,
    timeAgo: '2 HOURS AGO'
  },
  {
    id: 'post_2',
    username: 'design_studio',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Creative Hub',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
    likes: 856,
    caption: 'Minimalist desk setups for late night coding sessions 💻🎨',
    commentsCount: 18,
    timeAgo: '5 HOURS AGO'
  }
];

export default function Feed() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [likedPosts, setLikedPosts] = useState({});

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const isLiked = prev[postId];
      setPosts(currentPosts => 
        currentPosts.map(p => {
          if (p.id === postId) {
            return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 };
          }
          return p;
        })
      );
      return { ...prev, [postId]: !isLiked };
    });
  };

  return (
    <div className="feed-posts-container" style={{ maxWidth: '470px', margin: '0 auto' }}>
      {posts.map(post => (
        <article key={post.id} className="post-card" style={{ marginBottom: '24px', borderBottom: '1px solid #efefef', paddingBottom: '16px' }}>
          {/* Post Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={post.userAvatar} alt={post.username} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <span style={{ fontWeight: '600', fontSize: '14px', display: 'block' }}>{post.username}</span>
                {post.location && <span style={{ fontSize: '11px', color: '#8e8e8e' }}>{post.location}</span>}
              </div>
            </div>
            <MoreHorizontal size={20} color="#262626" cursor="pointer" />
          </div>

          {/* Post Image */}
          <div style={{ borderRadius: '4px', overflow: 'hidden', backgroundColor: '#000' }}>
            <img src={post.imageUrl} alt="Post content" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 6px 0' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => toggleLike(post.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <Heart size={24} color={likedPosts[post.id] ? '#ed4956' : '#262626'} fill={likedPosts[post.id] ? '#ed4956' : 'none'} />
              </button>
              <MessageCircle size={24} color="#262626" cursor="pointer" />
              <Send size={24} color="#262626" cursor="pointer" />
            </div>
            <Bookmark size={24} color="#262626" cursor="pointer" />
          </div>

          {/* Likes & Caption */}
          <div style={{ fontSize: '14px', textAlign: 'left' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{post.likes.toLocaleString()} likes</div>
            <div>
              <span style={{ fontWeight: '600', marginRight: '6px' }}>{post.username}</span>
              <span>{post.caption}</span>
            </div>
            {post.commentsCount > 0 && (
              <div style={{ color: '#8e8e8e', fontSize: '13px', marginTop: '6px', cursor: 'pointer' }}>
                View all {post.commentsCount} comments
              </div>
            )}
            <div style={{ color: '#8e8e8e', fontSize: '10px', marginTop: '6px', textTransform: 'uppercase' }}>
              {post.timeAgo}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}