import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  Play,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [judgeName, setJudgeName] = useState("Judge");
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [activeRound, setActiveRound] = useState(null);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [judgeId, setJudgeId] = useState(null);


  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  // Live clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getAuthToken = () => localStorage.getItem("judgeToken");

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);

    try {
      const token = getAuthToken();
      if (!token) return;

      // Parallel fetch
      const [profileRes, teamsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/judge/current`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/judge/evaluation/teams`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setJudgeName(data.data?.name || data.data?.username || "Judge");
        setJudgeId(data.data?._id);
      }

      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.data || []);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      if (showLoading) setIsRefreshing(false);
      setTeamsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false); // Initial load without spinner on button
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  useEffect(() => {
    const evaluated = teams.filter(
      (t) => t.evaluationStatus === "completed"
    ).length;
    const pending = teams.filter(
      (t) =>
        t.evaluationStatus === "assigned" ||
        t.evaluationStatus === "in-progress"
    ).length;
    setEvaluatedCount(evaluated);
    setPendingCount(pending);
  }, [teams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTeams =
  
  teams.filter((team) => {
    const isAssignedToJudge =
    !judgeId || team.assignedJudge?._id === judgeId;
    const matchesSearch =
      team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    // Check various possible locations for category data
    const teamCategory = team.problemStatement?.category || team.category || "General";
    const matchesCategory = selectedCategory === "All" || teamCategory === selectedCategory;

    return isAssignedToJudge && matchesSearch && matchesCategory;
  });

  const handleTeamSelect = (team) => {
    navigate("/evaluate", { state: { selectedTeam: team } });
  };

  return (
    <div className="dashboard">
      {/* Hero Section with Clock */}
      <div className="dashboard-hero">
        <div className="hero-left">
          <h1 className="hero-title">Welcome back, {judgeName}</h1>
          <p className="hero-subtitle">Here's your evaluation overview.</p>
          <div className="hero-actions">
            <button
              className="btn btn-secondary refresh-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? "spin" : ""} />
              <span className="btn-text">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
            <div className="current-round-badge">
              Round: {activeRound || "1"}
            </div>
          </div>
        </div>

        <div className="hero-clock">
          <div className="clock-label">CURRENT TIME</div>
          <div className="clock-time">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="clock-date">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Teams</div>
          <div className="stat-value">{teams.length}</div>
          <div className="stat-icon">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Evaluated</div>
          <div className="stat-value">{evaluatedCount}</div>
          <div className="stat-icon">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Pending Review</div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-icon">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Assigned Teams</h2>

          <div className="section-controls">
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Blockchain">Blockchain</option>
              <option value="Cloud">Cloud</option>
              <option value="IoT">IoT</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Social Impact">Social Impact</option>
              <option value="Other">Other</option>
            </select>

            <div className="dashboard-search-area" ref={searchRef}>
              <button
                className="search-icon-btn"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={18} />
              </button>

              {showSearch && (
                <div className="floating-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {teamsLoading ? (
          <div className="loading">Loading teams...</div>
        ) : (
          <div className="teams-list">
            {filteredTeams.map((team) => (
              <div key={team._id} className="team-item">
                <h4>{team.teamName}</h4>
                <div className="team-details">
                  <p className="detail-row">
                    <span className="detail-label">Project:</span>
                    <span className="detail-value">{team.projectTitle || "Not specified"}</span>
                  </p>
                  <p className="detail-row">
                    <span className="detail-label">Members:</span>
                    <span className="detail-value">{team.members?.length || 0}</span>
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleTeamSelect(team)}
                >
                  <Play size={14} />
                  Evaluate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
