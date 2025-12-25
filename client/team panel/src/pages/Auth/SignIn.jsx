import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamContext } from "../../context/TeamContext.jsx";
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
      // Use correct endpoint: backend exposes /team/team_login
      const response = await fetch(`${API_BASE_URL}/team/team_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();
      // payload is ApiResponse: { statusCode, data: { team, accessToken }, message, success }

      if (!response.ok || !payload.success) {
        // Prefer backend's message when available
        const backendMessage = payload?.message || "Login failed";
        throw new Error(backendMessage);
      }

      // Validate presence of data.team and data.accessToken
      const { team, accessToken } = payload.data || {};
      if (!team || !accessToken) {
        throw new Error(
          "Invalid response from server: missing team or access token",
        );
      }

      // Persist auth data
      localStorage.setItem("team", JSON.stringify(team));
      localStorage.setItem("token", accessToken);

      // Update context and navigate
      setTeam(team);
      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <HeaderSignIn /> */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <img src="../../public/images/codoraai.png" alt="Codora AI" />
          </div>
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
            <p className="auth-link">
              Don’t have a team? <a href="/signup">Register here</a>
            </p>


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
