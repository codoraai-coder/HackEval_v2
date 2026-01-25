import React, { useState } from 'react';
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

  // Mock final submissions data
  const finalSubmissions = [
    {
      id: 'FS-001',
      teamName: 'Team Innovators',
      projectName: 'Smart Waste Management',
      category: 'Smart Cities',
      averageScore: 8.7,
      totalEvaluators: 3,
      // uniquenessScore: 85,
      // plagiarismScore: 12,
      submissionDate: '2024-01-15',
      pptLink: 'https://docs.google.com/presentation/d/example1',
      abstract: 'An intelligent waste management system using IoT sensors and AI to optimize collection routes and reduce environmental impact. The system reduces operational costs by 30% and improves collection efficiency by 45%.',
      techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'IoT Sensors', 'MongoDB']
    },
    {
      id: 'FS-002',
      teamName: 'TechVision',
      projectName: 'Healthcare Monitoring System',
      category: 'Healthcare',
      averageScore: 9.1,
      totalEvaluators: 3,
      // uniquenessScore: 92,
      // plagiarismScore: 8,
      submissionDate: '2024-01-13',
      pptLink: 'https://docs.google.com/presentation/d/example2',
      abstract: 'A comprehensive healthcare monitoring platform that provides real-time patient data analysis and predictive health insights.',
      techStack: ['React Native', 'Python', 'Machine Learning', 'AWS', 'PostgreSQL']
    },
    {
      id: 'FS-003',
      teamName: 'DataMasters',
      projectName: 'Predictive Analytics Dashboard',
      category: 'Data Science',
      averageScore: 8.3,
      totalEvaluators: 3,
      // uniquenessScore: 78,
      // plagiarismScore: 15,
      submissionDate: '2024-01-14',
      pptLink: 'https://docs.google.com/presentation/d/example3',
      abstract: 'Advanced analytics dashboard for business intelligence with predictive modeling capabilities.',
      techStack: ['Vue.js', 'Python', 'Pandas', 'Scikit-learn', 'Docker', 'Redis']
    },
    {
      id: 'FS-004',
      teamName: 'EcoTech',
      projectName: 'Renewable Energy Optimizer',
      category: 'Sustainability',
      averageScore: 8.9,
      totalEvaluators: 3,
      // uniquenessScore: 88,
      // plagiarismScore: 10,
      submissionDate: '2024-01-12',
      pptLink: 'https://docs.google.com/presentation/d/example4',
      abstract: 'AI-powered system for optimizing renewable energy production and distribution in smart grids.',
      techStack: ['Angular', 'Java', 'Spring Boot', 'Apache Kafka', 'InfluxDB']
    }
  ];

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
              <h3>{finalSubmissions.length}</h3>
              <p>Final Submissions</p>
            </div>
          </div>
          <div className="stat-card stat-card--score">
            <div className="stat-icon stat-icon--score">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>8.8</h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card stat-card--categories">
            <div className="stat-icon stat-icon--categories">
              <Trophy size={24} />
            </div>
            <div className="stat-content">
              <h3>4</h3>
              <p>Categories</p>
            </div>
          </div>
        </div>
      </div>

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
              <button className="btn btn-primary">
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
    </div>
  );
};

export default FinalSubmissionList;