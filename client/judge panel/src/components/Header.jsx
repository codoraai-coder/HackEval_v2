import React, { useState, useEffect } from "react";
import "./Header.css";
import { logout } from "../utils/api.js";
import { NavLink } from "react-router-dom";
import { Home, Calendar, ClipboardList, Trophy } from "lucide-react";

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up OR at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        // Hide header when scrolling down
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const navItems = [
    { path: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { path: "/judge-schedule", icon: <Calendar size={18} />, label: "Schedule" },
    { path: "/my-evaluations", icon: <ClipboardList size={18} />, label: "Evaluations" },
    { path: "/leaderboard", icon: <Trophy size={18} />, label: "Leaderboard" }
  ];

  return (
    <header className={`header ${isVisible ? '' : 'header-hidden'}`}>
      <div className="header-left">
        <div className="header-logo-wrapper">
          <img
            src="/images/codoraai.png"
            alt="Codora AI"
            className="header-logo"
          />
        </div>
      </div>

      <div className="header-center">
        <nav className="header-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
