import React, { useEffect, useState, useContext } from "react";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { TeamContext } from "../context/TeamContext";
import { API_BASE_URL } from "../config";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { team } = useContext(TeamContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE_URL}/leaderboard/ppt`);
      const json = await res.json();
      setRows(Array.isArray(json.data) ? json.data : []);
      setLoading(false);
    };
    load();
  }, []);

  const isMyTeam = (name) =>
    team && (team.teamName === name || team.teamId === name);

  const rankIcon = (rank) => {
    if (rank === 1) return <Trophy />;
    if (rank === 2) return <Medal />;
    if (rank === 3) return <Award />;
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="lbp-container">
        <div className="lbp-loading">Loading leaderboard…</div>
      </div>
    );
  }

  return (
    <div className="lbp-container">
      {/* Header */}
      <div className="lbp-header">
        <h1 className="lbp-title">
          Leaderboard
          <span className="lbp-title-highlight" />
        </h1>
        <div className="lbp-badge">Scoring: 100 Points</div>
      </div>

      {/* Table */}
      <div className="lbp-card">
        <div className="lbp-row lbp-head">
          <div>Rank</div>
          <div>Team</div>
          <div>Innovation</div>
          <div>Technical</div>
          <div>Impact</div>
          <div>Total</div>
        </div>

        {rows.map((r) => (
          <div
            key={r.team_name}
            className={`lbp-row ${
              isMyTeam(r.team_name) ? "lbp-myteam" : ""
            }`}
          >
            <div className="lbp-rank">{rankIcon(r.rank)}</div>

            <div className="lbp-team">
              {r.team_name}
              {isMyTeam(r.team_name) && (
                <span className="lbp-you">
                  <Users size={12} /> Your Team
                </span>
              )}
            </div>

            <div>{r.innovation_uniqueness || 0}</div>
            <div>{r.technical_feasibility || 0}</div>
            <div>{r.potential_impact || 0}</div>

            <div className="lbp-total">{r.total_score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
