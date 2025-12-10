import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";
import { API_BASE_URL } from "../../config";
import HeaderSignIn from "./Header_SignIn";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamName: "",
    email: "",
    password: "",
    confirmPassword: "",
    projectTitle: "",
    projectDescription: "",
    technologyStack: "",
    category: "",
    members: [
      { name: "", email: "", phone: "", isLeader: true }
    ]
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...formData.members];
    updatedMembers[index][name] = value;
    
    setFormData(prev => ({
      ...prev,
      members: updatedMembers
    }));
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: "", email: "", phone: "", isLeader: false }]
    }));
  };

  const removeMember = (index) => {
    if (formData.members.length <= 1) {
      toast.error("At least one team member is required");
      return;
    }
    
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      members: updatedMembers
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Check if at least one member is marked as leader
    const hasLeader = formData.members.some(member => member.isLeader);
    if (!hasLeader) {
      setError("Please designate one team member as the leader");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/team/team_register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: formData.teamName,
          email: formData.email,
          password: formData.password,
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          technologyStack: formData.technologyStack ? 
            formData.technologyStack.split(",").map(item => item.trim()) : [],
          category: formData.category,
          members: formData.members
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Registration successful! You can now sign in.");
      navigate("/signin");
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
          <h2>Team Registration</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Team Information</h3>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="Enter your team name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Team Leader Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter team leader's email"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min. 6 characters)"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <h3>Project Information</h3>
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleChange}
                  placeholder="Enter your project title"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  placeholder="Describe your project"
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Technology Stack (comma separated)</label>
                <input
                  type="text"
                  name="technologyStack"
                  value={formData.technologyStack}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, MongoDB"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="IoT">IoT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <h3>Team Members</h3>
              {formData.members.map((member, index) => (
                <div key={index} className="member-form">
                  <div className="form-group">
                    <label>Member {index + 1} Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, e)}
                      placeholder="Enter member name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Member {index + 1} Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, e)}
                      placeholder="Enter member email"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Member {index + 1} Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, e)}
                      placeholder="Enter member phone number"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isLeader"
                        checked={member.isLeader}
                        onChange={(e) => {
                          const updatedMembers = formData.members.map((m, i) => ({
                            ...m,
                            isLeader: i === index ? e.target.checked : false
                          }));
                          setFormData(prev => ({ ...prev, members: updatedMembers }));
                        }}
                        disabled={loading}
                      />
                      Team Leader
                    </label>
                  </div>
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      disabled={loading}
                      className="remove-member-btn"
                    >
                      Remove Member
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addMember}
                disabled={loading}
                className="add-member-btn"
              >
                Add Another Member
              </button>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Registering..." : "Register Team"}
            </button>

            <p className="auth-link">
              Already have an account? <Link to="/signin">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;