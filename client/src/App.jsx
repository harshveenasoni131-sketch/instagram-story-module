import React, { useState } from 'react';
import { Home, Search, Compass, Clapperboard, Send, Heart, PlusSquare, Menu, ShieldAlert, ShieldCheck } from 'lucide-react';
import StoryTray from "./components/StoryTray";
import StoryViewer from "./components/StoryViewer";
import Feed from "./components/Feed";
import SubscriptionDashboard from "./components/SubscriptionDashboard";
import LanguageSettings from "./components/LanguageSettings";
import LoginScreen from "./components/LoginScreen";
import AdminDashboard from "./components/AdminDashboard";
import './App.css';

function App() {
  const [activeStory, setActiveStory] = useState(null);
  const [currentView, setCurrentView] = useState('feed');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const adminId = 'admin_001';

  return (
    <div className="insta-desktop-layout">
      {/* Left Navigation Sidebar (Hidden on mobile screens via CSS) */}
      <aside className="left-sidebar hidden md:flex">
        <div>
          <div className="brand-logo">Instagram</div>

          <nav className="nav-links">
            <button className={`nav-item ${currentView === 'feed' ? 'active' : ''}`} onClick={() => setCurrentView('feed')}>
              <Home size={24} color="#000000" />
              <span>Home</span>
            </button>
            <button className="nav-item">
              <Search size={24} color="#000000" />
              <span>Search</span>
            </button>
            <button className="nav-item">
              <Compass size={24} color="#000000" />
              <span>Explore</span>
            </button>
            <button className="nav-item">
              <Clapperboard size={24} color="#000000" />
              <span>Reels</span>
            </button>
            <button className="nav-item">
              <Send size={24} color="#000000" />
              <span>Messages</span>
            </button>
            <button className="nav-item">
              <Heart size={24} color="#000000" />
              <span>Notifications</span>
              <span className="badge-count">2</span>
            </button>
            <button className="nav-item">
              <PlusSquare size={24} color="#000000" />
              <span>Create</span>
            </button>

            <button className="nav-item" onClick={() => setCurrentView(currentView === 'admin' ? 'feed' : 'admin')}>
              <ShieldAlert size={24} color={currentView === 'admin' ? '#ff4d4f' : '#000000'} />
              <span>Admin Panel</span>
            </button>

            <button className="nav-item" onClick={() => setCurrentView('security')}>
              <ShieldCheck size={24} color="#0095f6" />
              <span>Security / Login</span>
            </button>
          </nav>
        </div>

        <div>
          <button className="nav-item" onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}>
            <Menu size={24} color="#000000" />
            <span>More</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Only visible on mobile screens) */}
      <div className="mobile-bottom-nav md:hidden">
        <button onClick={() => setCurrentView('feed')} className={currentView === 'feed' ? 'active' : ''}>
          <Home size={24} color="#000000" />
        </button>
        <button onClick={() => setCurrentView('feed')}>
          <Search size={24} color="#000000" />
        </button>
        <button onClick={() => setCurrentView('feed')}>
          <PlusSquare size={24} color="#000000" />
        </button>
        <button onClick={() => setCurrentView('admin')} className={currentView === 'admin' ? 'active' : ''}>
          <ShieldAlert size={24} color={currentView === 'admin' ? '#ff4d4f' : '#000000'} />
        </button>
        <button onClick={() => setCurrentView('security')} className={currentView === 'security' ? 'active' : ''}>
          <ShieldCheck size={24} color="#0095f6" />
        </button>
      </div>

      {/* Main Container */}
      <div className="feed-wrapper">
        <div className="center-feed">
          {currentView === 'feed' && (
            <>
              {/* Story Bar */}
              <section className="stories-section">
                <StoryTray onSelectStory={(story) => setActiveStory(story)} />
              </section>

              {/* Feed Posts */}
              <section className="feed-section">
                <Feed />
              </section>

              {/* Extras (Subscriptions & Language Settings) */}
              <section style={{ margin: '40px 0' }}>
                <SubscriptionDashboard />
              </section>
              <section style={{ margin: '20px 0' }}>
                <LanguageSettings />
              </section>
            </>
          )}

          {currentView === 'security' && <LoginScreen />}

          {currentView === 'admin' && (
            <AdminDashboard adminId={adminId} onLogout={() => setCurrentView('security')} />
          )}
        </div>

        {/* Right Sidebar Suggestions (Feed View Only) */}
        {currentView === 'feed' && (
          <aside className="right-sidebar">
            <div className="user-profile-badge">
              <div className="profile-info">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Profile" 
                  className="profile-avatar" 
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#000000' }}>harshveena06</div>
                  <div style={{ color: '#737373', fontSize: '12px' }}>HarshVeena Soni</div>
                </div>
              </div>
              <button className="switch-btn">Switch</button>
            </div>

            <div>
              <div className="suggestions-header">
                <span>Suggested for you</span>
                <button className="see-all-btn">See all</button>
              </div>

              <div className="suggestion-item">
                <div className="suggestion-info">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="suggestion-avatar" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#000000' }}>Meggie</div>
                    <div style={{ color: '#737373', fontSize: '11px' }}>Followed by monikas_83</div>
                  </div>
                </div>
                <button className="follow-btn">Follow</button>
              </div>

              <div className="suggestion-item">
                <div className="suggestion-info">
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="suggestion-avatar" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#000000' }}>Tanisha Dewangan</div>
                    <div style={{ color: '#737373', fontSize: '11px' }}>Followed by naina_chelani</div>
                  </div>
                </div>
                <button className="follow-btn">Follow</button>
              </div>
            </div>

            <footer className="footer-links">
              About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language
              <div style={{ marginTop: '12px' }}>© 2026 INSTAGRAM FROM META</div>
            </footer>
          </aside>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />
      )}
    </div>
  );
}

export default App;