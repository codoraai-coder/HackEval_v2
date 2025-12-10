import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  Award,
  GraduationCap,
  UserPlus,
  Trophy,
  X, // Import close icon
  LogOut // Import logout icon
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const menuItems = [
    {
      path: '/dashboard',
      icon: <Home size={20} />,
      label: 'Dashboard Home'
    },
    // {
    //   path: '/evaluate',
    //   icon: <FileText size={20} />,
    //   label: 'Evaluate Submissions'
    // },
    // {
    //   path: '/assign',
    //   icon: <UserPlus size={20} />,
    //   label: 'Assign'
    // },
    {
      path: '/my-evaluations',
      icon: <ClipboardList size={20} />,
      label: 'My Evaluations'
    },
    {
      path: '/leaderboard',
      icon: <Trophy size={20} />,
      label: 'Leaderboard'
    },
    // {
    //   path: '/final-submissions',
    //   icon: <Award size={20} />,
    //   label: 'Final Submission List'
    // }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        {/* <div className="logo">
          <GraduationCap size={32} color="#1B4332" />
          <div className="logo-text">
            <h2>GLA University</h2>
            <p>Judge Portal</p>
          </div>
        </div> */}
        <button className="sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Button */}
      {/* <div className="logout-section">
        <button 
          className="logout-button" 
          onClick={() => navigate("/signin")}
          title="Log out"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div> */}
      
      
    </aside>
  );
};

export default Sidebar;