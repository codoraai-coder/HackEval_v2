import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignIn.css"; // Reusing the same styles
import Header from "./Header_SignIn.jsx";

function SignUp() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        email: "",
        expertise: "",
        bio: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/judge/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    email: formData.email,
                    expertise: formData.expertise,
                    bio: formData.bio
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Registration successful
            alert("Registration successful! You can now login.");
            navigate("/signin");
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
            console.error("Registration error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-background">
            <Header onMenuClick={() => {}} />
            <div className="auth-container">
                {/* <div className="auth-logo">
                    <img src="..\..\public\images\gla.png" alt="GLA University" />
                </div> */}
                <h1 className="auth-title">Judge Registration</h1>
                <p className="auth-subtitle">Create your account for Hackathon Evaluation Portal</p>
                
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
                        <label>Full Name:</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password (min. 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>Expertise (comma separated):</label>
                        <input
                            type="text"
                            name="expertise"
                            placeholder="e.g., Web Development, AI, Blockchain"
                            value={formData.expertise}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Bio (optional):</label>
                        <textarea
                            name="bio"
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    Already have an account? <Link to="/signin" style={{ color: '#4CAF50' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp;