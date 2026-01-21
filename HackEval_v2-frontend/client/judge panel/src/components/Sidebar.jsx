import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Trophy,
  X,
  Calendar
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ isOpen = true, onClose }) => {
  const menuItems = [
    {
      path: "/dashboard",
      icon: <Home size={18} />,
      label: "Dashboard"
    },
    {
      path: "/judge-schedule",
      icon: <Calendar size={18} />,
      label: "Judge Schedule"
    },
    {
      path: "/my-evaluations",
      icon: <ClipboardList size={18} />,
      label: "My Evaluations"
    },
    {
      path: "/leaderboard",
      icon: <Trophy size={18} />,
      label: "Leaderboard"
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      
   

      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
