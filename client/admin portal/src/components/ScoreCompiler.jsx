import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Download, 
  Search, 
  Eye, 
  CheckCircle,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const ScoreCompiler = () => {
  const [selectedRound, setSelectedRound] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rounds = ['all', 'Round 1', 'Round 2', 'Round 3'];
  const categories = ['all', 'AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Blockchain'];

  // Fetch teams and evaluations from the database (no static/mock data)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const adminAuthHeaders = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken') || ""}`
        };

        // Teams fetch
        const teamsResp = await fetch(`${API_BASE_URL}/admin/evaluation/all-teams`, {
          headers: adminAuthHeaders
        });
        if (!teamsResp.ok) throw new Error("Failed to fetch teams");
        const teamsJson = await teamsResp.json();
        setTeams(teamsJson.data || []);

        // Evaluations fetch
        const evalsResp = await fetch(`${API_BASE_URL}/admin/evaluation/all-evaluations`, {
          headers: adminAuthHeaders
        });
        if (!evalsResp.ok) throw new Error("Failed to fetch evaluations");
        const evalsJson = await evalsResp.json();
        setEvaluations(evalsJson.data || []);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Properly join team + evaluation data
  const getTeamWithEvaluation = (team) => {
    const evaluationData = evaluations.find(e =>
      String(e.team_id?._id || e.team_id) === String(team._id)
    );

    if (!evaluationData) {
      return {
        id: team._id,
        name: team.teamName || team.name,
        category: team.category,
        round: `Round ${team.currentRound || 1}`,
        judge: team.assignedJudge?.name || 'Unassigned',
        scores: {
          problem_solution_fit: 0,
          functionality_features: 0,
          technical_feasibility: 0,
          innovation_creativity: 0,
          user_experience: 0,
          impact_value: 0,
          presentation_demo_quality: 0,
          team_collaboration: 0
        },
        totalScore: 0,
        averageScore: 0,
        qualified: false,
        feedback: 'No evaluation yet',
        evaluationStatus: team.evaluationStatus || 'unassigned'
      };
    }
    return {
      id: team._id,
      name: team.teamName || team.name,
      category: team.category,
      round: `Round ${evaluationData.round_id || 1}`,
      judge: evaluationData.judge_name || team.assignedJudge?.name || 'Unknown Judge',
      scores: {
        problem_solution_fit: evaluationData.problem_solution_fit,
        functionality_features: evaluationData.functionality_features,
        technical_feasibility: evaluationData.technical_feasibility,
        innovation_creativity: evaluationData.innovation_creativity,
        user_experience: evaluationData.user_experience,
        impact_value: evaluationData.impact_value,
        presentation_demo_quality: evaluationData.presentation_demo_quality,
        team_collaboration: evaluationData.team_collaboration
      },
      totalScore: evaluationData.total_score,
      averageScore: evaluationData.average_score,
      qualified: evaluationData.average_score >= 6,
      feedback: evaluationData.personalized_feedback,
      evaluationStatus: 'completed'
    };
  };

  const teamEvaluations = teams.map(team => getTeamWithEvaluation(team));

  const filteredTeams = teamEvaluations.filter(team => {
    const matchesRound = selectedRound === 'all' || team.round === selectedRound;
    const matchesCategory = selectedCategory === 'all' || team.category === selectedCategory;
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRound && matchesCategory && matchesSearch;
  });

  const getQualificationBadge = (qualified) => {
    return qualified ? 
      <span className="badge badge-success">Qualified</span> : 
      <span className="badge badge-error">Not Qualified</span>;
  };

  const getEvaluationStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'assigned':
        return <span className="badge badge-warning">Assigned</span>;
      default:
        return <span className="badge badge-error">Unassigned</span>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'var(--success)';
    if (score >= 6) return 'var(--warning)';
    return 'var(--error)';
  };

  const handleViewScorecard = (team) => {
    setSelectedTeam(team);
    setShowScorecardModal(true);
  };

  const handleExportScores = () => {
    console.log('Exporting scores...');
    // Implement export functionality
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  const calculateStats = () => {
    const completedEvaluations = teamEvaluations.filter(t => t.evaluationStatus === 'completed');
    const qualifiedTeams = completedEvaluations.filter(t => t.qualified);
    const avgScore = completedEvaluations.length > 0 
      ? completedEvaluations.reduce((sum, t) => sum + t.averageScore, 0) / completedEvaluations.length 
      : 0;
    const scores = completedEvaluations.map(t => t.averageScore);
    return {
      totalTeams: teams.length,
      evaluatedTeams: completedEvaluations.length,
      qualifiedTeams: qualifiedTeams.length,
      averageScore: avgScore.toFixed(2),
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="score-compiler">
        <div className="page-header">
          <h1 className="page-title">Score Compiler</h1>
          <p className="page-subtitle">View and manage team scorecards and evaluations</p>
        </div>
        <div className="loading-container">
          <RefreshCw size={32} className="spinner" />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="score-compiler">
        <div className="page-header">
          <h1 className="page-title">Score Compiler</h1>
          <p className="page-subtitle">View and manage team scorecards and evaluations</p>
        </div>
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button className="btn btn-primary" onClick={handleRefreshData}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="score-compiler">
      <div className="page-header">
        <h1 className="page-title">Score Compiler</h1>
        <p className="page-subtitle">View and manage team scorecards and evaluations</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--primary-dark)20', color: 'var(--primary-dark)' }}>
                <Calculator size={24} />
              </div>
              <h3>Total Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.totalTeams}</span>
              <span className="change">Registered</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--info)20', color: 'var(--info)' }}>
                <CheckCircle size={24} />
              </div>
              <h3>Evaluated Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.evaluatedTeams}</span>
              <span className="change">/{stats.totalTeams}</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--success)20', color: 'var(--success)' }}>
                <TrendingUp size={24} />
              </div>
              <h3>Qualified Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.qualifiedTeams}</span>
              <span className="change">/{stats.evaluatedTeams}</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--warning)20', color: 'var(--warning)' }}>
                <BarChart3 size={24} />
              </div>
              <h3>Average Score</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.averageScore}</span>
              <span className="change">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="action-bar">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Round</label>
            <select 
              className="form-select"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              {rounds.map(round => (
                <option key={round} value={round}>
                  {round === 'all' ? 'All Rounds' : round}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Category</label>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Search</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleRefreshData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExportScores}>
            <Download size={16} /> Export Scores
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3>Team Scorecards</h3>
          <span className="subtitle">{filteredTeams.length} teams found</span>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Category</th>
                  <th>Round</th>
                  <th>Judge</th>
                  <th>Problem-Solution Fit</th>
                  <th>Functionality</th>
                  <th>Technical Feasibility</th>
                  <th>Innovation</th>
                  <th>Average</th>
                  <th>Status</th>
                  <th>Evaluation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td><strong>{team.name}</strong></td>
                    <td><span className="category-badge">{team.category}</span></td>
                    <td>{team.round}</td>
                    <td>{team.judge}</td>
                    <td style={{ color: getScoreColor(team.scores.problem_solution_fit) }}>
                      {team.scores.problem_solution_fit}/10
                    </td>
                    <td style={{ color: getScoreColor(team.scores.functionality_features) }}>
                      {team.scores.functionality_features}/10
                    </td>
                    <td style={{ color: getScoreColor(team.scores.technical_feasibility) }}>
                      {team.scores.technical_feasibility}/10
                    </td>
                    <td style={{ color: getScoreColor(team.scores.innovation_creativity) }}>
                      {team.scores.innovation_creativity}/10
                    </td>
                    <td><strong style={{ color: getScoreColor(team.averageScore) }}>{team.averageScore}/10</strong></td>
                    <td>{getQualificationBadge(team.qualified)}</td>
                    <td>{getEvaluationStatusBadge(team.evaluationStatus)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleViewScorecard(team)}
                          disabled={team.evaluationStatus !== 'completed'}
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTeams.length === 0 && (
              <div className="empty-state">
                <p>No teams found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scorecard Modal */}
      {showScorecardModal && (
        <ScorecardModal
          team={selectedTeam}
          onClose={() => setShowScorecardModal(false)}
        />
      )}
    </div>
  );
};


