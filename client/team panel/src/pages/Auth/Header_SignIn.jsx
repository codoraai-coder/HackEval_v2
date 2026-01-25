import React from 'react';
import './Header_SignIn.css';

const HeaderSignIn = () => {
    return (
        <header className="header">
            <div className="header-left">
                <img src="/images/gla.png" alt="GLA University" className="header-logo" />
                <img src="/images/DC.png" alt="DC Logo" className="dc-logo" />
            </div>
            <div className="header-right">
                <img src="/images/sih.png" alt="SIH Logo" className="header-right-logo" />
            </div>
        </header>
    );
};

export default HeaderSignIn;
