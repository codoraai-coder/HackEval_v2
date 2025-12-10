import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Filter, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const JudgeAssignment = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch teams and judges from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const [teamsResponse, judgesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/evaluation/teams`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/admin/evaluation`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ]);
      
      if (teamsResponse.status === 401 || judgesResponse.status === 401) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      if (!teamsResponse.ok) {
        throw new Error('Failed to fetch teams');
      }
      
      if (!judgesResponse.ok) {
        throw new Error('Failed to fetch judges');
      }
      
      const teamsData = await teamsResponse.json();
      const judgesData = await judgesResponse.json();
      
      setTeams(teamsData.data || []);
      setJudges(judgesData.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (message, type = 'error') => {
    if (type === 'error') {
      setError(message);
    } else {
      setSuccess(message);
    }
    
    setTimeout(() => {
      if (type === 'error') {
        setError(null);
      } else {
        setSuccess(null);
      }
    }, 5000);
  };

  const categories = ['all', 'AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Blockchain'];

  const filteredTeams = teams.filter(team => {
    const matchesCategory = selectedCategory === 'all' || team.category === selectedCategory;
    const matchesSearch = team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getAssignmentStatusBadge = (status) => {
    switch (status) {
      case 'assigned':
        return <span className="badge badge-success">Assigned</span>;
      case 'unassigned':
        return <span className="badge badge-warning">Unassigned</span>;
      case 'in-progress':
        return <span className="badge badge-info">In Progress</span>;
      case 'completed':
        return <span className="badge badge-secondary">Completed</span>;
      default:
        return <span className="badge badge-warning">Unassigned</span>;
    }
  };

  const handleAssignJudge = (team) => {
    setSelectedTeam(team);
    setShowAssignmentModal(true);
  };

  // Unassign judge from team
  const handleUnassignJudge = async (teamId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/evaluation/unassign/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to unassign judge');
      }
      
      await fetchData();
      showMessage('Judge unassigned successfully!', 'success');
    } catch (err) {
      showMessage(`Failed to unassign judge: ${err.message}`);
      console.error('Error unassigning judge:', err);
    }
  };

  // Assign judge to team
  const handleAssignJudgeToTeam = async (judgeId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/evaluation/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: selectedTeam._id,
          judgeId: judgeId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign judge');
      }
      
      await fetchData();
      setShowAssignmentModal(false);
      showMessage('Judge assigned successfully!', 'success');
    } catch (err) {
      showMessage(`Failed to assign judge: ${err.message}`);
      console.error('Error assigning judge:', err);
    }
  };

  if (loading) {
    return (
      <div className="judge-assignment">
        <div className="page-header">
          <h1 className="page-title">Judge Assignment</h1>
          <p className="page-subtitle">Assign judges to teams and manage evaluations</p>
        </div>
        <div className="loading-container">
          <Loader size={32} className="spinner" />
          <p>Loading teams and judges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="judge-assignment">
      <div className="page-header">
        <h1 className="page-title">Judge Assignment</h1>
        <p className="page-subtitle">Assign judges to teams and manage evaluations</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
          <button 
            onClick={() => setSuccess(null)} 
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters">
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
              placeholder="Search teams or project titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="card">
        <div className="card-header">
          <h3>Team Assignments</h3>
          <div className="stats-summary">
            <span>Total Teams: {teams.length}</span>
            <span>Assigned: {teams.filter(t => t.evaluationStatus === 'assigned' || t.evaluationStatus === 'in-progress' || t.evaluationStatus === 'completed').length}</span>
            <span>Unassigned: {teams.filter(t => t.evaluationStatus === 'unassigned').length}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Category</th>
                  <th>Project Title</th>
                  <th>Members</th>
                  <th>Assigned Judge</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No teams found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => (
                    <tr key={team._id}>
                      <td>
                        <div className="team-info">
                          <strong>{team.teamName}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{team.category || 'Not specified'}</span>
                      </td>
                      <td>
                        <div className="project-title">
                          {team.projectTitle || 'Not specified'}
                        </div>
                      </td>
                      <td>
                        <div className="team-members">
                          {team.members && team.members.map((member, index) => (
                            <span key={index} className="member-tag">{member.name}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {team.assignedJudge ? (
                          <div className="judge-info">
                            <span className="judge-name">{team.assignedJudge.name}</span>
                            <span className="judge-expertise">{team.assignedJudge.expertise?.join(', ')}</span>
                          </div>
                        ) : (
                          <span className="no-judge">Not assigned</span>
                        )}
                      </td>
                      <td>
                        {getAssignmentStatusBadge(team.evaluationStatus)}
                      </td>
                      <td>
                        {team.evaluationScore ? (
                          <span className="score">{team.evaluationScore}/10</span>
                        ) : (
                          <span className="no-score">-</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {team.evaluationStatus === 'unassigned' ? (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAssignJudge(team)}
                            >
                              <UserCheck size={14} />
                              Assign
                            </button>
                          ) : (
                            <button 
                              className="btn btn-error btn-sm"
                              onClick={() => handleUnassignJudge(team._id)}
                            >
                              <XCircle size={14} />
                              Unassign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Judges Overview */}
      <div className="judges-overview">
        <div className="card">
          <div className="card-header">
            <h3>Available Judges</h3>
          </div>
          <div className="card-body">
            <div className="judges-grid">
              {judges.length === 0 ? (
                <div className="no-data">No judges available</div>
              ) : (
                judges.map((judge) => {
                  const assignedTeamsCount = teams.filter(t => 
                    t.assignedJudge && t.assignedJudge._id === judge._id
                  ).length;
                  
                  const completedEvaluations = teams.filter(t => 
                    t.assignedJudge && t.assignedJudge._id === judge._id && t.evaluationStatus === 'completed'
                  ).length;
                  
                  return (
                    <div key={judge._id} className="judge-card">
                      <div className="judge-header">
                        <div className="judge-avatar">
                          <span>{judge.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="judge-info">
                          <h4>{judge.name}</h4>
                          <p className="judge-expertise">{judge.expertise?.join(', ') || 'No expertise specified'}</p>
                        </div>
                        <div className="judge-status">
                          <span className={`status-indicator available`}>
                            <CheckCircle size={14} />
                            Available
                          </span>
                        </div>
                      </div>
                      <div className="judge-stats">
                        <div className="stat">
                          <span className="stat-label">Assigned Teams:</span>
                          <span className="stat-value">{assignedTeamsCount}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Evaluations:</span>
                          <span className="stat-value">{completedEvaluations}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <AssignmentModal
          team={selectedTeam}
          judges={judges}
          onClose={() => setShowAssignmentModal(false)}
          onAssign={handleAssignJudgeToTeam}
        />
      )}
    </div>
  );
};

// Assignment Modal Component
const AssignmentModal = ({ team, judges, onClose, onAssign }) => {
  const [selectedJudge, setSelectedJudge] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedJudge) {
      onAssign(selectedJudge);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Judge to {team?.teamName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="team-details">
              <h4>Team Information</h4>
              <p><strong>Category:</strong> {team?.category || 'Not specified'}</p>
              <p><strong>Project Title:</strong> {team?.projectTitle || 'Not specified'}</p>
              <p><strong>Members:</strong> {team?.members?.map(m => m.name).join(', ')}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Select Judge</label>
              <select
                className="form-select"
                value={selectedJudge}
                onChange={(e) => setSelectedJudge(e.target.value)}
                required
              >
                <option value="">Choose a judge...</option>
                {judges.map(judge => (
                  <option key={judge._id} value={judge._id}>
                    {judge.name} - {judge.expertise?.join(', ')}
                  </option>
                ))}
              </select>
            </div>

            {team?.category && (
              <div className="judge-recommendations">
                <h4>Recommended Judges</h4>
                <div className="recommendations-list">
                  {judges
                    .filter(judge => judge.expertise && judge.expertise.includes(team.category))
                    .map(judge => (
                      <div key={judge._id} className="recommendation-item">
                        <div className="judge-info">
                          <strong>{judge.name}</strong>
                          <span className="expertise">{judge.expertise?.join(', ')}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedJudge(judge._id)}
                        >
                          Select
                        </button>
                      </div>
                    ))
                  }
                  {judges.filter(judge => judge.expertise && judge.expertise.includes(team.category)).length === 0 && (
                    <p>No judges with matching expertise found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Judge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JudgeAssignment;