// Modal Component
const ScorecardModal = ({ team, onClose }) => {
  const scoreCategories = [
    { key: 'problem_solution_fit', label: 'Problem-Solution Fit', description: 'How well the solution addresses the problem' },
    { key: 'functionality_features', label: 'Functionality & Features', description: 'Completeness and effectiveness of features' },
    { key: 'technical_feasibility', label: 'Technical Feasibility', description: 'Technical implementation and complexity' },
    { key: 'innovation_creativity', label: 'Innovation & Creativity', description: 'Originality and creative thinking' },
    { key: 'user_experience', label: 'User Experience', description: 'Usability and interface design' },
    { key: 'impact_value', label: 'Impact & Value', description: 'Potential impact and value proposition' },
    { key: 'presentation_demo_quality', label: 'Presentation Quality', description: 'Quality of demonstration and presentation' },
    { key: 'team_collaboration', label: 'Team Collaboration', description: 'Teamwork and collaboration effectiveness' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Scorecard - {team?.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="scorecard-header">
            <div className="team-details">
              <h3>{team?.name}</h3>
              <p><strong>Category:</strong> {team?.category}</p>
              <p><strong>Round:</strong> {team?.round}</p>
              <p><strong>Judge:</strong> {team?.judge}</p>
            </div>
            <div className="score-summary">
              <div className="final-score">
                <span className="score-label">Final Score</span>
                <span className="score-value">{team?.averageScore}/10</span>
              </div>
              <div className="qualification-status">
                {team?.qualified ? 
                  <span className="badge badge-success">Qualified</span> : 
                  <span className="badge badge-error">Not Qualified</span>
                }
              </div>
            </div>
          </div>

          <div className="score-breakdown">
            <h4>Score Breakdown</h4>
            <div className="score-categories">
              {scoreCategories.map((category) => (
                <div key={category.key} className="score-category">
                  <div className="category-header">
                    <h5>{category.label}</h5>
                    <span className="category-score">{team?.scores[category.key]}/10</span>
                  </div>
                  <p className="category-description">{category.description}</p>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ 
                        width: `${(team?.scores[category.key] / 10) * 100}%`,
                        backgroundColor: team?.scores[category.key] >= 8 ? 'var(--success)' : 
                                        team?.scores[category.key] >= 6 ? 'var(--warning)' : 'var(--error)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="judge-feedback">
            <h4>Judge Feedback</h4>
            <div className="feedback-content">
              <p>{team?.feedback}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            <Download size={16} />
            Export Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreCompiler;
