import React, { useContext } from "react";
import { TeamContext } from "../context/TeamContext.jsx";

const TeamInfo = () => {
  const { team, loading } = useContext(TeamContext);
  console.log("TeamInfo team:", team);

  if (loading) {
    return (
      <div className="team-info-container">
        <p>Loading team information...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-info-container">
        <h1>Team Information</h1>
        <p>No team found. Please sign in.</p>
      </div>
    );
  }

  // Support BOTH mapped shape and raw backend doc
  const isMapped = !!team.team_name || !!team.problem_statement;
  const teamName = isMapped ? team.team_name : team.teamName || "";
  const teamId = isMapped ? team.team_id : team._id || "";
  const status = isMapped ? team.status : team.isActive ? "Active" : "Inactive";
  const universityRollNo = isMapped
    ? team.university_roll_no
    : team.universityRollNo || "N/A";
  const college = isMapped ? team.college : team.college || "N/A";
  const department = isMapped ? team.department : team.department || "N/A";
  const year = isMapped ? team.year : team.year || "N/A";

  const problemStatement = isMapped
    ? team.problem_statement
    : {
        ps_id: team.problemStatement?.ps_id || "N/A",
        title: team.problemStatement?.title || "N/A",
        description: team.problemStatement?.description || "N/A",
        category: team.problemStatement?.category || "N/A",
        difficulty: team.problemStatement?.difficulty || "N/A",
      };

  // Leader: mapped vs raw
  let leaderCard = null;
  if (isMapped) {
    leaderCard = team.team_leader
      ? {
          name: team.team_leader.name,
          roll_no: team.team_leader.roll_no,
          email: team.team_leader.email,
          contact: team.team_leader.contact,
          role: team.team_leader.role || "Team Leader",
        }
      : null;
  } else {
    const leader = Array.isArray(team.members)
      ? team.members.find((m) => m.isLeader)
      : null;
    leaderCard = leader
      ? {
          name: leader.name || "",
          roll_no: leader.rollNo || "", // raw doc may not have rollNo
          email: leader.email || "",
          contact: leader.phone || "",
          role: "Team Leader",
        }
      : null;
  }

  // Members: mapped vs raw (exclude leader)
  const membersList = isMapped
    ? team.team_members || []
    : Array.isArray(team.members)
      ? team.members
          .filter((m) => !m.isLeader)
          .map((m) => ({
            name: m.name || "",
            roll_no: m.rollNo || "",
            email: m.email || "",
            contact: m.phone || "",
            role: "Member",
          }))
      : [];

  return (
    <div className="team-info-container">
      <h1>Team Information</h1>

      <div className="team-info-content">
        <div className="team-details">
          <h2>Team Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Team Name:</label>
              <p>{teamName}</p>
            </div>
            <div className="info-item">
              <label>Team ID:</label>
              <p>{teamId}</p>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <p>{status}</p>
            </div>
            <div className="info-item">
              <label>University Roll No:</label>
              <p>{universityRollNo}</p>
            </div>
            <div className="info-item">
              <label>College:</label>
              <p>{college}</p>
            </div>
            <div className="info-item">
              <label>Department:</label>
              <p>{department}</p>
            </div>
            <div className="info-item">
              <label>Year:</label>
              <p>{year}</p>
            </div>
          </div>
        </div>

        <div className="team-leader">
          <h2>Team Leader</h2>
          <div className="member-card">
            <h3>{leaderCard?.name || "N/A"}</h3>
            <p>Roll No: {leaderCard?.roll_no || "N/A"}</p>
            <p>Email: {leaderCard?.email || "N/A"}</p>
            <p>Contact: {leaderCard?.contact || "N/A"}</p>
            <p>Role: {leaderCard?.role || "Team Leader"}</p>
          </div>
        </div>

        <div className="team-members">
          <h2>Team Members</h2>
          <div className="members-list">
            {membersList && membersList.length > 0 ? (
              membersList.map((member, index) => (
                <div key={index} className="member-card">
                  <h3>{member.name}</h3>
                  <p>Roll No: {member.roll_no || "N/A"}</p>
                  <p>Email: {member.email || "N/A"}</p>
                  <p>Contact: {member.contact || "N/A"}</p>
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
              <p>{problemStatement?.ps_id || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Title:</label>
              <p>{problemStatement?.title || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Description:</label>
              <p>{problemStatement?.description || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Category:</label>
              <p>{problemStatement?.category || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Difficulty:</label>
              <p>{problemStatement?.difficulty || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamInfo;
