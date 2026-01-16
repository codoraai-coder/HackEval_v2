import React, { useContext, useState, useEffect } from "react";
import { TeamContext } from "../context/TeamContext.jsx";
import "./TeamInfo.css";

const TeamInfo = () => {
  const { team, loading } = useContext(TeamContext);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Add pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="team-schedule-container">
        <div className="team-schedule-loading">
          <div className="team-schedule-spinner"></div>
          <p>Loading team information...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-schedule-container">
        <div className="team-schedule-header">
          <h1 className="team-schedule-title">
            <span className="team-schedule-title-text">TEAM INFORMATION</span>
            <span className="team-schedule-title-highlight"></span>
          </h1>
        </div>
        <div className="team-schedule-empty">
          <div className="team-schedule-empty-icon">👥</div>
          <h2>No Team Found</h2>
          <p>Please sign in or create a team to view information.</p>
        </div>
      </div>
    );
  }

  // Debug team data
  console.log("Team data for debugging:", team);

  // Support BOTH mapped shape and raw backend doc
  const isMapped = !!team.team_name || !!team.problem_statement;
  console.log("Is mapped format?", isMapped);
  
  const teamName = isMapped ? team.team_name : (team.teamName || team.name || "N/A");
  const teamId = isMapped ? team.team_id : (team._id || team.id || "N/A");
  const status = isMapped ? team.status : (team.isActive ? "Active" : (team.status || "Inactive"));
  const universityRollNo = isMapped
    ? team.university_roll_no
    : (team.universityRollNo || team.registrationId || "N/A");
  const college = isMapped ? team.college : (team.college || team.institution || "N/A");
  const department = isMapped ? team.department : (team.department || team.branch || "N/A");
  const year = isMapped ? team.year : (team.year || team.academicYear || "N/A");

  const problemStatement = isMapped
    ? team.problem_statement
    : {
        ps_id: team.problemStatement?.ps_id || team.psId || "N/A",
        title: team.problemStatement?.title || team.problemTitle || "N/A",
        description: team.problemStatement?.description || team.problemDescription || "N/A",
        category: team.problemStatement?.category || team.category || "N/A",
        difficulty: team.problemStatement?.difficulty || team.difficulty || "N/A",
      };

  // Leader: mapped vs raw with multiple fallbacks
  let leaderCard = null;
  
  if (isMapped) {
    leaderCard = team.team_leader
      ? {
          name: team.team_leader.name || team.team_leader.fullName || "N/A",
          roll_no: team.team_leader.roll_no || team.team_leader.rollNo || team.team_leader.id || "N/A",
          email: team.team_leader.email || team.team_leader.emailId || "N/A",
          contact: team.team_leader.contact || team.team_leader.phone || team.team_leader.mobile || "N/A",
          role: team.team_leader.role || "Team Leader",
        }
      : null;
  } else {
    const leader = Array.isArray(team.members)
      ? team.members.find((m) => m.isLeader || m.role === "leader" || m.is_leader)
      : null;
    
    leaderCard = leader
      ? {
          name: leader.name || leader.fullName || leader.username || "N/A",
          roll_no: leader.rollNo || leader.roll_no || leader.id || "N/A",
          email: leader.email || leader.emailId || "N/A",
          contact: leader.phone || leader.contact || leader.mobile || "N/A",
          role: "Team Leader",
        }
      : null;
  }

  // Members: mapped vs raw (exclude leader)
  let membersList = [];
  
  if (isMapped) {
    membersList = team.team_members || [];
  } else {
    if (Array.isArray(team.members)) {
      membersList = team.members
        .filter((m) => {
          const isLeader = m.isLeader || m.role === "leader" || m.is_leader;
          return !isLeader;
        })
        .map((m) => ({
          name: m.name || m.fullName || m.username || "N/A",
          roll_no: m.rollNo || m.roll_no || m.id || "N/A",
          email: m.email || m.emailId || "N/A",
          contact: m.phone || m.contact || m.mobile || "N/A",
          role: "Member",
        }));
    }
  }

  return (
    <div className="team-schedule-container">
      {/* Background Animated Elements */}
      <div className="team-schedule-bg">
        <div className="team-schedule-shape shape-1"></div>
        <div className="team-schedule-shape shape-2"></div>
        <div className="team-schedule-shape shape-3"></div>
      </div>

      {/* Main Header */}
      <div className="team-schedule-header">
        <h1 className="team-schedule-title">
          <span className="team-schedule-title-text">TEAM INFORMATION</span>
          <span className="team-schedule-title-highlight"></span>
        </h1>
        <div className={`team-schedule-timer ${pulseAnimation ? 'team-schedule-pulse' : ''}`}>
          <div className="team-schedule-timer-label">TEAM STATUS</div>
          <div className="team-schedule-timer-digits">
            {status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Team Overview Section */}
      <div className="team-schedule-section">
        <div className="team-schedule-section-header team-schedule-gradient">
          <div className="team-schedule-section-title">
            <span className="team-schedule-section-number">01</span>
            <span className="team-schedule-section-text">TEAM OVERVIEW</span>
          </div>
          <div className="team-schedule-section-status">
            <span className={`team-schedule-status-badge ${status === "Active" ? "team-schedule-active" : "team-schedule-inactive"}`}>
              {status}
            </span>
          </div>
        </div>
        
        <div className="team-schedule-grid">
          <div className="team-schedule-identity-card">
            <div className="team-schedule-card-header">
              <span className="team-schedule-card-icon">🏷️</span>
              <h3>Team Identity</h3>
            </div>
            <div className="team-schedule-card-body">
              <div className="team-schedule-info-large">
                <label>Team Name</label>
                <p className="team-schedule-info-value-large team-schedule-highlight">{teamName}</p>
              </div>
              <div className="team-schedule-info-row">
                <div className="team-schedule-info-item">
                  <label>Team ID</label>
                  <p className="team-schedule-info-value">{teamId}</p>
                </div>
                <div className="team-schedule-info-item">
                  <label>Registration ID</label>
                  <p className="team-schedule-info-value">{universityRollNo}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="team-schedule-institution-card">
            <div className="team-schedule-card-header">
              <span className="team-schedule-card-icon">🏫</span>
              <h3>Institution Details</h3>
            </div>
            <div className="team-schedule-card-body">
              <div className="team-schedule-info-item">
                <label>College</label>
                <p className="team-schedule-info-value">{college}</p>
              </div>
              <div className="team-schedule-info-item">
                <label>Department</label>
                <p className="team-schedule-info-value">{department}</p>
              </div>
              <div className="team-schedule-info-item">
                <label>Year</label>
                <p className="team-schedule-info-value">{year}</p>
              </div>
            </div>
          </div>

          <div className="team-schedule-stats-card">
            <div className="team-schedule-card-header">
              <span className="team-schedule-card-icon">📊</span>
              <h3>Team Stats</h3>
            </div>
            <div className="team-schedule-card-body">
              <div className="team-schedule-stats-grid">
                <div className="team-schedule-stat-item">
                  <div className="team-schedule-stat-value">{membersList.length + 1}</div>
                  <div className="team-schedule-stat-label">Total Members</div>
                </div>
                <div className="team-schedule-stat-item">
                  <div className="team-schedule-stat-value">1</div>
                  <div className="team-schedule-stat-label">Team Leader</div>
                </div>
                <div className="team-schedule-stat-item">
                  <div className="team-schedule-stat-value">{membersList.length}</div>
                  <div className="team-schedule-stat-label">Team Members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="team-schedule-section">
        <div className="team-schedule-section-header team-schedule-gradient">
          <div className="team-schedule-section-title">
            <span className="team-schedule-section-number">02</span>
            <span className="team-schedule-section-text">TEAM MEMBERS</span>
          </div>
          <div className="team-schedule-section-count">
            <span className="team-schedule-count-badge">
              {membersList.length + 1} Members
            </span>
          </div>
        </div>
        
        <div className="team-schedule-members-container">
          <div className="team-schedule-members-grid">
            {/* Team Leader Card */}
            {leaderCard && (
              <div className="team-schedule-member-card team-schedule-leader-card" data-priority="high">
                <div className="team-schedule-member-header">
                  <div className="team-schedule-member-avatar">👤</div>
                  <div className="team-schedule-member-role">
                    <span className="team-schedule-role-badge team-schedule-leader">TEAM LEADER</span>
                  </div>
                </div>
                <div className="team-schedule-member-body">
                  <h3 className="team-schedule-member-name">{leaderCard.name}</h3>
                  <div className="team-schedule-member-info">
                    <div className="team-schedule-info-row">
                      <span className="team-schedule-info-label">Roll No:</span>
                      <span className="team-schedule-info-value">{leaderCard.roll_no}</span>
                    </div>
                    <div className="team-schedule-info-row">
                      <span className="team-schedule-info-label">Email:</span>
                      <span className="team-schedule-info-value team-schedule-email">{leaderCard.email}</span>
                    </div>
                    <div className="team-schedule-info-row">
                      <span className="team-schedule-info-label">Contact:</span>
                      <span className="team-schedule-info-value">{leaderCard.contact}</span>
                    </div>
                  </div>
                </div>
                <div className="team-schedule-member-glow"></div>
              </div>
            )}

            {/* Team Members Cards */}
            {membersList.map((member, index) => (
              <div key={index} className="team-schedule-member-card" data-priority={index % 2 === 0 ? "medium" : "low"}>
                <div className="team-schedule-member-header">
                  <div className="team-schedule-member-avatar">👤</div>
                  <div className="team-schedule-member-role">
                    <span className="team-schedule-role-badge team-schedule-member">TEAM MEMBER</span>
                  </div>
                </div>
                <div className="team-schedule-member-body">
                  <h3 className="team-schedule-member-name">{member.name}</h3>
                  <div className="team-schedule-member-info">
                    <div className="team-schedule-info-row">
                      <span className="team-schedule-info-label">Roll No:</span>
                      <span className="team-schedule-info-value">{member.roll_no}</span>
                    </div>
                    <div className="team-schedule-info-row">
                      <span className="team-schedule-info-label">Email:</span>
                      <span className="team-schedule-info-value team-schedule-email">{member.email}</span>
                    </div>
                    <div className="team-schedule-info-row">
                      <span className="team-schedule-info-label">Contact:</span>
                      <span className="team-schedule-info-value">{member.contact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {membersList.length === 0 && leaderCard && (
              <div className="team-schedule-empty-members">
                <div className="team-schedule-empty-icon">👥</div>
                <h3>No Additional Members</h3>
                <p>Only the team leader is registered in this team.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default TeamInfo;