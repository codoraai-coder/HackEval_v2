import React, { useContext, useEffect, useState } from "react";
import { TeamContext } from "../context/TeamContext";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Dashboard.css";

const Dashboard = () => {
  const { team } = useContext(TeamContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const [activeRound, setActiveRound] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    projectStatus: "Not Submitted",
    nextDeadline: "N/A"
  });

  const mapTeamToDashboard = (teamDoc) => {
    if (!teamDoc) return null;

    const leader = Array.isArray(teamDoc.members)
      ? teamDoc.members.find((m) => m.isLeader)
      : null;

    const memberNames = Array.isArray(teamDoc.members)
      ? teamDoc.members.filter((m) => !m.isLeader).map((m) => m.name)
      : [];

    // Calculate stats
    const totalMembers = memberNames.length + (leader ? 1 : 0);
    const projectStatus = teamDoc.projectSubmitted ? "Submitted" : "In Progress";
    const nextDeadline = teamDoc.nextDeadline || "N/A";

    setStats({
      totalMembers,
      projectStatus,
      nextDeadline
    });

    return {
      team_name: teamDoc.teamName || "",
      team_id: teamDoc._id || "",
      category: teamDoc.category || "N/A",
      subcategory: teamDoc.subcategory || "",
      university_roll_no: teamDoc.universityRollNo || "",
      problem_statement_id: teamDoc.problemStatement?.ps_id || "",
      statement: teamDoc.problemStatement?.description || teamDoc.projectDescription || "",
      project_submitted: teamDoc.projectSubmitted || false,
      
      team_leader: leader ? {
        name: leader.name || "",
        roll_no: leader.rollNo || "",
        email: leader.email || "",
        contact: leader.phone || "",
      } : null,

      members: memberNames,
    };
  };

  useEffect(() => {
    async function fetchTeam() {
      try {
        if (team) {
          setDashboardData(mapTeamToDashboard(team));
          setLoading(false);
          return;
        }

        const teamFromStorage = localStorage.getItem("team");
        let parsedTeam = null;
        if (teamFromStorage) {
          try {
            parsedTeam = JSON.parse(teamFromStorage);
          } catch {
            parsedTeam = null;
          }
        }

        if (token) {
          try {
            const res = await fetch(`${API_BASE_URL}/team/team`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            const payload = await res.json();

            if (!res.ok || !payload?.success) {
              throw new Error(payload?.message || "Failed to fetch team");
            }

            const backendTeam = payload.data;
            setDashboardData(mapTeamToDashboard(backendTeam));
            setError("");
          } catch (err) {
            if (parsedTeam) {
              setDashboardData(mapTeamToDashboard(parsedTeam));
              setError("");
            } else {
              setError(err.message || "Failed to fetch team data from backend.");
              setDashboardData(null);
            }
          } finally {
            setLoading(false);
          }
        } else if (parsedTeam) {
          setDashboardData(mapTeamToDashboard(parsedTeam));
          setLoading(false);
        } else {
          setError("No authenticated session found. Please sign in.");
          setDashboardData(null);
          setLoading(false);
        }
      } catch {
        setError("Unexpected error while loading dashboard.");
        setDashboardData(null);
        setLoading(false);
      }
    }

    fetchTeam();
  }, [team, token]);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/round-state/active`);
        if (!r.ok) return;
        const d = await r.json();
        if (mounted) setActiveRound(d.round);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
          <h2>Loading Dashboard...</h2>
          <p>Please wait while we fetch your team information</p>
        </div>
      </div>
    );
  }

  const Shell = ({ children }) => (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {children}
      </div>
    </div>
  );

  if (error) {
    return (
      <Shell>
        <div className="dashboard-error">
          <div className="dashboard-error-icon">⚠️</div>
          <h1>Oops! Something went wrong</h1>
          <p className="dashboard-error-message">{error}</p>
          <Link to="/signin" className="dashboard-retry-btn">
            Return to Sign In
          </Link>
        </div>
      </Shell>
    );
  }

  if (!dashboardData) {
    return (
      <Shell>
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">👥</div>
          <h1>No Team Found</h1>
          <p>You haven't joined or created a team yet.</p>
          <Link to="/team/join" className="dashboard-cta-btn">
            Join a Team
          </Link>
          <p className="dashboard-empty-subtext">or</p>
          <Link to="/team/create" className="dashboard-cta-btn secondary">
            Create New Team
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          Team Dashboard
          <span className="dashboard-title-highlight"></span>
        </div>
        <div className="dashboard-round-card">
          <span className="dashboard-round-label">CURRENT ROUND</span>
          <span className="dashboard-round-value">
            {activeRound ? `Round ${activeRound}` : "Not Started"}
          </span>
        </div>
      </div>


      {/* Stats Overview */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">👥</div>
          <div className="dashboard-stat-content">
            <h3>Team Size</h3>
            <p className="dashboard-stat-value">{stats.totalMembers} Members</p>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">📋</div>
          <div className="dashboard-stat-content">
            <h3>Problem Statement</h3>
            <p className="dashboard-stat-value">{dashboardData.problem_statement_id || "N/A"}</p>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">🎯</div>
          <div className="dashboard-stat-content">
            <h3>Category</h3>
            <p className="dashboard-stat-value">{dashboardData.category}</p>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">⏰</div>
          <div className="dashboard-stat-content">
            <h3>Next Deadline</h3>
            <p className="dashboard-stat-value">{stats.nextDeadline}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Team Details Section */}
        <div className="dashboard-card dashboard-team-details">
          <div className="dashboard-card-header">
            <h2>Team Details</h2>
            <span className="dashboard-team-id">ID: {dashboardData.team_id}</span>
          </div>
          
          <div className="dashboard-team-info-grid">
            <div className="dashboard-info-item">
              <label>Team Name</label>
              <p className="dashboard-info-value">{dashboardData.team_name}</p>
            </div>
            <div className="dashboard-info-item">
              <label>Category</label>
              <p className="dashboard-info-value">{dashboardData.category}</p>
            </div>
            {dashboardData.subcategory && (
              <div className="dashboard-info-item">
                <label>Subcategory</label>
                <p className="dashboard-info-value">{dashboardData.subcategory}</p>
              </div>
            )}
            <div className="dashboard-info-item">
              <label>University Roll No</label>
              <p className="dashboard-info-value">{dashboardData.university_roll_no || "N/A"}</p>
            </div>
          </div>

          {/* Team Leader */}
          {dashboardData.team_leader && (
            <div className="dashboard-leader-section">
              <h3>Team Leader</h3>
              <div className="dashboard-leader-card">
                <div className="dashboard-leader-avatar">
                  {dashboardData.team_leader.name.charAt(0)}
                </div>
                <div className="dashboard-leader-info">
                  <h4>{dashboardData.team_leader.name}</h4>
                  <div className="dashboard-leader-details">
                    <div className="dashboard-detail-item">
                      <span className="dashboard-detail-label">Email</span>
                      <span className="dashboard-detail-value">{dashboardData.team_leader.email}</span>
                    </div>
                    <div className="dashboard-detail-item">
                      <span className="dashboard-detail-label">Contact</span>
                      <span className="dashboard-detail-value">{dashboardData.team_leader.contact}</span>
                    </div>
                    {dashboardData.team_leader.roll_no && (
                      <div className="dashboard-detail-item">
                        <span className="dashboard-detail-label">Roll No</span>
                        <span className="dashboard-detail-value">{dashboardData.team_leader.roll_no}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {dashboardData.members?.length > 0 && (
            <div className="dashboard-members-section">
              <h3>Team Members ({dashboardData.members.length})</h3>
              <div className="dashboard-members-list">
                {dashboardData.members.map((member, index) => (
                  <div key={index} className="dashboard-member-item">
                    <div className="dashboard-member-avatar">
                      {member.charAt(0)}
                    </div>
                    <span className="dashboard-member-name">{member}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Section */}
        <div className="dashboard-card dashboard-project-section">
          <div className="dashboard-card-header">
            <h2>Project Details</h2>
            <span className={`dashboard-status-badge ${dashboardData.project_submitted ? 'submitted' : 'pending'}`}>
              {dashboardData.project_submitted ? 'Submitted' : 'Pending'}
            </span>
          </div>

          <div className="dashboard-project-content">
            <div className="dashboard-problem-statement-section">
              <h3>Problem Statement</h3>
              <div className="dashboard-statement-id">
                <span className="dashboard-id-label">ID:</span>
                <span className="dashboard-id-value">{dashboardData.problem_statement_id || "Not Assigned"}</span>
              </div>
              <div className="dashboard-statement-content">
                <p>{dashboardData.statement || "No problem statement assigned yet."}</p>
              </div>
            </div>

            <div className="dashboard-project-actions">
              <button className="dashboard-action-btn primary">
                View Full Statement
              </button>
              <button className="dashboard-action-btn secondary">
                Submit Project
              </button>
              <button className="dashboard-action-btn outline">
                Download Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default Dashboard;