import React, { useEffect, useState } from "react";
import {
  Trophy,
  TrendingUp,
  Eye,
  Globe,
  Download,
  Filter,
  BarChart3,
  Award,
  Star,
  Users,
  Calendar,
  Search,
  Upload,
} from "lucide-react";

const Leaderboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRound, setSelectedRound] = useState("all");
  const [viewMode, setViewMode] = useState("overall"); // 'overall', 'category'
  const [isPublished, setIsPublished] = useState(false);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [topN, setTopN] = useState(10);
  const [showAll, setShowAll] = useState(true);

  // File upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:8000/leaderboard/ppt");
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const data = await res.json();
      // Normalize into UI structure - preserve the rank from backend
      const mapped = data.map((item) => ({
        id: item.team_name,
        name: item.team_name,
        category: item.category || "N/A",
        round: "PPT",
        totalScore: item.total_score,
        averageScore: Number(item.total_score) / 4,
        rank: item.rank, // Use rank directly from the Excel/database
        previousRank: item.rank, // Since we're using fixed ranks, there's no change
        qualified: item.total_score >= 70, // Just an example threshold
        members: [],
        project: "",
        // Additional scoring details
        innovationScore: item.innovation_uniqueness,
        technicalScore: item.technical_feasibility,
        impactScore: item.potential_impact,
        fileName: item.file_name || "",
      }));
      setTeams(mapped);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "all",
    "AI/ML",
    "Web Development",
    "Mobile App",
    "IoT",
    "Blockchain",
  ];
  const rounds = ["all", "Round 1", "Round 2", "Round 3"];

  const filteredTeams = teams
    .filter((team) => {
      const matchesCategory =
        selectedCategory === "all" || team.category === selectedCategory;
      const matchesRound =
        selectedRound === "all" || team.round === selectedRound;
      const matchesSearch =
        appliedSearch === "" ||
        (team.name || "").toLowerCase().includes(appliedSearch.toLowerCase());
      return matchesCategory && matchesRound && matchesSearch;
    })
    .sort((a, b) => a.rank - b.rank); // Sort by rank from Excel

  const displayedTeams = showAll
    ? filteredTeams
    : filteredTeams.slice(0, Math.max(0, Number(topN) || 0));

  const handleApplySearch = () => {
    setAppliedSearch(searchName.trim());
  };

  const handleClearSearch = () => {
    setSearchName("");
    setAppliedSearch("");
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} style={{ color: "#FFD700" }} />;
      case 2:
        return <Award size={20} style={{ color: "#C0C0C0" }} />;
      case 3:
        return <Award size={20} style={{ color: "#CD7F32" }} />;
      default:
        return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankChange = (currentRank, previousRank) => {
    if (currentRank < previousRank) {
      return (
        <span className="rank-change positive">
          ↑ {previousRank - currentRank}
        </span>
      );
    } else if (currentRank > previousRank) {
      return (
        <span className="rank-change negative">
          ↓ {currentRank - previousRank}
        </span>
      );
    } else {
      return <span className="rank-change neutral">-</span>;
    }
  };

  const handlePublishLeaderboard = () => {
    setIsPublished(true);
    // Publish functionality would be implemented here
    console.log("Publishing leaderboard...");
  };

  const handleExportLeaderboard = () => {
    // Export functionality would be implemented here
    console.log("Exporting leaderboard...");
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    // Check if file is Excel
    if (
      !uploadFile.name.endsWith(".xls") &&
      !uploadFile.name.endsWith(".xlsx")
    ) {
      setUploadError("Please select an Excel file (.xls or .xlsx)");
      return;
    }

    setUploadLoading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const res = await fetch(
        "http://localhost:8000/leaderboard/upload-ppt-scores",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await res.json();
      setUploadSuccess(`Successfully uploaded scores: ${data.message}`);

      // Refresh leaderboard data
      await fetchLeaderboard();
    } catch (error) {
      setUploadError(error.message || "Failed to upload scores");
    } finally {
      setUploadLoading(false);
    }
  };

  const calculateStats = () => {
    const qualifiedTeams = teams.filter((t) => t.qualified);
    const avgScore =
      teams.length > 0
        ? teams.reduce((sum, t) => sum + t.averageScore, 0) / teams.length
        : 0;

    return {
      totalTeams: teams.length,
      qualifiedTeams: qualifiedTeams.length,
      averageScore: avgScore.toFixed(2),
      topScore:
        teams.length > 0 ? Math.max(...teams.map((t) => t.averageScore)) : 0,
      categoryCount: new Set(teams.map((t) => t.category)).size,
    };
  };

  const stats = calculateStats();

  return (
    <div className="leaderboard">
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">Generate and manage hackathon rankings</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div
                className="card-icon"
                style={{
                  backgroundColor: "var(--primary-dark)20",
                  color: "var(--primary-dark)",
                }}
              >
                <Trophy size={24} />
              </div>
              <h3>Total Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.totalTeams}</span>
              <span className="change">Ranked</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div
                className="card-icon"
                style={{
                  backgroundColor: "var(--success)20",
                  color: "var(--success)",
                }}
              >
                <Star size={24} />
              </div>
              <h3>Qualified Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.qualifiedTeams}</span>
              <span className="change positive">+{stats.qualifiedTeams}</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div
                className="card-icon"
                style={{
                  backgroundColor: "var(--info)20",
                  color: "var(--info)",
                }}
              >
                <TrendingUp size={24} />
              </div>
              <h3>Average Score</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.averageScore}</span>
              <span className="change">/10</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div
                className="card-icon"
                style={{
                  backgroundColor: "var(--warning)20",
                  color: "var(--warning)",
                }}
              >
                <Users size={24} />
              </div>
              <h3>Categories</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.categoryCount}</span>
              <span className="change">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Upload PPT Scores</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleFileUpload}>
            <div
              className="upload-container"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <div className="file-input-container" style={{ flex: 1 }}>
                <input
                  type="file"
                  id="excel-upload"
                  className="form-input"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  accept=".xls,.xlsx"
                />
                <p className="text-muted mt-2" style={{ fontSize: "0.9rem" }}>
                  Upload Excel file with columns: Rank, Team Name, Weighted
                  Total, Innovation & Uniqueness, Technical Feasibility,
                  Potential Impact, File Name
                </p>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploadLoading || !uploadFile}
              >
                {uploadLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Scores
                  </>
                )}
              </button>
            </div>

            {uploadError && (
              <div className="alert alert-danger mt-3" role="alert">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="alert alert-success mt-3" role="alert">
                {uploadSuccess}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Controls and Actions */}
      <div className="action-bar">
        <div className="view-controls">
          <button
            className={`btn ${viewMode === "overall" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setViewMode("overall")}
          >
            <BarChart3 size={16} />
            Overall Rankings
          </button>
          <button
            className={`btn ${viewMode === "category" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setViewMode("category")}
          >
            <Filter size={16} />
            Category-wise
          </button>
        </div>

        <div
          className="filters"
          style={{
            background: "#F8FAFC",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{ fontWeight: 600, color: "#111827", marginBottom: "4px" }}
          >
            Filters
          </div>
          <div className="filter-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Round</label>
            <select
              className="form-select"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              {rounds.map((round) => (
                <option key={round} value={round}>
                  {round === "all" ? "All Rounds" : round}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Search by Team Name</label>
            <div className="input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Enter team name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplySearch();
                }}
              />
              <button className="btn btn-primary" onClick={handleApplySearch}>
                <Search size={16} />
                Search
              </button>
              {appliedSearch !== "" && (
                <button
                  className="btn btn-secondary"
                  onClick={handleClearSearch}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label className="form-label">Show Top N</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="range"
                min="1"
                max={Math.max(1, filteredTeams.length || 1)}
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                disabled={showAll}
              />
              <span>{showAll ? "All" : topN}</span>
            </div>
          </div>

          <div className="filter-group">
            <label className="form-label">Display</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                id="toggle-show-all"
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              <label htmlFor="toggle-show-all">Show complete list</label>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={handleExportLeaderboard}
          >
            <Download size={16} />
            Export
          </button>
          <button
            className={`btn ${isPublished ? "btn-success" : "btn-primary"}`}
            onClick={handlePublishLeaderboard}
            disabled={isPublished}
          >
            <Globe size={16} />
            {isPublished ? "Published" : "Publish"}
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card">
        <div className="card-header">
          <h3>
            {viewMode === "overall"
              ? "Overall Leaderboard"
              : "Category-wise Rankings"}
            {isPublished && <span className="published-badge">Published</span>}
          </h3>
        </div>
        <div className="card-body">
          {loading && <div className="info">Loading...</div>}
          {error && <div className="error">{error}</div>}
          <div className="table-container">
            <table className="table leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Category</th>
                  <th>Innovation</th>
                  <th>Feasibility</th>
                  <th>Impact</th>
                  <th>Total Score</th>
                  <th>File</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTeams.length > 0 ? (
                  displayedTeams.map((team) => (
                    <tr
                      key={team.id}
                      className={team.rank <= 3 ? "top-team" : ""}
                    >
                      <td>
                        <div className="rank-cell">
                          {getRankIcon(team.rank)}
                          {/* No rank change display since ranks are fixed from Excel */}
                        </div>
                      </td>
                      <td>
                        <div className="team-info">
                          <strong>{team.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{team.category}</span>
                      </td>
                      <td>
                        <span className="criteria-score">
                          {team.innovationScore}/10
                        </span>
                      </td>
                      <td>
                        <span className="criteria-score">
                          {team.technicalScore}/10
                        </span>
                      </td>
                      <td>
                        <span className="criteria-score">
                          {team.impactScore}/10
                        </span>
                      </td>
                      <td>
                        <span className="total-score">{team.totalScore}</span>
                      </td>
                      <td>
                        <span className="file-name" title={team.fileName}>
                          {team.fileName
                            ? team.fileName.substring(0, 15) + "..."
                            : "N/A"}
                        </span>
                      </td>
                      <td>
                        {team.qualified ? (
                          <span className="badge badge-success">Qualified</span>
                        ) : (
                          <span className="badge badge-error">
                            Not Qualified
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm">
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No teams found matching the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category-wise Rankings */}
      {viewMode === "category" && (
        <div className="category-rankings">
          {categories
            .filter((cat) => cat !== "all")
            .map((category) => {
              const categoryTeams = teams.filter(
                (team) => team.category === category,
              );
              if (categoryTeams.length === 0) return null;

              return (
                <div key={category} className="card">
                  <div className="card-header">
                    <h3>{category} Rankings</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>Project</th>
                            <th>Average Score</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryTeams
                            .sort((a, b) => b.averageScore - a.averageScore)
                            .map((team, index) => (
                              <tr key={team.id}>
                                <td>
                                  <div className="rank-cell">
                                    {getRankIcon(index + 1)}
                                  </div>
                                </td>
                                <td>
                                  <strong>{team.name}</strong>
                                </td>
                                <td>{team.project}</td>
                                <td>
                                  <span className="average-score">
                                    {team.averageScore.toFixed(2)}/10
                                  </span>
                                </td>
                                <td>
                                  {team.qualified ? (
                                    <span className="badge badge-success">
                                      Qualified
                                    </span>
                                  ) : (
                                    <span className="badge badge-error">
                                      Not Qualified
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
