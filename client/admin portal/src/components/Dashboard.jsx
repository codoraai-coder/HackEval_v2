import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  Calendar,
  Trophy,
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  FileText,
  Database,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("Never");
  const fileInputRef = useRef(null);

  // Active Round state
  const [activeRound, setActiveRound] = useState(null);
  const [roundBusy, setRoundBusy] = useState(false);

  // PPT Leaderboard widget state
  const [pptLeaders, setPptLeaders] = useState([]);
  const [pptLoading, setPptLoading] = useState(false);
  const [pptError, setPptError] = useState("");
  const [pptSearch, setPptSearch] = useState("");
  const [pptAppliedSearch, setPptAppliedSearch] = useState("");
  const [pptTopN, setPptTopN] = useState(5);
  const [pptShowAll, setPptShowAll] = useState(false);

  useEffect(() => {
    const fetchPPTLeaderboard = async () => {
      try {
        setPptLoading(true);
        setPptError("");
        const res = await fetch("http://localhost:8000/leaderboard/ppt");
        if (!res.ok) throw new Error("Failed to load PPT leaderboard");
        const data = await res.json();
        // Backend returns ApiResponse wrapper { status, data, message }.
        // Ensure we set an array (fall back to empty array).
        const entries = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setPptLeaders(entries);
      } catch (e) {
        setPptError(e.message || "Error loading leaderboard");
      } finally {
        setPptLoading(false);
      }
    };
    fetchPPTLeaderboard();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchActiveRound = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/round-state/active", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        setActiveRound((prev) => (prev !== data.round ? data.round : prev));
      } catch { }
    };

    // initial fetch
    fetchActiveRound();
    // poll every 5s
    intervalId = setInterval(fetchActiveRound, 5000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const setRound = async (round) => {
    try {
      setRoundBusy(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/round-state/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ round }),
      });
      if (!res.ok) throw new Error("Failed to set active round");
      const data = await res.json();
      setActiveRound(data.round);
    } catch (e) {
      // Optionally surface error UI later
    } finally {
      setRoundBusy(false);
    }
  };

  const safePpt = Array.isArray(pptLeaders) ? pptLeaders : [];

  const filteredPpt = safePpt
    .filter(
      (row) =>
        pptAppliedSearch === "" ||
        (row.team_name || "")
          .toLowerCase()
          .includes(pptAppliedSearch.toLowerCase()),
    )
    .sort((a, b) => (a.rank || 0) - (b.rank || 0));

  const displayedPpt = pptShowAll
    ? filteredPpt
    : filteredPpt.slice(0, Math.max(0, Number(pptTopN) || 0));

  const applyPptSearch = () => setPptAppliedSearch(pptSearch.trim());
  const clearPptSearch = () => {
    setPptSearch("");
    setPptAppliedSearch("");
  };

  const stats = [
    {
      title: "Total Teams",
      value: "24",
      change: "+3",
      changeType: "positive",
      icon: Users,
      color: "var(--primary-dark)",
    },
    {
      title: "Active Rounds",
      value: "3",
      change: "1 live",
      changeType: "info",
      icon: Calendar,
      color: "var(--info)",
    },
    {
      title: "Judges Assigned",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: UserCheck,
      color: "var(--success)",
    },
    {
      title: "Average Score",
      value: "8.5",
      change: "+0.3",
      changeType: "positive",
      icon: Trophy,
      color: "var(--warning)",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "round",
      message: "Round 2 submissions deadline extended by 2 hours",
      time: "2 hours ago",
      status: "info",
    },
    {
      id: 2,
      type: "judge",
      message: "Dr. Sarah Johnson assigned to Team Alpha",
      time: "4 hours ago",
      status: "success",
    },
    {
      id: 3,
      type: "score",
      message: "Team Beta received perfect score in Round 1",
      time: "6 hours ago",
      status: "success",
    },
    {
      id: 4,
      type: "mentor",
      message: "Mentor availability updated for tomorrow",
      time: "1 day ago",
      status: "info",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Round 2 Judging",
      time: "Today, 2:00 PM",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Final Presentations",
      time: "Tomorrow, 10:00 AM",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Award Ceremony",
      time: "Day after tomorrow, 4:00 PM",
      status: "upcoming",
    },
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const lowerName = file.name.toLowerCase();
      const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");
      if (isExcel) {
        setSelectedFile(file);
        setUploadStatus({ type: "info", message: `Selected: ${file.name}` });
        return;
      }
    }
    setUploadStatus({
      type: "error",
      message: "Please select a valid Excel (.xlsx or .xls) file",
    });
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: "error", message: "Please select a file first" });
      return;
    }

    setIsUploading(true);
    setUploadStatus({
      type: "info",
      message: "Uploading and updating database...",
    });

    try {
      const formData = new FormData();
      // Backend expects field name "file"
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload-ppt-report", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          type: "success",
          message: `Successfully updated! ${result.total_records} records processed.`,
        });
        setLastUpdate(new Date().toLocaleString());
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setUploadStatus({
          type: "error",
          message:
            result.detail || result.error || "Upload failed. Please try again.",
        });
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Network error. Please check your connection.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRefresh = () => {
    setUploadStatus(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="dashboard">
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here's what's happening with your hackathon.
          </p>
        </div>
        <div
          className="current-round"
          style={{
            background: "#E5F5EC",
            color: "#1B4332",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Current Round: {activeRound ? `Round ${activeRound}` : "None"}
        </div>
      </div>

      {/* PPT Report Update Section */}
      <div className="ppt-update-section">
        <div className="section-header">
          <h2 className="section-title">
            <FileText className="section-icon" />
            PPT Report Management
          </h2>
          <div className="last-update">Last updated: {lastUpdate}</div>
        </div>

        <div className="upload-container">
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="file-input"
              id="ppt-file-input"
            />
            <label htmlFor="ppt-file-input" className="file-input-label">
              <Upload className="upload-icon" />
              {selectedFile
                ? selectedFile.name
                : "Choose PPT Report Excel File"}
            </label>
          </div>

          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`upload-btn ${isUploading ? "uploading" : ""}`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="spinning" />
                  Updating Database...
                </>
              ) : (
                <>
                  <Database className="btn-icon" />
                  Update Database
                </>
              )}
            </button>

            <button
              onClick={handleRefresh}
              className="refresh-btn"
              title="Clear selection"
            >
              <RefreshCw className="btn-icon" />
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className={`status-message ${uploadStatus.type}`}>
            <div className="status-content">
              {uploadStatus.type === "success" && (
                <CheckCircle className="status-icon" />
              )}
              {uploadStatus.type === "error" && (
                <AlertCircle className="status-icon" />
              )}
              {uploadStatus.type === "info" && (
                <AlertCircle className="status-icon" />
              )}
              <span>{uploadStatus.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="stat-icon" style={{ color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Round Controls */}
      <div className="content-card" style={{ marginTop: "16px" }}>
        <div className="card-header">
          <h3 className="card-title">
            <Calendar className="card-icon" />
            Active Round Control
          </h3>
          <div style={{ fontWeight: 600 }}>
            Current: {activeRound ? `Round ${activeRound}` : "None"}
          </div>
        </div>
        <div className="card-content">
          <div className="action-buttons" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className={`btn ${activeRound === 1 ? "btn-success" : "btn-secondary"}`}
              disabled={roundBusy}
              onClick={() => setRound(1)}
            >
              Round 1 {activeRound === 1 ? "(Active)" : ""}
            </button>
            <button
              className={`btn ${activeRound === 2 ? "btn-success" : "btn-secondary"}`}
              disabled={roundBusy}
              onClick={() => setRound(2)}
            >
              Round 2 {activeRound === 2 ? "(Active)" : ""}
            </button>
            <button
              className={`btn ${activeRound === 3 ? "btn-success" : "btn-secondary"}`}
              disabled={roundBusy}
              onClick={() => setRound(3)}
            >
              Round 3 {activeRound === 3 ? "(Active)" : ""}
            </button>
            <button
              className="btn btn-warning"
              disabled={roundBusy}
              onClick={() => setRound(null)}
            >
              Clear Active
            </button>
          </div>
        </div>
      </div>

      {/* PPT Leaderboard (compact) */}
      <div className="content-card" style={{ marginTop: "16px" }}>
        <div className="card-header">
          <h3 className="card-title">
            <Trophy className="card-icon" />
            Top PPT Leaderboard
          </h3>
        </div>
        <div className="card-content">
          {/* Controls for widget */}
          <div
            className="filters"
            style={{
              background: "#F8FAFC",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <div className="filter-group">
              <label className="form-label">Search by Team Name</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter team name"
                  value={pptSearch}
                  onChange={(e) => setPptSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyPptSearch();
                  }}
                />
                <button className="btn btn-primary" onClick={applyPptSearch}>
                  Search
                </button>
                {pptAppliedSearch !== "" && (
                  <button
                    className="btn btn-secondary"
                    onClick={clearPptSearch}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="filter-group">
              <label className="form-label">Show Top N</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, filteredPpt.length || 1)}
                  value={pptTopN}
                  onChange={(e) => setPptTopN(Number(e.target.value))}
                  disabled={pptShowAll}
                />
                <span>{pptShowAll ? "All" : pptTopN}</span>
              </div>
            </div>
            <div className="filter-group">
              <label className="form-label">Display</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  id="ppt-toggle-show-all"
                  type="checkbox"
                  checked={pptShowAll}
                  onChange={(e) => setPptShowAll(e.target.checked)}
                />
                <label htmlFor="ppt-toggle-show-all">Show complete list</label>
              </div>
            </div>
          </div>
          {pptLoading && <div className="activity-item info">Loading...</div>}
          {pptError && <div className="activity-item error">{pptError}</div>}
          {!pptLoading && !pptError && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "64px" }}>Rank</th>
                    <th>Team</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPpt.map((row) => (
                    <tr key={`${row.teamName || row.team_name}-${row.rank}`}>
                      <td>
                        {row.rank <= 3 ? (
                          <span title={`Rank ${row.rank}`}>
                            <Trophy
                              size={16}
                              style={{
                                color:
                                  row.rank === 1
                                    ? "#FFD700"
                                    : row.rank === 2
                                      ? "#C0C0C0"
                                      : "#CD7F32",
                              }}
                            />
                          </span>
                        ) : (
                          <span>{row.rank}</span>
                        )}
                      </td>
                      <td>
                        <strong>{row.teamName || row.team_name}</strong>
                      </td>
                      <td style={{ textAlign: "right" }}>{row.total_score}</td>
                    </tr>
                  ))}
                  {displayedPpt.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ textAlign: "center", color: "var(--muted)" }}
                      >
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock className="card-icon" />
              Recent Activities
            </h3>
          </div>
          <div className="card-content">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className={`activity-item ${activity.status}`}
              >
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar className="card-icon" />
              Upcoming Events
            </h3>
          </div>
          <div className="card-content">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-title">{event.title}</div>
                <div className="event-time">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
