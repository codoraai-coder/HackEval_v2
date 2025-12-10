import React, { useState, useEffect } from "react";
import { Search, Eye, Calendar, Star, Loader2 } from "lucide-react";
import {
  getMyEvaluations,
  debugApiConfig,
  testApiConnection,
  isAuthenticated
} from "../utils/api";
import "./MyEvaluations.css";

const MyEvaluations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const raw = await getMyEvaluations();
      const list = Array.isArray(raw) ? raw : raw.data || [];
      const transformed = list.map(doc => ({
        id: doc._id,
        teamName: doc.team_name,
        projectName: doc.problem_statement,
        category: doc.category,
        round: doc.round_id,
        scores: {
          solutionFit: doc.problem_solution_fit,
          features: doc.functionality_features,
          feasibility: doc.technical_feasibility,
          creativity: doc.innovation_creativity,
          ux: doc.user_experience,
          impact: doc.impact_value,
          presentation: doc.presentation_demo_quality,
          collaboration: doc.team_collaboration
        },
        totalScore: doc.total_score,
        averageScore: doc.average_score,
        feedback: doc.personalized_feedback,
        judgeName: doc.judge_name,
        status: doc.status,
        createdAt: new Date(doc.createdAt).toLocaleDateString(),
        updatedAt: new Date(doc.updatedAt).toLocaleDateString()
      }));
      setEvaluations(transformed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = ev => {
    setSelectedEvaluation(ev);
    setIsDetailsOpen(true);
  };
  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEvaluation(null);
  };

  const changeStatus = async (evId, newStatus) => {
  try {
    const updated = await updateEvaluationStatus(evId, newStatus);
    // Update local state array
    setEvaluations(prev =>
      prev.map(ev =>
        ev.id === evId
          ? { ...ev, status: updated.status, totalScore: updated.total_score }
          : ev
      )
    );
  } catch (err) {
    console.error("Failed to update status:", err);
  }
};

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Please login to view evaluations");
      setLoading(false);
      return;
    }
    debugApiConfig();
    testApiConnection().then(ok => {
      if (ok) fetchEvaluations();
      else {
        setError("Cannot connect to API");
        setLoading(false);
      }
    });
  }, []);

  const filtered = evaluations.filter(ev => {
    const searchMatch =
      ev.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "all" || ev.status === filterStatus;
    return searchMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="my-evaluations">
        <div className="loading-state">
          <Loader2 size={48} className="loading-spinner" />
          <p>Loading your evaluations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-evaluations">
        <div className="error-state">
          <p className="error-message">Error: {error}</p>
          <button className="btn-primary" onClick={fetchEvaluations}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-evaluations">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">My Evaluations</h1>
            <p className="page-subtitle">Review your completed evaluations</p>
          </div>
          <button
            className="btn-primary"
            onClick={fetchEvaluations}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="loading-spinner" />
            ) : null}
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="filters-section card">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by team name or project..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              className="filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>
      </div>

      <div className="evaluations-grid">
        {filtered.map(ev => (
          <div key={ev.id} className="evaluation-card card">
            <div className="evaluation-header">
              <div className="evaluation-meta">
                <h3>{ev.teamName}</h3>
                <p className="project-name">{ev.projectName}</p>
                <div className="evaluation-dates">
                  <span className="date-item">
                    <Calendar size={14} />
                    {ev.createdAt}
                  </span>
                  <span className="date-item">
                    <Calendar size={14} />
                    {ev.updatedAt}
                  </span>
                </div>
              </div>
              <div className="evaluation-score">
                <div
                  className={`score-badge score-${
                    ev.totalScore >= 6 ? (ev.totalScore >= 8 ? "success" : "warning") : "error"
                  }`}
                >
                  <Star size={16} />
                  {ev.totalScore}
                </div>
                <div
                  className={`status-badge status-${
                    ev.status === "submitted"
                      ? "success"
                      : ev.status === "draft"
                      ? "warning"
                      : "info"
                  }`}
                >
                  {ev.status}
                </div>
              </div>
            </div>
            <div className="evaluation-content">
              <div className="recommendation">
                <strong>Feedback:</strong> {ev.feedback}
              </div>
            </div>
            <div className="evaluation-actions">
              <button className="btn-primary" onClick={() => openDetails(ev)}>
                <Eye size={16} /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <h3>No evaluations found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {isDetailsOpen && selectedEvaluation && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvaluation.teamName} Details</h2>
              <button className="modal-close" onClick={closeDetails}>
                ×
              </button>
            </div>
            <div className="metadata-content">
              <div className="metadata-item">
                <h3>Problem–Solution Fit</h3>
                <p>{selectedEvaluation.scores.solutionFit}</p>
              </div>
              <div className="metadata-item">
                <h3>Features</h3>
                <p>{selectedEvaluation.scores.features}</p>
              </div>
              <div className="metadata-item">
                <h3>Feasibility</h3>
                <p>{selectedEvaluation.scores.feasibility}</p>
              </div>
              <div className="metadata-item">
                <h3>Creativity</h3>
                <p>{selectedEvaluation.scores.creativity}</p>
              </div>
              <div className="metadata-item">
                <h3>User Experience</h3>
                <p>{selectedEvaluation.scores.ux}</p>
              </div>
              <div className="metadata-item">
                <h3>Impact</h3>
                <p>{selectedEvaluation.scores.impact}</p>
              </div>
              <div className="metadata-item">
                <h3>Presentation</h3>
                <p>{selectedEvaluation.scores.presentation}</p>
              </div>
              <div className="metadata-item">
                <h3>Collaboration</h3>
                <p>{selectedEvaluation.scores.collaboration}</p>
              </div>
              <div className="metadata-item">
                <h3>Feedback</h3>
                <p className="abstract">{selectedEvaluation.feedback}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvaluations;
