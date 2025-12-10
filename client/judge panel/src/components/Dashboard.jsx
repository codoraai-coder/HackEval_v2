import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Dashboard = () => {
  const [judgeName, setJudgeName] = useState('Judge');
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [activeRound, setActiveRound] = useState(null);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Filtering and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(6);

  const navigate = useNavigate();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('judgeToken');
  };

  useEffect(() => {
    const fetchJudgeProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setJudgeName('Judge');
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/judge/evaluation/current`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.name) {
            setJudgeName(data.data.name);
          } else if (data.data && data.data.username) {
            setJudgeName(data.data.username);
          }
        }
      } catch (error) {
        console.error('Failed to fetch judge profile:', error);
        // Fallback to username from localStorage if available
        const storedUsername = localStorage.getItem('judgeUsername');
        if (storedUsername) {
          setJudgeName(storedUsername);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTeams = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/judge/evaluation/teams`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTeams(data.data || []);
        } else {
          console.error('Failed to fetch teams');
          setTeams([]);
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        setTeams([]);
      } finally {
        setTeamsLoading(false);
      }
    };

    // Fetch teams and judge profile
    fetchTeams();
    fetchJudgeProfile();
  }, []);

  // Update evaluation stats when teams are loaded
  useEffect(() => {
    if (teams.length > 0) {
      updateEvaluationStats();
    }
  }, [teams]);

  // Fetch current round and keep it updated
  useEffect(() => {
    let mounted = true;
    let timerId;
    
    const fetchActive = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/round-state/active`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setActiveRound(data.round);
      } catch {}
    };
    
    fetchActive();
    timerId = setInterval(fetchActive, 5000);
    
    return () => { 
      mounted = false; 
      if (timerId) clearInterval(timerId); 
    };
  }, []);

  // Filter teams based on search term and category
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           team.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...Array.from(new Set(teams.map(team => team.category).filter(Boolean)))];

  // Pagination logic
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Update evaluation stats
  const updateEvaluationStats = () => {
    const evaluated = teams.filter(team => team.evaluationStatus === 'completed').length;
    const pending = teams.filter(team => 
      team.evaluationStatus === 'assigned' || team.evaluationStatus === 'in-progress'
    ).length;
    
    setEvaluatedCount(evaluated);
    setPendingCount(pending);
  };

  const handleTeamSelect = (team) => {
    navigate('/evaluate', { 
      state: { selectedTeam: team } 
    });
  };

  const refreshEvaluationStats = () => {
    updateEvaluationStats();
  };

  const stats = [
    {
      title: 'Total Teams',
      value: teamsLoading ? '...' : teams.length.toString(),
      icon: <Users size={24} />,
      color: 'blue',
      subtitle: 'Available for evaluation'
    },
    {
      title: 'Evaluated',
      value: evaluatedCount.toString(),
      icon: <CheckCircle size={24} />,
      color: 'green',
      subtitle: 'Completed evaluations'
    },
    {
      title: 'Pending Review',
      value: pendingCount.toString(),
      icon: <Clock size={24} />,
      color: 'orange',
      subtitle: 'Awaiting evaluation'
    }
  ];

  return (
    <div className="dashboard">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="page-title">Welcome back, {judgeName}</h1>
          <p className="page-subtitle">Here's your evaluation overview.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={refreshEvaluationStats}
            disabled={statsLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
            title="Refresh evaluation statistics"
          >
            <RefreshCw size={16} />
            Refresh Stats
          </button>
          <div className="current-round">
            Current Round: {activeRound ? `Round ${activeRound}` : 'None'}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              {stat.subtitle && <p className="stat-subtitle">{stat.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Teams List */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>All Teams</h2>
            <div className="section-actions">
              <div className="search-filter-container">
                {/* Search Bar */}
                <div className="search-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search teams or project titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="filter-container">
                  <Filter size={18} className="filter-icon" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-filter"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <span className="results-count">
              Showing {filteredTeams.length} of {teams.length} teams
            </span>
            {searchTerm && (
              <span className="search-term">
                for "{searchTerm}"
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="category-term">
                in {selectedCategory}
              </span>
            )}
          </div>

          {teamsLoading ? (
            <div className="loading">Loading teams...</div>
          ) : filteredTeams.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No teams found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="teams-list">
                {currentTeams.map((team) => (
                  <div key={team._id} className="team-item">
                    <div className="team-info">
                      <h4>{team.teamName}</h4>
                      <p className="team-category">Category: {team.category || 'N/A'}</p>
                      <p className="team-project">Project: {team.projectTitle || 'Not specified'}</p>
                      <p className="team-members-count">
                        Members: {team.members ? team.members.length : 0}
                      </p>
                      <div className="evaluation-status">
                        Status: <span className={`status-${team.evaluationStatus}`}>
                          {team.evaluationStatus || 'unassigned'}
                        </span>
                      </div>
                      {team.evaluationScore && (
                        <p className="team-score">
                          Score: {team.evaluationScore}/100
                        </p>
                      )}
                    </div>
                    <div className="team-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleTeamSelect(team)}
                        title="Evaluate This Team"
                        disabled={team.evaluationStatus === 'completed'}
                      >
                        <Play size={16} />
                        {team.evaluationStatus === 'completed' ? 'Evaluated' : 'Evaluate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`page-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;