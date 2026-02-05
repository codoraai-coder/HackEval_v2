import React, { useEffect, useState } from "react";
import "./Leaderboard.css";
import { Trophy, Crown, Medal, Award } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("judgeToken");
        const res = await fetch(`${API_BASE_URL}/leaderboard/ppt`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch leaderboard");

        const data = await res.json();
        // Sort by total score descending
        const sorted = (data.data || []).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        setTeams(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} className="rank-icon gold" />;
    if (rank === 2) return <Medal size={20} className="rank-icon silver" />;
    if (rank === 3) return <Award size={20} className="rank-icon bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  return (
    <div className="leaderboard-container">
      {/* Hero Section */}
      <div className="leaderboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">Leaderboard</h1>
          <p className="hero-subtitle">Live team rankings</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="leaderboard-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="leaderboard-loading">
          <div className="spinner"></div>
          <p>Loading rankings...</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="col-rank">Rank</th>
                <th className="col-team">Team</th>
                {/* <th className="col-score">Total Score</th> */}
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={team._id}
                    className={`leaderboard-row ${rank <= 3 ? `top-${rank}` : ''}`}
                  >
                    <td className="col-rank">
                      <div className="rank-cell">
                        {getRankIcon(rank)}
                      </div>
                    </td>
                    <td className="col-team">
                      <div className="team-cell">
                        <span className="team-name">{team.team_name}</span>
                      </div>
                    </td>
                    
                  </tr>
                );
              })}
              {teams.length === 0 && (
                <tr>
                  <td colSpan="3" className="no-data">No teams found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
