import './StoryTray.css';
import { X } from 'lucide-react';
import './StoryViewer.css';

function StoryViewer({ story, onClose }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-content">
        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Story Header */}
        <div className="story-viewer-header">
          <div className="user-info">
            <img src={story.media_url} alt={story.username} className="user-avatar" />
            <span className="username">{story.username}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} color="#ffffff" />
          </button>
        </div>

        {/* Story Image Media */}
        <img src={story.media_url} alt="Story Content" className="story-media" />
      </div>
    </div>
  );
}

export default StoryViewer;