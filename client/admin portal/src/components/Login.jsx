import React, { useState } from "react";
import { Mail, Lock, Loader, AlertCircle } from "lucide-react";
import logo from "/images/codoraai.png";
import "./Auth.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("authToken", data.data.accessToken);
      onLogin(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <div className="auth-logo">
          <img src={logo} alt="Codora AI" />
        </div>
        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        {error && (
          <div className="error-box">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? <Loader className="spin" size={16} /> : "Log In"}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an admin account?{" "}
          <a href="/admin-signup">Create one</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
