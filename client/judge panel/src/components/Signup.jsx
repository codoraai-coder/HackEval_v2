import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignIn.css";

function SignUp() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    expertise: "",
    bio: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/judge/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          expertise: formData.expertise,
          bio: formData.bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("Registration successful!");
      navigate("/signin");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container signup-wide">
        <div className="auth-logo">
          <img src="../../public/images/codoraai.png" alt="Codora AI" />
        </div>

        <h1 className="auth-title">Judge Registration</h1>
        <p className="auth-subtitle">Hackathon Evaluation Portal</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
  <div className={`form-step ${step === 1 ? "active" : ""}`}>

          {step === 1 && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <button type="button" onClick={() => setStep(2)}>
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="text"
                name="expertise"
                placeholder="Expertise (Web, AI, Blockchain)"
                value={formData.expertise}
                onChange={handleChange}
              />

              <textarea
                name="bio"
                placeholder="Short Bio (optional)"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
              />

              <button type="button" className="secondary" onClick={() => setStep(1)}>
                ← Back
              </button>

              <button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </>
          )}
          </div>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
