import React, { useState } from 'react';
import { Search, Eye, Calendar } from 'lucide-react';
import './Assign.css';

const mockAssignedTeams = [
  {
    id: 'T-001',
    teamName: 'Alpha Coders',
    projectName: 'Smart Water Meter',
    submissionDate: '2024-08-25',
    category: 'IoT',
    abstract: `A smart water meter system using IoT sensors to monitor and optimize water usage in real time.`,
    status: 'Pending',
    assignedBy: 'Admin',
    details: {
      teamId: 'AC-2024-001',
      problemStatement: 'Monitor and optimize residential water consumption using connected meters and predictive analytics.',
      description: 'End-to-end system with LoRaWAN meters, gateway, and cloud analytics to detect leaks and provide usage insights.',
      techStack: ['React', 'Node.js', 'LoRaWAN', 'AWS IoT', 'PostgreSQL'],
      pptLink: 'https://docs.google.com/presentation/d/alpha',
      abstract: 'IoT-driven conservation approach with tiered alerting. Requires pilot study and ROI analysis.'
    }
  },
  {
    id: 'T-002',
    teamName: 'Beta Builders',
    projectName: 'AI Tutor',
    submissionDate: '2024-08-24',
    category: 'Education',
    abstract: `An AI-powered virtual tutor that adapts to student learning styles and provides personalized feedback.`,
    status: 'Pending',
    assignedBy: 'Admin',
    details: {
      teamId: 'BB-2024-002',
      problemStatement: 'Personalize learning pathways for K-12 students using AI.',
      description: 'Recommendation engine suggests next lessons; teacher dashboard provides mastery insights and interventions.',
      techStack: ['Next.js', 'FastAPI', 'PyTorch', 'Redis'],
      pptLink: 'https://docs.google.com/presentation/d/beta',
      abstract: 'Strong pedagogy alignment; needs clearer dataset governance and bias mitigation plan.'
    }
  }
];

const Assign = () => {
  const [search, setSearch] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const filteredTeams = mockAssignedTeams.filter(team =>
    team.teamName.toLowerCase().includes(search.toLowerCase()) ||
    team.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const openDetails = (team) => {
    setSelectedTeam(team);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedTeam(null);
  };

  return (
    <div className="assign-teams">
      <div className="page-header">
        <h1 className="page-title">Teams Assigned to Me</h1>
        <p className="page-subtitle">Teams assigned by admin for your evaluation.</p>
      </div>

      <div className="assign-filters-section card">
        <div className="assign-filters-row">
          <div className="assign-search-box">
            <Search size={20} className="assign-search-icon" />
            <input
              type="text"
              placeholder="Search by team or project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="assign-search-input"
            />
          </div>
        </div>
      </div>

      <div className="assign-teams-grid">
        {filteredTeams.map(team => (
          <div key={team.id} className="assign-team-card card">
            <div className="assign-team-header">
              <div className="assign-team-meta">
                <h3>{team.teamName}</h3>
                <p className="assign-project-name">{team.projectName}</p>
                <div className="assign-team-dates">
                  <span className="assign-date-item">
                    <Calendar size={14} /> Submitted: {team.submissionDate}
                  </span>
                  <span className="assign-status-badge assign-status-unassigned">
                    {team.status}
                  </span>
                </div>
              </div>
              <div className="assign-judges">
                <strong>Assigned By:</strong>
                <ul><li>{team.assignedBy}</li></ul>
              </div>
            </div>
            <div className="assign-team-content">
              <div className="assign-abstract">
                <strong>Abstract:</strong>
                <div style={{ whiteSpace: 'pre-line' }}>{team.abstract}</div>
              </div>
              <div>
                <strong>Category:</strong> {team.category}
              </div>
            </div>
            <div className="assign-actions">
              <button className="btn btn-secondary" onClick={() => openDetails(team)}>
                <Eye size={16} /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="empty-state">
          <h3>No assigned teams found</h3>
          <p>Try adjusting your search.</p>
        </div>
      )}

      {isDetailsOpen && selectedTeam && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="team-info">
                <h2>{selectedTeam.teamName}</h2>
                {selectedTeam.details?.teamId && (
                  <p className="team-id">ID: {selectedTeam.details.teamId}</p>
                )}
                {selectedTeam.category && (
                  <span className="category-badge">{selectedTeam.category}</span>
                )}
              </div>
              <button className="modal-close" onClick={closeDetails}>×</button>
            </div>

            <div className="metadata-content">
              {selectedTeam.details?.problemStatement && (
                <div className="metadata-item">
                  <h3>Problem Statement</h3>
                  <p>{selectedTeam.details.problemStatement}</p>
                </div>
              )}

              {selectedTeam.details?.description && (
                <div className="metadata-item">
                  <h3>Description</h3>
                  <p className="abstract">{selectedTeam.details.description}</p>
                </div>
              )}

              {selectedTeam.details?.techStack?.length > 0 && (
                <div className="metadata-item">
                  <h3>Tech Stack</h3>
                  <div className="tech-stack">
                    {selectedTeam.details.techStack.map((tech, index) => (
                      <span key={index} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTeam.details?.abstract && (
                <div className="metadata-item">
                  <h3>AI-Generated Abstract</h3>
                  <p className="abstract" style={{ whiteSpace: 'pre-line' }}>{selectedTeam.details.abstract}</p>
                </div>
              )}

              {(selectedTeam.details?.pptLink || selectedTeam.submissionDate) && (
                <div className="metadata-item">
                  <h3>Submission</h3>
                  <div className="presentation-links">
                    {selectedTeam.details?.pptLink && (
                      <a href={selectedTeam.details.pptLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Presentation</a>
                    )}
                    {selectedTeam.submissionDate && (
                      <span className="submission-date">Submitted: {selectedTeam.submissionDate}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assign;