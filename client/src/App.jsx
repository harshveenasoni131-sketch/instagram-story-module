import React, { useState } from 'react';
import { Plus, Heart, Home, Clapperboard, Send, Search, ShieldCheck } from 'lucide-react';
import StoryTray from "./components/StoryTray";
import StoryViewer from "./components/StoryViewer";
import LanguageSettings from "./components/LanguageSettings";
import SubscriptionDashboard from "./components/SubscriptionDashboard";
import LoginScreen from "./components/LoginScreen"; // Added Login Security Module
import './App.css';

function App() {
  const [activeStory, setActiveStory] = useState(null);
  const [currentView, setCurrentView] = useState('feed'); // 'feed' or 'security'

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <button className="icon-btn" aria-label="Create Post">
          <Plus size={26} strokeWidth={1.8} color="#000000" />
        </button>

        {/* Official Cursive Wordmark Data Image */}
        <img 
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 103 29' width='103' height='29'><text x='0' y='23' font-family='Brush Script MT, cursive, sans-serif' font-size='27' fill='%23000000'>Instagram</text></svg>" 
          alt="Instagram" 
          className="insta-logo-image" 
        />

        <button 
          className="icon-btn" 
          aria-label="Security Portal"
          onClick={() => setCurrentView(currentView === 'feed' ? 'security' : 'feed')}
          title="Toggle Security Portal"
        >
          <ShieldCheck size={26} strokeWidth={1.8} color={currentView === 'security' ? '#4f46e5' : '#000000'} />
        </button>
      </header>

      {/* Main Content Area: Switch between Feed and Security Portal */}
      <main className="main-content">
        {currentView === 'feed' ? (
          <>
            <section className="stories-section">
              <StoryTray onSelectStory={(story) => setActiveStory(story)} />
            </section>

            <div className="feed-divider"></div>

            {/* Subscription Dashboard Component */}
            <section className="subscription-section" style={{ margin: '20px 0' }}>
              <SubscriptionDashboard />
            </section>

            {/* Language Settings Component */}
            <section className="settings-section" style={{ margin: '20px 0' }}>
              <LanguageSettings />
            </section>
          </>
        ) : (
          <section className="security-section" style={{ paddingBottom: '70px' }}>
            <LoginScreen />
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${currentView === 'feed' ? 'active' : ''}`}
          onClick={() => setCurrentView('feed')}
        >
          <Home size={26} color="#000000" strokeWidth={2.2} />
        </button>
        <button className="nav-btn"><Clapperboard size={24} color="#000000" strokeWidth={1.8} /></button>
        <button className="nav-btn"><Send size={24} color="#000000" strokeWidth={1.8} /></button>
        <button className="nav-btn"><Search size={26} color="#000000" strokeWidth={2} /></button>
        <button 
          className={`nav-btn profile-nav-btn ${currentView === 'security' ? 'ring-2 ring-indigo-600 rounded-full' : ''}`}
          onClick={() => setCurrentView('security')}
          title="Open Security & Login History"
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
            alt="Profile & Security" 
            className="nav-profile-img" 
          />
        </button>
      </nav>

      {/* Story Modal */}
      {activeStory && (
        <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />
      )}
    </div>
  );
}

export default App;