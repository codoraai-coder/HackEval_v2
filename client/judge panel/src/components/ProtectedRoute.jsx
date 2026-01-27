import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/api.js';

function ProtectedRoute({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            if (!isAuthenticated()) {
                navigate('/');
                return;
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [navigate]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
