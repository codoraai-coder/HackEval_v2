import React from 'react';
import './Header.css'; // Create a separate CSS file for header styles
import logo from '../../public/images/codoraai.png'; // Adjust the path as necessary
import { logout } from '../utils/api.js';

const Header = ({ onMenuClick }) => {
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="menu-icon" onClick={onMenuClick}>
                    {/* Three horizontal lines for hamburger menu */}
                    {/* <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span> */}
                </div>
                <img src='../../public/images/codoraai.png' alt="Codora AI" className="header-logo" />
                {/* <img src='../../public/images/DC.png' alt="Logo 2" className="header-right-logo dc-logo" /> */}
            </div>
            <div className="header-right">
                {/* <img src='../../public/images/sih.png' alt="Logo 1" className="header-right-logo" /> */}
                <button 
                    onClick={handleLogout}
                    className="logout-btn"
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginLeft: '15px',
                        fontSize: '14px'
                    }}
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
