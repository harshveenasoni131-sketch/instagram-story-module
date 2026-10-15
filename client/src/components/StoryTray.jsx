import React, { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import CreateStory from './CreateStory';
import ScheduledPostsModal from "./ScheduledPostModal";
import './StoryTray.css';

const storiesData = [
  {
    id: 'user_self',
    username: 'Your story',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isUser: true,
  },
  {
    id: '1',
    username: 'bihaan2076',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    username: 'shra.ddha9885',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    username: 'imokshmu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    username: 'alex_dev',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  },
];

function StoryTray({ onSelectStory, userId = 'user_123' }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduledModal, setShowScheduledModal] = useState(false);

  const handleStoryClick = (item) => {
    if (item.isUser) {
      // Open Create / Schedule Story modal when clicking 'Your story'
      setShowCreateModal(true);
    } else if (onSelectStory) {
      onSelectStory(item);
    }
  };

  return (
    <div className="story-tray-wrapper">
      {/* Story Tray List */}
      <div className="story-tray-container">
        {storiesData.map((item) => (
          <div 
            key={item.id} 
            className="story-item"
            onClick={() => handleStoryClick(item)}
          >
            {item.isUser ? (
              <div className="your-story-container">
                <img src={item.avatar} alt="Your story" className="story-avatar-img" />
                <div className="add-plus-badge">
                  <Plus size={12} color="#ffffff" strokeWidth={3} />
                </div>
              </div>
            ) : (
              <div className="insta-gradient-ring">
                <div className="inner-white-border">
                  <img src={item.avatar} alt={item.username} className="story-avatar-img" />
                </div>
              </div>
            )}
            <span className="story-username-text">{item.username}</span>
          </div>
        ))}

        {/* Scheduled Posts Trigger Button */}
        <div 
          className="story-item scheduled-posts-trigger"
          onClick={() => setShowScheduledModal(true)}
          title="Manage Scheduled Posts"
          style={{ cursor: 'pointer' }}
        >
          <div className="insta-gradient-ring" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c)' }}>
            <div className="inner-white-border" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#262626' }}>
              <Clock size={24} color="#ffffff" />
            </div>
          </div>
          <span className="story-username-text">Scheduled</span>
        </div>
      </div>

      {/* Create / Schedule Post Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
            <button 
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '28px', right: '28px', background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 1001 }}
            >
              ✕
            </button>
            <CreateStory 
              userId={userId} 
              onPostCreated={() => setShowCreateModal(false)} 
            />
          </div>
        </div>
      )}

      {/* Scheduled Posts View Modal */}
      {showScheduledModal && (
        <ScheduledPostsModal 
          userId={userId} 
          onClose={() => setShowScheduledModal(false)} 
        />
      )}
    </div>
  );
}

export default StoryTray;