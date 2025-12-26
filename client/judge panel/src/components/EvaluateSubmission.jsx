import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, EVALUATION_PARAMETERS, SCORE_RANGES } from '../config.js';
import { getJudgeProfile, getAllTeams, getMyEvaluations, submitEvaluation, saveDraft } from '../api.js';
import './EvaluateSubmission.css';

const EvaluateSubmission = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTeam = location.state?.selectedTeam;
  
  const [evaluation, setEvaluation] = useState({
    problem_solution_fit: 5,
    functionality_features: 5,
    technical_feasibility: 5,
    innovation_creativity: 5,
    user_experience: 5,
    impact_value: 5,
    presentation_demo_quality: 5,
    team_collaboration: 5,
    personalized_feedback: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [pptEvaluation, setPptEvaluation] = useState(null);
  const [loadingPptData, setLoadingPptData] = useState(false);
  const [judgeProfile, setJudgeProfile] = useState(null);

  // Load judge profile and existing evaluation
  useEffect(() => {
    const loadJudgeData = async () => {
      try {
        const profile = await getJudgeProfile();
        setJudgeProfile(profile);
        
        if (selectedTeam) {
          loadExistingEvaluation(selectedTeam._id);
          loadPptEvaluation(selectedTeam.teamName);
        }
      } catch (error) {
        console.error('Error loading judge profile:', error);
      }
    };

    loadJudgeData();
  }, [selectedTeam]);

  const loadExistingEvaluation = async (teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/judge/team-evaluation/${teamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('judgeToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const existingEval = result.data;
        
        if (existingEval) {
          setEvaluation({
            problem_solution_fit: existingEval.problem_solution_fit || 5,
            functionality_features: existingEval.functionality_features || 5,
            technical_feasibility: existingEval.technical_feasibility || 5,
            innovation_creativity: existingEval.innovation_creativity || 5,
            user_experience: existingEval.user_experience || 5,
            impact_value: existingEval.impact_value || 5,
            presentation_demo_quality: existingEval.presentation_demo_quality || 5,
            team_collaboration: existingEval.team_collaboration || 5,
            personalized_feedback: existingEval.personalized_feedback || ''
          });
        }
      }
    } catch (error) {
      console.log('No existing evaluation found or error loading it');
    }
  };

  const loadPptEvaluation = async (teamName) => {
    if (!teamName) return;
    
    console.log('Loading PPT evaluation for team:', teamName);
    setLoadingPptData(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/team-evaluation/${encodeURIComponent(teamName)}`);

      console.log('PPT API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('PPT API Response data:', result);
        setPptEvaluation(result.data);
      } else {
        console.log('No PPT evaluation data found for team:', teamName);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error loading PPT evaluation data:', error);
    } finally {
      setLoadingPptData(false);
    }
  };

  // If no team is selected, show selection message
  if (!selectedTeam) {
    return (
      <div className="evaluate-submission">
        <div className="page-header">
          <h1 className="page-title">Evaluate Submission</h1>
          <p className="page-subtitle">Please select a team to evaluate</p>
        </div>
        <div className="no-team-selected">
          <p>No team selected. Please go back and select a team to evaluate.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSliderChange = (parameter, value) => {
    setEvaluation(prev => ({
      ...prev,
      [parameter]: parseInt(value)
    }));
  };

  const handleInputChange = (field, value) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!evaluation.personalized_feedback.trim()) {
      alert('Please provide personalized feedback before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Submitting evaluation...');

    try {
      // Prepare data for backend API
      const evaluationData = {
        team_id: selectedTeam._id,
        team_name: selectedTeam.teamName,
        problem_statement: selectedTeam.problemStatement?.title || 'No problem statement',
        category: selectedTeam.problemStatement?.category || 'General',
        round_id: 1,
        problem_solution_fit: evaluation.problem_solution_fit,
        functionality_features: evaluation.functionality_features,
        technical_feasibility: evaluation.technical_feasibility,
        innovation_creativity: evaluation.innovation_creativity,
        user_experience: evaluation.user_experience,
        impact_value: evaluation.impact_value,
        presentation_demo_quality: evaluation.presentation_demo_quality,
        team_collaboration: evaluation.team_collaboration,
        personalized_feedback: evaluation.personalized_feedback
      };

      console.log('Sending evaluation data:', evaluationData);

      const result = await submitEvaluation(evaluationData);
      console.log('Evaluation submitted successfully:', result);
      
      setSubmitStatus('✅ Evaluation submitted successfully!');
      
      // Show success message
      alert(`Evaluation submitted successfully!\nTotal Score: ${result.data.total_score}/70\nAverage Score: ${result.data.average_score}/10`);
      
      // Wait for 2 seconds to show success message, then navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      setSubmitStatus(`❌ Failed to submit: ${error.message || 'Unknown error'}`);
      alert(`Failed to submit evaluation: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!evaluation.personalized_feedback.trim()) {
      alert('Please provide personalized feedback before saving draft.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Saving draft...');

    try {
      const evaluationData = {
        team_id: selectedTeam._id,
        team_name: selectedTeam.teamName,
        problem_statement: selectedTeam.problemStatement?.title || 'No problem statement',
        category: selectedTeam.problemStatement?.category || 'General',
        round_id: 1,
        problem_solution_fit: evaluation.problem_solution_fit,
        functionality_features: evaluation.functionality_features,
        technical_feasibility: evaluation.technical_feasibility,
        innovation_creativity: evaluation.innovation_creativity,
        user_experience: evaluation.user_experience,
        impact_value: evaluation.impact_value,
        presentation_demo_quality: evaluation.presentation_demo_quality,
        team_collaboration: evaluation.team_collaboration,
        personalized_feedback: evaluation.personalized_feedback
      };

      const result = await saveDraft(evaluationData);
      console.log('Draft saved successfully:', result);
      
      setSubmitStatus('✅ Draft saved successfully!');
      alert('Draft saved successfully!');
      
      // Wait for 2 seconds to show success message, then navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSubmitStatus(`❌ Failed to save draft: ${error.message || 'Unknown error'}`);
      alert(`Failed to save draft: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  return (
    <div className="evaluate-submission">
      <div className="page-header">
        <h1 className="page-title">Evaluate Submission</h1>
        <p className="page-subtitle">Review and evaluate team submission</p>
        <button className="btn btn-secondary back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Teams
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => loadPptEvaluation(selectedTeam.teamName)}
          style={{ marginLeft: '10px' }}
        >
          🔄 Reload PPT Data
        </button>
      </div>

      <div className="evaluation-container">
        {/* Project Metadata Section */}
        <div className="metadata-section card">
          <div className="metadata-header">
            <div className="team-info">
              <h2>{selectedTeam.teamName}</h2>
              <span className="category-badge">{selectedTeam.problemStatement?.category || 'General'}</span>
            </div>
            <div className="submission-meta">
              <p className="submission-date">Submitted: {selectedTeam.submissionDate || 'N/A'}</p>
            </div>
          </div>

          <div className="metadata-content">
            <div className="metadata-item">
              <h3>Problem Statement</h3>
              <p className="problem-title">{selectedTeam.problemStatement?.title || 'No problem statement available'}</p>
              {selectedTeam.problemStatement?.description && (
                <div className="problem-description">
                  <p>{selectedTeam.problemStatement.description}</p>
                </div>
              )}
            </div>

            <div className="metadata-item">
              <h3>Team Leader</h3>
              {selectedTeam.teamLeader ? (
                <div className="team-leader-info">
                  <p><strong>Name:</strong> {selectedTeam.teamLeader.name}</p>
                  <p><strong>Roll No:</strong> {selectedTeam.teamLeader.rollNo}</p>
                  <p><strong>Email:</strong> {selectedTeam.teamLeader.email}</p>
                  <p><strong>Contact:</strong> {selectedTeam.teamLeader.contact}</p>
                  <p><strong>Role:</strong> {selectedTeam.teamLeader.role}</p>
                </div>
              ) : (
                <p>No team leader information available</p>
              )}
            </div>

            <div className="metadata-item">
              <h3>Team Members</h3>
              {selectedTeam.teamMembers && selectedTeam.teamMembers.length > 0 ? (
                <div className="team-members-list">
                  {selectedTeam.teamMembers.map((member, index) => (
                    <div key={index} className="member-card">
                      <div className="member-header">
                        <h4>{member.name}</h4>
                        <span className="member-role">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No team members information available</p>
              )}
            </div>

            <div className="metadata-item">
              <h3>Project Details</h3>
              <div className="project-details">
                <div className="detail-row">
                  <strong>Category:</strong> {selectedTeam.problemStatement?.category || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PPT Evaluation by AI Section */}
        {loadingPptData && (
          <div className="ppt-evaluation-section card">
            <div className="section-header">
              <h2>PPT Evaluation by AI</h2>
              <div className="loading-indicator">Loading AI evaluation data...</div>
            </div>
          </div>
        )}

        {!loadingPptData && !pptEvaluation && (
          <div className="ppt-evaluation-section card">
            <div className="section-header">
              <h2>PPT Evaluation by AI</h2>
              <div className="loading-indicator">No PPT evaluation data found. Click "Reload PPT Data" to try again.</div>
            </div>
          </div>
        )}

        {pptEvaluation && (
          <div className="ppt-evaluation-section card">
            <div className="section-header">
              <h2>PPT Evaluation by AI</h2>
              <div className="evaluation-meta">
                <span className="evaluation-date">
                  Evaluated: {new Date(pptEvaluation.upload_timestamp).toLocaleDateString()}
                </span>
                <span className="evaluation-score">
                  Total Score: {pptEvaluation.total_weighted_score}/100
                </span>
              </div>
            </div>

            <div className="ppt-evaluation-content">
              {/* AI Evaluation Scores */}
              <div className="ai-scores-section">
                <h3>AI Evaluation Scores</h3>
                <div className="ai-scores-grid">
                  {Object.entries(pptEvaluation.evaluation_scores).map(([parameter, score]) => (
                    <div key={parameter} className="ai-score-item">
                      <div className="ai-score-header">
                        <span className="ai-parameter-name">{parameter}</span>
                        <span className={`ai-score-value score-${getScoreColor(score)}`}>
                          {score}/10
                        </span>
                      </div>
                      <div className="ai-score-bar">
                        <div 
                          className="ai-score-fill" 
                          style={{ 
                            width: `${(score / 10) * 100}%`,
                            backgroundColor: score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Score Summary */}
              <div className="raw-score-summary">
                <h3>Score Summary</h3>
                <div className="score-summary-grid">
                  <div className="score-item">
                    <span className="score-label">Total Raw Score:</span>
                    <span className="score-value">{pptEvaluation.total_raw_score}/70</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Total Weighted Score:</span>
                    <span className="score-value">{pptEvaluation.total_weighted_score}/100</span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {pptEvaluation.summary && (
                <div className="ai-summary-section">
                  <h3>AI Project Summary</h3>
                  <div className="ai-summary-content">
                    <p>{pptEvaluation.summary}</p>
                  </div>
                </div>
              )}

              {/* AI Feedback Sections */}
              <div className="ai-feedback-sections">
                {pptEvaluation.feedback_positive && (
                  <div className="ai-feedback-section positive">
                    <h3>✅ Positive Aspects</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_positive}</p>
                    </div>
                  </div>
                )}

                {pptEvaluation.feedback_criticism && (
                  <div className="ai-feedback-section criticism">
                    <h3>⚠️ Areas for Improvement</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_criticism}</p>
                    </div>
                  </div>
                )}

                {pptEvaluation.feedback_technical && (
                  <div className="ai-feedback-section technical">
                    <h3>🔧 Technical Analysis</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_technical}</p>
                    </div>
                  </div>
                )}

                {pptEvaluation.feedback_suggestions && (
                  <div className="ai-feedback-section suggestions">
                    <h3>💡 Recommendations</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_suggestions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Form */}
        <form className="evaluation-form card" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Judging Parameters</h2>
            <p>Rate each parameter on a scale of 1-10</p>
          </div>

          <div className="parameters-grid">
            {Object.entries(EVALUATION_PARAMETERS).map(([key, param]) => (
              <div key={key} className="parameter-item">
                <div className="parameter-header">
                  <label className="parameter-label">{param.label}</label>
                  <div className="parameter-meta">
                    <span className="parameter-weightage">{(param.weight * 100)}%</span>
                    <span className={`parameter-score score-${getScoreColor(evaluation[key])}`}>
                      {evaluation[key]}/10
                    </span>
                  </div>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evaluation[key]}
                    onChange={(e) => handleSliderChange(key, e.target.value)}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <label className="form-label">Personalized Feedback</label>
            <textarea
              value={evaluation.personalized_feedback}
              onChange={(e) => handleInputChange('personalized_feedback', e.target.value)}
              className="form-textarea"
              placeholder="Provide detailed feedback for the team..."
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>

          {submitStatus && (
            <div className={`submit-status ${submitStatus.includes('✅') ? 'success' : submitStatus.includes('❌') ? 'error' : 'info'}`}>
              {submitStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EvaluateSubmission;