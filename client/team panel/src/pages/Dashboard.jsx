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

  // Map backend Team doc into Dashboard UI fields
  const mapTeamToDashboard = (teamDoc) => {
    if (!teamDoc) return null;

    // Find the leader in members
    const leader = Array.isArray(teamDoc.members)
      ? teamDoc.members.find((m) => m.isLeader)
      : null;

    // Non-leader members listed by name
    const memberNames = Array.isArray(teamDoc.members)
      ? teamDoc.members.filter((m) => !m.isLeader).map((m) => m.name)
      : [];

    return {
      // Summary fields
      team_name: teamDoc.teamName || "",
      team_id: teamDoc._id || "",
      category: teamDoc.category || "N/A",
      subcategory: teamDoc.subcategory || "", // not present in your data
      university_roll_no: teamDoc.universityRollNo || "", // not present; UI shows "N/A" if empty

      // Problem statement
      problem_statement_id: teamDoc.problemStatement?.ps_id || "", // not present in your doc -> empty
      statement:
        teamDoc.problemStatement?.description ||
        teamDoc.projectDescription || // show projectDescription if problemStatement missing
        "",

      // Team leader block
      team_leader: leader
        ? {
            name: leader.name || "",
            roll_no: leader.rollNo || "", // not present in your doc
            email: leader.email || "",
            contact: leader.phone || "",
          }
        : null,

      // Members list
      members: memberNames,
    };
  };

  useEffect(() => {
    async function fetchTeam() {
      try {
        // Prefer context team if available
        if (team) {
          setDashboardData(mapTeamToDashboard(team));
          setLoading(false);
          return;
        }

        // Parse localStorage team as fallback
        const teamFromStorage = localStorage.getItem("team");
        let parsedTeam = null;
        if (teamFromStorage) {
          try {
            parsedTeam = JSON.parse(teamFromStorage);
          } catch {
            parsedTeam = null;
          }
        }

        // If token exists, fetch current team from backend
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
            // Fallback to localStorage team if present
            if (parsedTeam) {
              setDashboardData(mapTeamToDashboard(parsedTeam));
              setError("");
            } else {
              setError(
                err.message || "Failed to fetch team data from backend.",
              );
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

  // Active round polling remains (will no-op if endpoint not available)
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
        <p>
          No team data found. Please <Link to="/signin">sign in</Link>.
        </p>
      </Shell>
    );
  }

  // UI section below untouched
  return (
    <Shell>
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="current-round">
            Current Round: {activeRound ? `Round ${activeRound}` : "None"}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="team-summary">
          <h2>Team Summary</h2>
          <div className="summary-content">
            <div className="summary-item">
              <span className="label">Team Name:</span>
              <span className="value">{dashboardData.team_name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Team ID:</span>
              <span className="value">{dashboardData.team_id}</span>
            </div>
            <div className="summary-item">
              <span className="label">Problem Statement ID:</span>
              <span className="value">
                {dashboardData.problem_statement_id || "N/A"}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Category:</span>
              <span className="value">{dashboardData.category || "N/A"}</span>
            </div>
            {dashboardData.subcategory && (
              <div className="summary-item">
                <span className="label">Subcategory:</span>
                <span className="value">{dashboardData.subcategory}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="label">University Roll No:</span>
              <span className="value">
                {dashboardData.university_roll_no || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="team-members">
            <h2>Team Members</h2>
            <div className="members-list">
              {dashboardData.team_leader && (
                <div className="member-card">
                  <div className="member-avatar">
                    {dashboardData.team_leader.name.charAt(0)}
                  </div>
                  <div className="member-info">
                    <h4>{dashboardData.team_leader.name}</h4>
                    <p>Role: Team Leader</p>
                    {dashboardData.team_leader.roll_no && (
                      <p>Roll No: {dashboardData.team_leader.roll_no}</p>
                    )}
                    <p>Email: {dashboardData.team_leader.email}</p>
                    <p>Contact: {dashboardData.team_leader.contact}</p>
                  </div>
                </div>
              )}
              {dashboardData.members?.length > 0 && (
                <div className="member-list">
                  <h4>Team Members:</h4>
                  <ul>
                    {dashboardData.members.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
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
