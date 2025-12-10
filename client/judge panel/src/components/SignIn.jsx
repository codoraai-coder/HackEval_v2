import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignIn.css";
import Header from "./Header_SignIn.jsx";

function SignIn() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8000/judge/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Store the token and user info
            localStorage.setItem('judgeToken', data.data.accessToken);
            localStorage.setItem('judgeUsername', username);
            localStorage.setItem('judgeInfo', JSON.stringify(data.data.judge));
            
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-background">
            <Header onMenuClick={() => {}} />
            <div className="auth-container">
                <div className="auth-logo">
                    <img src="..\..\public\images\codoraai.png" alt="codora.ai" />
                </div>
                <h1 className="auth-title">Judge Panel</h1>
                <p className="auth-subtitle">Hackathon Evaluation Portal</p>
                
                {error && (
                    <div className="error-message" style={{ 
                        color: 'red', 
                        backgroundColor: '#ffe6e6', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        marginBottom: '15px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    Don't have an account? <Link to="/signup" style={{ color: '#0468f3ff' }}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default SignIn;