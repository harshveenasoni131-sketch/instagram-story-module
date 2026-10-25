import React, { useState } from "react";

const CreateStory = ({ userId = "user_123", onPostCreated = () => {} }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert image to Base64 so it can be safely saved to MongoDB & Vercel
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result); // Base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      userId: userId,
      username: "harshveena06",
      userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      imageUrl: imageUrl, // The Base64 string
      caption: caption,
      isScheduled: isScheduled, // checkbox boolean
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/stories`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

      if (response.ok) {
        alert(isScheduled ? "Story scheduled successfully!" : "Story posted successfully!");
        onPostCreated();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to upload story: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Network or fetch error:", error);
      alert("Network error. Please check your connection.");
    }
  };

  return (
    <div className="create-story-modal">
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageChange} required />
        <input
          type="text"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
          />
          Schedule Post
        </label>
        {isScheduled && (
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
          />
        )}
        <button type="submit">Share Story</button>
      </form>
    </div>
  );
};

export default CreateStory;
import { API_BASE_URL } from "../config";