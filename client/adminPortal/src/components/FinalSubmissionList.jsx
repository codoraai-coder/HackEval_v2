import React, { useState, useEffect } from 'react';
import {
  Search,
  Trophy,
  Users,
  Star,
  ExternalLink,
  Download,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';
import './FinalSubmissionList.css';

const FinalSubmissionList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [finalSubmissions, setFinalSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Fetch final submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard/final-submissions`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data = await res.json();
        const submissions = data.data || data || [];
        setFinalSubmissions(submissions);
      } catch (err) {
        setError(err.message || 'Error loading submissions');
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const filteredSubmissions = finalSubmissions.filter(submission => {
    const matchesSearch = submission.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || submission.category.toLowerCase() === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getScoreColor = (score) => {
    if (score >= 8.5) return 'success';
    if (score >= 7.5) return 'warning';
    return 'error';
  };

  const getUniquenessColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <div className="final-submission-list">
      <div className="page-header">
        <h1 className="page-title">Final Submission List</h1>
        <p className="page-subtitle">Approved submissions for the final round</p>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card stat-card--submissions">
            <div className="stat-icon stat-icon--submissions">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : finalSubmissions.length}</h3>
              <p>Final Submissions</p>
            </div>
          </div>
          <div className="stat-card stat-card--score">
            <div className="stat-icon stat-icon--score">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>
                {loading ? '...' : finalSubmissions.length > 0
                  ? (finalSubmissions.reduce((sum, s) => sum + s.averageScore, 0) / finalSubmissions.length).toFixed(1)
                  : '0'}
              </h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card stat-card--categories">
            <div className="stat-icon stat-icon--categories">
              <Trophy size={24} />
            </div>
            <div className="stat-content">
              <h3>
                {loading ? '...' : new Set(finalSubmissions.map(s => s.category)).size}
              </h3>
              <p>Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-state" style={{
          background: '#fee',
          color: '#c33',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state" style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--muted)'
        }}>
          <p>Loading submissions...</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section card">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by team name or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-controls">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="smart cities">Smart Cities</option>
              <option value="healthcare">Healthcare</option>
              <option value="data science">Data Science</option>
              <option value="sustainability">Sustainability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="submissions-grid">
        {filteredSubmissions.map((submission) => (
          <div key={submission.id} className="submission-card card">
            <div className="submission-header">
              <div className="submission-meta">
                <h3>{submission.teamName}</h3>
                <p className="project-name">{submission.projectName}</p>
                <span className="category-badge">{submission.category}</span>
              </div>
              <div className="submission-score">
                <div className={`score-badge score-${getScoreColor(submission.averageScore)}`}>
                  <Star size={16} />
                  {submission.averageScore}/10
                </div>
                <div className="evaluators-count">
                  {submission.totalEvaluators} evaluators
                </div>
              </div>
            </div>

            <div className="submission-content">
              <div className="abstract-section">
                <h4>Abstract</h4>
                <p>{submission.abstract}</p>
              </div>

              <div className="tech-stack-section">
                <h4>Tech Stack</h4>
                <div className="tech-stack">
                  {submission.techStack.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

              {/* <div className="metrics-section">
                <div className="metric">
                  <span className="metric-label">Uniqueness</span>
                  <div className="metric-value">
                    <div className={`progress-bar ${getUniquenessColor(submission.uniquenessScore)}`}>
                      <div 
                        className="progress-fill" 
                        style={{ width: `${submission.uniquenessScore}%` }}
                      ></div>
                    </div>
                    <span className="metric-score">{submission.uniquenessScore}%</span>
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-label">Plagiarism</span>
                  <div className="metric-value">
                    <div className={`progress-bar ${submission.plagiarismScore <= 15 ? 'success' : 'warning'}`}>
                      <div 
                        className="progress-fill" 
                        style={{ width: `${submission.plagiarismScore}%` }}
                      ></div>
                    </div>
                    <span className="metric-score">{submission.plagiarismScore}%</span>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="submission-actions">
              <a href={submission.pptLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <ExternalLink size={16} />
                View Presentation
              </a>
              <button className="btn btn-secondary">
                <Download size={16} />
                Download
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedSubmission(submission)}>
                <Trophy size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="empty-state">
          <h3>No final submissions found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            margin: 'auto'
          }}>
            <button
              onClick={() => setSelectedSubmission(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            <h2 style={{ marginBottom: '8px' }}>{selectedSubmission.teamName}</h2>
            <h3 style={{ color: '#666', marginBottom: '24px' }}>{selectedSubmission.projectName}</h3>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <strong>Category:</strong> {selectedSubmission.category}
                </div>
                <div>
                  <strong>Score:</strong> {selectedSubmission.averageScore}/10
                </div>
                <div>
                  <strong>Evaluators:</strong> {selectedSubmission.totalEvaluators}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4>Team Members</h4>
              {selectedSubmission.members && selectedSubmission.members.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedSubmission.members.map((member, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: member.isLeader ? '#e8f5e9' : '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{member.name}</strong>
                        {member.isLeader && (
                          <span style={{
                            marginLeft: '8px',
                            background: '#4caf50',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            Leader
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {member.email || 'No email'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999' }}>No team members listed</p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4>Abstract</h4>
              <p>{selectedSubmission.abstract}</p>
            </div>


            <div style={{ marginBottom: '24px' }}>
              <h4>Tech Stack</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedSubmission.techStack && selectedSubmission.techStack.length > 0 ? (
                  selectedSubmission.techStack.map((tech, index) => (
                    <span key={index} style={{
                      background: '#e3f2fd',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '14px'
                    }}>
                      {tech}
                    </span>
                  ))
                ) : (
                  <p style={{ color: '#999' }}>No tech stack specified</p>
                )}
              </div>
            </div>

            {selectedSubmission.pptLink && (
              <div style={{ marginTop: '24px' }}>
                <a
                  href={selectedSubmission.pptLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <ExternalLink size={16} />
                  View Presentation
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalSubmissionList;