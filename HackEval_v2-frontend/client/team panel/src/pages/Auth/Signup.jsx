import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";
import { API_BASE_URL } from "../../config";
import HeaderSignIn from "./Header_SignIn";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamName: "",
    // Team-level email remains for account login; will be kept in sync with leader email
    email: "",
    password: "",
    confirmPassword: "",
    projectTitle: "",
    projectDescription: "",
    technologyStack: "",
    category: "",
    subcategory: "", // NEW
    universityRollNo: "", // NEW
    members: [
      { name: "", email: "", phone: "", rollNo: "", isLeader: true }, // NEW rollNo
    ],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep team email always equal to first member's email (team leader)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: prev.members[0]?.email || prev.email,
    }));
  }, [formData.members[0]?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...formData.members];
    updatedMembers[index][name] = value;

    // Enforce first member is leader; others are not
    if (index === 0) {
      updatedMembers[0].isLeader = true;
    } else {
      updatedMembers[index].isLeader = false;
    }

    setFormData((prev) => ({
      ...prev,
      members: updatedMembers,
    }));
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { name: "", email: "", phone: "", rollNo: "", isLeader: false },
      ],
    }));
  };

  const removeMember = (index) => {
    if (formData.members.length <= 1) {
      toast.error("At least one team member is required");
      return;
    }
    // Prevent removing the leader (first member)
    if (index === 0) {
      toast.error("The first member is the Team Leader and cannot be removed.");
      return;
    }
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      members: updatedMembers,
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
    // Ensure first member is leader
    const firstIsLeader = formData.members[0]?.isLeader === true;
    if (!firstIsLeader) {
      setError("First team member must be the Team Leader");
      setLoading(false);
      return;
    }
    // Keep account email equal to leader email
    const leaderEmail = formData.members[0]?.email || "";
    if (!leaderEmail) {
      setError("Team Leader Email is required");
      setLoading(false);
      return;
    }

    try {
      const techStackArray = formData.technologyStack
        ? formData.technologyStack
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const problemStatement = {
        title: formData.projectTitle || "",
        description: formData.projectDescription || "",
        category: formData.category || "",
        ps_id: "", // optional
      };

      const response = await fetch(`${API_BASE_URL}/team/team_register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: formData.teamName,
          // Ensure email matches leader email
          email: leaderEmail,
          password: formData.password,
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          technologyStack: techStackArray,
          category: formData.category,
          subcategory: formData.subcategory, // NEW
          universityRollNo: formData.universityRollNo, // NEW
          members: formData.members.map((m, i) => ({
            name: m.name,
            email: m.email,
            phone: m.phone,
            rollNo: m.rollNo || "",
            isLeader: i === 0, // enforce leader
          })),
          problemStatement,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Registration failed");
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
      {/* <HeaderSignIn /> */}
      <div className="auth-container">
        <div className="auth-card wide">
          <div className="auth-logo">
            <img src="../../public/images/codoraai.png" alt="Codora AI" />
          </div>
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

              {/* Team Leader Email binds to first member */}
              <div className="form-group">
                <label>Team Leader Email *</label>
                <input
                  type="email"
                  name="leaderEmail"
                  value={formData.members[0]?.email || ""}
                  onChange={(e) =>
                    handleMemberChange(0, {
                      target: { name: "email", value: e.target.value },
                    })
                  }
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

              {/* New fields for Dashboard compatibility */}
              <div className="form-group">
                <label>University Roll No</label>
                <input
                  type="text"
                  name="universityRollNo"
                  value={formData.universityRollNo}
                  onChange={handleChange}
                  placeholder="Enter university roll no (optional)"
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

              <div className="form-group">
                <label>Subcategory</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="Enter subcategory (optional)"
                  disabled={loading}
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
                    <label>Member {index + 1} Roll No</label>
                    <input
                      type="text"
                      name="rollNo"
                      value={member.rollNo || ""}
                      onChange={(e) => handleMemberChange(index, e)}
                      placeholder="Enter member roll no (optional)"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isLeader"
                        checked={index === 0 ? true : false}
                        onChange={() => {}}
                        disabled={true} // Enforce: first member is leader only
                      />
                      Team Leader {index === 0 ? "(fixed)" : "(disabled)"}
                    </label>
                  </div>
                  {formData.members.length > 1 && index !== 0 && (
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
