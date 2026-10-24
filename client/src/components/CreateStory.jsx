import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';

const CreateStory = ({ userId = 'user_123', onPostCreated }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle local file selection and convert to Base64 (Vercel compatible)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result); // Base64 preview
        setImageUrl(reader.result);   // Base64 payload string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalImage = imageUrl;

    if (!finalImage) {
      setError('Please select an image file or provide an image URL.');
      return;
    }

    if (isScheduled) {
      if (!scheduledFor) {
        setError('Please select both date and time for scheduling.');
        return;
      }

      if (new Date(scheduledFor).getTime() <= Date.now()) {
        setError('Scheduled date and time must be strictly in the future.');
        return;
      }
    }

    setLoading(true);

    try {
      // Use your live production backend URL instead of localhost
      const endpoint = isScheduled 
        ? 'https://instagram-story-module-ozxc.vercel.app/api/scheduled-posts/schedule'
        : 'https://instagram-story-module-ozxc.vercel.app/api/stories';

      const payload = isScheduled ? {
        userId,
        imageUrl: finalImage,
        caption,
        scheduledFor
      } : {
        userId,
        media: [{ type: 'image', url: finalImage }],
        caption
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete request.');
      }

      setSuccess(isScheduled ? 'Post scheduled successfully!' : 'Story published successfully!');
      setImageUrl('');
      setPreviewUrl('');
      setCaption('');
      setScheduledFor('');
      setIsScheduled(false);

      if (onPostCreated) onPostCreated(data.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-story-card" style={{ padding: '20px', border: '1px solid #333', borderRadius: '8px', maxWidth: '500px', margin: '20px auto', background: '#121212', color: '#fff' }}>
      <h3 style={{ marginTop: 0 }}>Create New Post / Story</h3>

      {error && (
        <div style={{ color: '#ff4d4d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div style={{ color: '#4dff88', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* File Upload Selector */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Choose Image File</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            id="file-upload-input"
          />
          <label 
            htmlFor="file-upload-input" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#222', border: '1px dashed #555', borderRadius: '6px', cursor: 'pointer', textAlign: 'center' }}
          >
            <Upload size={18} /> {previewUrl ? 'Image Selected ✓' : 'Select Image from Device'}
          </label>
        </div>

        {/* Optional Image URL Input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>Or paste Image URL</label>
          <input 
            type="url" 
            placeholder="https://example.com/photo.jpg" 
            value={imageUrl} 
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreviewUrl(e.target.value);
            }} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>

        {/* Image Preview Window */}
        {previewUrl && (
          <div style={{ marginBottom: '12px', textAlign: 'center' }}>
            <img src={previewUrl} alt="Preview" style={{ maxHeight: '160px', borderRadius: '6px', objectFit: 'cover' }} />
          </div>
        )}

        {/* Caption */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Caption</label>
          <textarea 
            placeholder="Write a caption..." 
            value={caption} 
            onChange={(e) => setCaption(e.target.value)} 
            style={{ width: '100%', padding: '8px', minHeight: '60px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>

        {/* Schedule Toggle */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="scheduleToggle" 
            checked={isScheduled} 
            onChange={(e) => setIsScheduled(e.target.checked)} 
          />
          <label htmlFor="scheduleToggle" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <Clock size={16} /> Schedule for Later
          </label>
        </div>

        {/* Combined Date & Time Input */}
        {isScheduled && (
          <div style={{ marginBottom: '12px', background: '#1e1e1e', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#ccc' }}>
              <Calendar size={14} /> Schedule Date & Time (Future Only)
            </label>
            <input 
              type="datetime-local" 
              value={scheduledFor} 
              onChange={(e) => setScheduledFor(e.target.value)} 
              required={isScheduled}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '10px', background: '#0095f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Processing...' : (isScheduled ? 'Schedule Post' : 'Post Now')}
        </button>
      </form>
    </div>
  );
};

export default CreateStory;