import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamContext } from "../../context/TeamContext";
import toast from "react-hot-toast";
import "./Auth.css";
import { API_BASE_URL } from "../../config";
import HeaderSignIn from "./Header_SignIn";

const SignIn = () => {
  const navigate = useNavigate();
  const { team, setTeam } = useContext(TeamContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Remove useEffect navigation to avoid double navigation or redirect loop

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. POST to backend
      const response = await fetch(`${API_BASE_URL}/auth/team_login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // 2. Parse response
      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // 3. Check if team data is present
      if (!data.team) {
        throw new Error(
          "Team data not returned from backend. Please contact admin.",
        );
      }

      // 4. Save to localStorage and context
      localStorage.setItem("team", JSON.stringify(data.team));
      localStorage.setItem("token", data.access_token);
  setTeam(data.team);
  toast.success("Signed in successfully");
  navigate("/");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderSignIn />
      <div className="auth-container">
        <div className="auth-card">
          <h2>Team Sign In</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-group">
                <label>Email ID</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your official team leader email id"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* <div className="demo-credentials">
              <h3>Demo Credentials</h3>
              <p>
                <strong>Team ID:</strong> TC-2024-001
              </p>
              <p>
                <strong>Password:</strong> hackathon
              </p>
            </div> */}
          </form>
        </div>
      </div>
    </>
  );
};

export default SignIn;
