import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard({ adminId, onLogout }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'x-admin-id': adminId }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Users with Filters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/admin/users?search=${search}&status=${statusFilter}&plan=${planFilter}`;
      const res = await fetch(url, {
        headers: { 'x-admin-id': adminId }
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/audit-logs', {
        headers: { 'x-admin-id': adminId }
      });
      const data = await res.json();
      if (data.success) setAuditLogs(data.auditLogs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchAuditLogs();
  }, [search, statusFilter, planFilter]);

  // Handle User Deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-admin-id': adminId }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('User deleted successfully.');
        fetchUsers();
        fetchAuditLogs();
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Error deleting user.');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h2>🛡️ Administrator Control Panel</h2>
        <div className="admin-user-info">
          <span>Logged in as Admin (ID: {adminId})</span>
          <button onClick={onLogout} className="logout-btn">Sign Out</button>
        </div>
      </header>

      <div className="admin-nav-tabs">
        <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>📊 Overview & Stats</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 User Management</button>
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>📋 Audit Logs</button>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {/* 1. STATS TAB */}
      {activeTab === 'stats' && stats && (
        <div className="admin-stats-grid">
          <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
          <div className="stat-card"><h3>{stats.activeUsers}</h3><p>Active Users</p></div>
          <div className="stat-card"><h3>{stats.totalPosts}</h3><p>Total Posts & Stories</p></div>
          <div className="stat-card"><h3>{stats.totalSubscriptions}</h3><p>Subscriptions</p></div>
          <div className="stat-card"><h3>{stats.totalReports}</h3><p>Reported Content</p></div>
          <div className="stat-card"><h3>{stats.engagementRate}</h3><p>Engagement Rate</p></div>
        </div>
      )}

      {/* 2. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="user-management-section">
          <div className="filters-bar">
            <input 
              type="text" 
              placeholder="Search by email or ID..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>

          {loading ? <p>Loading users...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId}>
                    <td>{u.userId}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.status}</td>
                    <td>{u.subscription?.plan || 'free'}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteUser(u.userId)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 3. AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="audit-logs-section">
          <h3>Centralized Administrative Audit Logs</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Admin ID</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.logId}>
                  <td>{log.logId}</td>
                  <td>{log.adminId}</td>
                  <td><span className="badge action">{log.action}</span></td>
                  <td>{log.targetType}</td>
                  <td>{log.details}</td>
                  <td>{log.ipAddress}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}