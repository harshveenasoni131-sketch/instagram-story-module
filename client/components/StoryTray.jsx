import React from 'react';
import { Plus } from 'lucide-react';
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

function StoryTray({ onSelectStory }) {
  return (
    <div className="story-tray-container">
      {storiesData.map((item) => (
        <div 
          key={item.id} 
          className="story-item"
          onClick={() => onSelectStory(item)}
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
    </div>
  );
}

export default StoryTray;