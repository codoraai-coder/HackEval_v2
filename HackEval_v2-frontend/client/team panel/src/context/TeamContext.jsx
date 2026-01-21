import React, { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

export const TeamContext = createContext(null);

const mapBackendTeamToUI = (teamDoc) => {
  if (!teamDoc) return null;
  const leader = Array.isArray(teamDoc.members)
    ? teamDoc.members.find((m) => m.isLeader)
    : null;
  const memberCards = Array.isArray(teamDoc.members)
    ? teamDoc.members
        .filter((m) => !m.isLeader)
        .map((m) => ({
          name: m.name || "",
          roll_no: m.rollNo || "",
          email: m.email || "",
          contact: m.phone || "",
          role: "Member",
        }))
    : [];

  return {
    team_name: teamDoc.teamName || "",
    team_id: teamDoc._id || "",
    status: teamDoc.isActive ? "Active" : "Inactive",
    college: teamDoc.college || "N/A",
    department: teamDoc.department || "N/A",
    year: teamDoc.year || "N/A",
    university_roll_no: teamDoc.universityRollNo || "N/A",
    team_leader: leader
      ? {
          name: leader.name || "",
          roll_no: leader.rollNo || "",
          email: leader.email || "",
          contact: leader.phone || "",
          role: "Team Leader",
        }
      : null,
    team_members: memberCards,
    problem_statement: {
      ps_id: teamDoc.problemStatement?.ps_id || "N/A",
      title: teamDoc.problemStatement?.title || "N/A",
      description: teamDoc.problemStatement?.description || "N/A",
      category: teamDoc.problemStatement?.category || "N/A",
      difficulty: teamDoc.problemStatement?.difficulty || "N/A",
    },
  };
};

export const TeamProvider = ({ children }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTeam(null);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/team/team`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to load team");
      }
      const mapped = mapBackendTeamToUI(payload.data);
      setTeam(mapped);
      localStorage.setItem("team_raw", JSON.stringify(payload.data));
    } catch (e) {
      console.error("TeamProvider fetch error:", e.message);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <TeamContext.Provider
      value={{ team, loading, refetch: fetchTeam, setTeam }}
    >
      {children}
    </TeamContext.Provider>
  );
};
