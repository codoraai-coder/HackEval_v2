import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUpload, 
  FaTrophy, 
  FaChartBar, 
  FaSignOutAlt,
  FaBell,
  FaUser
} from 'react-icons/fa';
import './Header.css';
import { logout } from '../api/teams.jsx';

const Header = () => {
  const location = useLocation();
  const [currentRound, setCurrentRound] = useState('None');

  useEffect(() => {
    // quick render check
    // eslint-disable-next-line no-console
    console.log('Header mounted, location:', location && location.pathname);
  }, [location]);

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/submissions', icon: FaUpload, label: 'Submissions' },
    { path: '/leaderboard', icon: FaTrophy, label: 'Leaderboard' },
    { path: '/program-schedule', icon: FaChartBar, label: 'Schedule' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      // eslint-disable-next-line no-console
      console.log('Logout clicked');
    }
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <div className="admin-logo">
              {/* use public/ path from CRA/Vite */}
              <img src="/images/codoraai.png" alt="codoro.ai" className="logo-image" />
            </div>
            <h1 className="admin-title">Team Dashboard</h1>
          </div>

          <div className="admin-header-right">
            <div className="current-round">
              <span className="round-label">Current Round:</span>
              <span className="round-value">{currentRound}</span>
            </div>
            
            <div className="notification-icon">
              <FaBell />
              <span className="notification-badge">1</span>
            </div>

            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              <FaUser className="user-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="admin-navigation">
        <div className="nav-tabs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location && location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-tab ${isActive ? 'active' : ''}`}
              >
                <Icon className="tab-icon" />
                <span className="tab-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Header;