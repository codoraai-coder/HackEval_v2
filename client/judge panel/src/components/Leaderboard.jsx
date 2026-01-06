import React, { useState, useEffect, useContext } from "react";
import { Search, Trophy, Medal, Award, TrendingUp, Users, Target } from "lucide-react";
import { TeamContext } from "../context/TeamContext";
import { API_BASE_URL } from "../config";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { team } = useContext(TeamContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/leaderboard/ppt`);
        if (!response.ok) throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        const data = await response.json();

        const sorted = [...data].sort((a, b) => {
          const ra = Number.parseInt(a?.rank, 10);
          const rb = Number.parseInt(b?.rank, 10);
          return (Number.isFinite(ra) ? ra : Number.POSITIVE_INFINITY) - (Number.isFinite(rb) ? rb : Number.POSITIVE_INFINITY);
        });

        setLeaderboardData(sorted);
      } catch (err) {
        setError(err.message || "Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const isCurrentTeam = (teamName) =>
    team && (team.teamName === teamName || team.teamId === teamName);

  const getRankBadge = (rank) => {
    const r = parseInt(rank, 10);
    switch (r) {
      case 1:
        return (
          <div className="rank-badge gold">
            <Trophy className="w-5 h-5" />
            <span>1st</span>
          </div>
        );
      case 2:
        return (
          <div className="rank-badge silver">
            <Medal className="w-5 h-5" />
            <span>2nd</span>
          </div>
        );
      case 3:
        return (
          <div className="rank-badge bronze">
            <Award className="w-5 h-5" />
            <span>3rd</span>
          </div>
        );
      default:
        return <div className="rank-number">{Number.isFinite(r) ? r : "-"}</div>;
    }
  };

  const filteredData = leaderboardData.filter((e) =>
    (e.team_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasData = leaderboardData.length > 0;
  const avgScore = hasData
    ? (leaderboardData.reduce((s, t) => s + (Number(t.total_score) || 0), 0) / leaderboardData.length).toFixed(1)
    : "0.0";
  const highScore = hasData ? Math.max(...leaderboardData.map((t) => Number(t.total_score) || 0)) : 0;

  const currentTeamEntry = team
    ? leaderboardData.find((e) => isCurrentTeam(e.team_name))
    : null;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-wrapper">
        <div className="background-elements">
          <div className="bg-element bg-element-1" />
          <div className="bg-element bg-element-2" />
        </div>

        <div className="leaderboard-container">
          <div className="header-section">
            <div className="live-badge">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span className="live-text">Live Rankings</span>
            </div>
            <h1 className="main-title">Hackathon Leaderboard</h1>
            <p className="subtitle">Current standings based on PPT evaluation round</p>
          </div>

          <div className="search-container">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading leaderboard data...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && leaderboardData.length === 0 && (
            <div className="no-data-message">
              <p>No leaderboard data available yet. Check back later!</p>
            </div>
          )}

          {!loading && !error && leaderboardData.length > 0 && (
            <div className="lb-main-content">
              <div className="table-section">
                <div className="lb-table-container">
                  {/* Sticky header */}
                  <div className="lb-table-header">
                    <div className="header-grid">
                      <div className="header-cell rank-header">Rank</div>
                      <div className="header-cell team-header">Team</div>
                      <div className="header-cell score-header">Innovation</div>
                      <div className="header-cell score-header">Technical</div>
                      <div className="header-cell score-header">Impact</div>
                      <div className="header-cell total-header">Total</div>
                    </div>
                  </div>

                  {/* Scrollable viewport with rows */}
                  <div className="lb-table-scroll">
                    <div className="lb-table-body">
                      {filteredData.length > 0 ? (
                        filteredData.map((entry, index) => (
                          <div
                            key={entry.team_name}
                            className={`table-row ${
                              isCurrentTeam(entry.team_name) ? "current-team-row" : ""
                            } ${index < 3 ? "top-three" : ""}`}
                          >
                            <div className="row-grid">
                              <div className="cell rank-cell">{getRankBadge(entry.rank)}</div>

                              <div className="cell team-cell">
                                <div className="team-info">
                                  <span className="team-name">{entry.team_name}</span>
                                  {isCurrentTeam(entry.team_name) && (
                                    <span className="your-team-badge">
                                      <Users className="w-3 h-3" />
                                      Your Team
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="cell score-cell">
                                <div className="score-wrapper">
                                  <div className="score-info">
                                    <span className="score-value">
                                      {(entry.innovation_uniqueness || 0)}/10
                                    </span>
                                  </div>
                                  <div className="progress-bar">
                                    <div
                                      className="progress-fill innovation-fill"
                                      style={{
                                        width: `${((entry.innovation_uniqueness || 0) / 10) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="cell score-cell">
                                <div className="score-wrapper">
                                  <div className="score-info">
                                    <span className="score-value">
                                      {(entry.technical_feasibility || 0)}/10
                                    </span>
                                  </div>
                                  <div className="progress-bar">
                                    <div
                                      className="progress-fill technical-fill"
                                      style={{
                                        width: `${((entry.technical_feasibility || 0) / 10) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="cell score-cell">
                                <div className="score-wrapper">
                                  <div className="score-info">
                                    <span className="score-value">
                                      {(entry.potential_impact || 0)}/10
                                    </span>
                                  </div>
                                  <div className="progress-bar">
                                    <div
                                      className="progress-fill impact-fill"
                                      style={{
                                        width: `${((entry.potential_impact || 0) / 10) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="cell total-cell">
                                <div className="total-score-wrapper">
                                  <span className="total-score">{entry.total_score}</span>
                                  <div className="total-max">/30</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-results">
                          <div className="no-results-text">No teams found matching your search</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <div className="criteria-card">
                  <h3 className="criteria-title">
                    <Target className="w-5 h-5 text-blue-600" />
                    Evaluation Criteria
                  </h3>

                  <div className="criteria-list">
                    <div className="criteria-item">
                      <div className="criteria-indicator innovation-indicator" />
                      <div className="criteria-content">
                        <div className="criteria-name">Innovation &amp; Uniqueness</div>
                        <div className="criteria-description">
                          Originality and how it stands out from existing solutions
                        </div>
                      </div>
                    </div>

                    <div className="criteria-item">
                      <div className="criteria-indicator technical-indicator" />
                      <div className="criteria-content">
                        <div className="criteria-name">Technical Feasibility</div>
                        <div className="criteria-description">
                          Realism and soundness of the implementation
                        </div>
                      </div>
                    </div>

                    <div className="criteria-item">
                      <div className="criteria-indicator impact-indicator" />
                      <div className="criteria-content">
                        <div className="criteria-name">Potential Impact</div>
                        <div className="criteria-description">
                          Reach and positive effect if implemented
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {currentTeamEntry && (
                  <div className="team-status-card">
                    <h3 className="team-status-title">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Your Performance
                    </h3>

                    <div className="team-rank-display">
                      <div className="current-rank">#{currentTeamEntry.rank}</div>
                      <div className="rank-context">out of {leaderboardData.length} teams</div>
                    </div>
                  </div>
                )}

                <div className="stats-card">
                  <h3 className="stats-title">Competition Stats</h3>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Total Teams</span>
                      <span className="stat-value">{leaderboardData.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Score</span>
                      <span className="stat-value">{avgScore}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Highest Score</span>
                      <span className="stat-value">{highScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="lb-bottom-spacer" />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
