import React, { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

export const TeamContext = createContext({
  team: null,
  loading: true,
  refetch: () => {},
  setTeam: () => {}
});

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
    teamName: teamDoc.teamName || "",
    teamId: teamDoc._id || "",
    status: teamDoc.isActive ? "Active" : "Inactive",
    college: teamDoc.college || "N/A",
    department: teamDoc.department || "N/A",
    year: teamDoc.year || "N/A",

    leader: leader
      ? {
          name: leader.name || "",
          rollNo: leader.rollNo || "",
          email: leader.email || "",
          phone: leader.phone || "",
        }
      : null,

    members: memberCards,

    problemStatement: {
      id: teamDoc.problemStatement?.ps_id || "N/A",
      title: teamDoc.problemStatement?.title || "N/A",
      category: teamDoc.problemStatement?.category || "N/A",
    },
  };
};

export const TeamProvider = ({ children }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      // 🔴 IMPORTANT: team context should use TEAM token only
      const token = localStorage.getItem("token"); // participant token

      if (!token) {
        setTeam(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/team/team`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json();

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to fetch team");
      }

      setTeam(mapBackendTeamToUI(payload.data));
    } catch (err) {
      console.error("TeamContext error:", err.message);
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
