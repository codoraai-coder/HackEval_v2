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

  useEffect(() => {
    async function fetchTeam() {
      const teamFromStorage = localStorage.getItem("team");
      if (!team && token) {
        let teamId = null;
        try { teamId = JSON.parse(teamFromStorage)?.team_id; } catch {}
        if (teamId) {
          try {
            const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setDashboardData(data);
          } catch {
            setError("Failed to fetch team data from backend.");
            setDashboardData(null);
          }
        } else {
          setError("No teamId found in localStorage.");
          setDashboardData(null);
        }
      } else if (team) {
        setDashboardData(team);
      }
      setLoading(false);
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
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (loading) return <div className="loading-state">Loading Dashboard...</div>;

  const Shell = ({ children }) => (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {children}
        <div className="page-bottom-spacer" />
      </div>
    </div>
  );

  if (error) {
    return (
      <Shell>
        <h1>Team Dashboard</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
      </Shell>
    );
  }

  if (!dashboardData) {
    return (
      <Shell>
        <h1>Team Dashboard</h1>
        <p>No team data found. Please <Link to="/signin">sign in</Link>.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="current-round">Current Round: {activeRound ? `Round ${activeRound}` : "None"}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="team-summary">
          <h2>Team Summary</h2>
          <div className="summary-content">
            <div className="summary-item"><span className="label">Team Name:</span><span className="value">{dashboardData.team_name}</span></div>
            <div className="summary-item"><span className="label">Team ID:</span><span className="value">{dashboardData.team_id}</span></div>
            <div className="summary-item"><span className="label">Problem Statement ID:</span><span className="value">{dashboardData.problem_statement_id}</span></div>
            <div className="summary-item"><span className="label">Category:</span><span className="value">{dashboardData.category || "N/A"}</span></div>
            {dashboardData.subcategory && (
              <div className="summary-item"><span className="label">Subcategory:</span><span className="value">{dashboardData.subcategory}</span></div>
            )}
            <div className="summary-item"><span className="label">University Roll No:</span><span className="value">{dashboardData.university_roll_no || "N/A"}</span></div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="team-members">
            <h2>Team Members</h2>
            <div className="members-list">
              {dashboardData.team_leader && (
                <div className="member-card">
                  <div className="member-avatar">{dashboardData.team_leader.name.charAt(0)}</div>
                  <div className="member-info">
                    <h4>{dashboardData.team_leader.name}</h4>
                    <p>Role: Team Leader</p>
                    {dashboardData.team_leader.roll_no && <p>Roll No: {dashboardData.team_leader.roll_no}</p>}
                    <p>Email: {dashboardData.team_leader.email}</p>
                    <p>Contact: {dashboardData.team_leader.contact}</p>
                  </div>
                </div>
              )}
              {dashboardData.members?.length > 0 && (
                <div className="member-list">
                  <h4>Team Members:</h4>
                  <ul>{dashboardData.members.map((m, i) => <li key={i}>{m}</li>)}</ul>
                </div>
              )}
            </div>
          </div>

          <div className="project-info">
            <h2>Problem Statement</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Statement:</label>
                <p>{dashboardData.statement || "No statement provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default Dashboard;