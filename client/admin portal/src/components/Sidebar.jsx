import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  ClipboardList, 
  BarChart2, 
  UserCheck, 
  Upload, 
  User, 
  FileText 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${isOpen ? ' sidebar-open' : ''}`}
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <span className="logo-circle">HE</span>
            </div>
            <div className="brand-text">
              <h2>Hackathon</h2>
              <p>Admin Portal</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link">
                <Home size={18} />
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/round-scheduler" className="nav-link">
                <Calendar size={18} />
                Round Scheduler
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/judge-assignment" className="nav-link">
                <UserCheck size={18} />
                Judge Assignment
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/score-compiler" className="nav-link">
                <ClipboardList size={18} />
                Score Compiler
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/leaderboard" className="nav-link">
                <BarChart2 size={18} />
                Leaderboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/mentor-management" className="nav-link">
                <Users size={18} />
                Mentor Management
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/excel-upload" className="nav-link">
                <Upload size={18} />
                Excel Upload
              </NavLink>
            </li>
            {/* Add Final Submission List link here */}
            <li className="nav-item">
              <NavLink to="/final-submissions" className="nav-link">
                <FileText size={18} />
                Final Submission List
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">AD</div>
            <div className="admin-details">
              <p className="admin-name">Admin</p>
              <p className="admin-role">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;