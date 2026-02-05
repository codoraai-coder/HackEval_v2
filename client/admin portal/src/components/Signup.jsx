import React, { useState } from "react";
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import logo from "/images/codoraai.png";
import "./Auth.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminSignup = ({ onSignupSuccess, onBackToLogin, userType = "admin" }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Admin account created successfully!");
      setTimeout(() => onSignupSuccess && onSignupSuccess(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container signup-wide">

        <div className="auth-logo">
          <img src={logo} alt="Codora AI" />
        </div>  
        <h1 className="auth-title">
          {userType === "admin" ? "Create Admin Account" : "Create Judge Account"}
        </h1>
        <p className="auth-subtitle">
          Secure access for platform management
        </p>

        {error && (
          <div className="error-box">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="success-box">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

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
            placeholder="Password (min 6 chars)"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={onBackToLogin}>Back to Login</span>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
