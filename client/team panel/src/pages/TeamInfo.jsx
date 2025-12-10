import React, { useContext } from "react";
import { TeamContext } from "../context/TeamContext";

const TeamInfo = () => {
  const { team } = useContext(TeamContext);

  console.log("DEBUG: TeamInfo team data:", team);

  return (
    <div className="team-info-container">
      <h1>Team Information</h1>
      {team ? (
        <div className="team-info-content">
          <div className="team-details">
            <h2>Team Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Team Name:</label>
                <p>{team.team_name}</p>
              </div>
              <div className="info-item">
                <label>Team ID:</label>
                <p>{team.team_id}</p>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <p>{team.status || "Active"}</p>
              </div>
              <div className="info-item">
                <label>College:</label>
                <p>{team.college}</p>
              </div>
              <div className="info-item">
                <label>Department:</label>
                <p>{team.department}</p>
              </div>
              <div className="info-item">
                <label>Year:</label>
                <p>{team.year}</p>
              </div>
            </div>
          </div>

          <div className="team-leader">
            <h2>Team Leader</h2>
            <div className="member-card">
              <h3>{team.team_leader?.name}</h3>
              <p>Roll No: {team.team_leader?.roll_no}</p>
              <p>Email: {team.team_leader?.email}</p>
              <p>Contact: {team.team_leader?.contact}</p>
              <p>Role: {team.team_leader?.role || "Team Leader"}</p>
            </div>
          </div>

          <div className="team-members">
            <h2>Team Members</h2>
            <div className="members-list">
              {team.team_members && team.team_members.length > 0 ? (
                team.team_members.map((member, index) => (
                  <div key={index} className="member-card">
                    <h3>{member.name}</h3>
                    <p>Roll No: {member.roll_no}</p>
                    <p>Email: {member.email}</p>
                    <p>Contact: {member.contact}</p>
                    <p>Role: {member.role || "Member"}</p>
                  </div>
                ))
              ) : (
                <p>No members listed.</p>
              )}
            </div>
          </div>

          <div className="project-info">
            <h2>Problem Statement</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>PS ID:</label>
                <p>{team.problem_statement?.ps_id || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>Title:</label>
                <p>{team.problem_statement?.title || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>Description:</label>
                <p>{team.problem_statement?.description || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>Category:</label>
                <p>{team.problem_statement?.category || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>Difficulty:</label>
                <p>{team.problem_statement?.difficulty || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading team information...</p>
      )}
    </div>
  );
};

export default TeamInfo;