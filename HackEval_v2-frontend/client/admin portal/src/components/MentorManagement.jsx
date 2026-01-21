import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  getMentors,
  getMentorStatistics,
  createMentor,
  updateMentor,
  deleteMentor,
  toggleMentorAvailability,
  addTeamToMentor,
  removeTeamFromMentor
} from '../api.js';

const MentorManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [newTeamNameByMentorId, setNewTeamNameByMentorId] = useState({});
  const [mentors, setMentors] = useState([]);
  const [statistics, setStatistics] = useState({
    totalMentors: 0,
    availableMentors: 0,
    totalAssignedTeams: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['all', 'AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Data Science', 'UI/UX', 'Full Stack', 'Hardware'];

  useEffect(() => {
    fetchMentors();
    fetchStatistics();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;
      
      const mentorsData = await getMentors(params);
      setMentors(mentorsData);
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setError('Failed to load mentors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getMentorStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [selectedCategory, selectedStatus, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'busy':
        return <span className="badge badge-warning">Busy</span>;
      case 'inactive':
        return <span className="badge badge-error">Inactive</span>;
      default:
        return <span className="badge badge-warning">Busy</span>;
    }
  };

  const getAvailabilityBadge = (availability) => {
    return availability ? 
      <span className="badge badge-success">Available</span> : 
      <span className="badge badge-error">Unavailable</span>;
  };

  const handleAddMentor = () => {
    setSelectedMentor(null);
    setShowMentorModal(true);
  };

  const handleEditMentor = (mentor) => {
    setSelectedMentor(mentor);
    setShowMentorModal(true);
  };

  const toggleAvailability = async (mentorId) => {
    try {
      const updatedMentor = await toggleMentorAvailability(mentorId);
      setMentors(prev => 
        prev.map(m => m._id === mentorId ? updatedMentor : m)
      );
      fetchStatistics(); // Refresh statistics
    } catch (err) {
      console.error('Error toggling availability:', err);
      alert('Failed to update availability. Please try again.');
    }
  };

  const handleAddAssignedTeam = async (mentorId) => {
    const rawName = (newTeamNameByMentorId[mentorId] || '').trim();
    if (!rawName) return;
    
    try {
      const updatedMentor = await addTeamToMentor(mentorId, rawName);
      setMentors(prev => 
        prev.map(m => m._id === mentorId ? updatedMentor : m)
      );
      setNewTeamNameByMentorId(prev => ({ ...prev, [mentorId]: '' }));
      fetchStatistics(); // Refresh statistics
    } catch (err) {
      console.error('Error adding team:', err);
      alert('Failed to add team. Please try again.');
    }
  };

  const handleRemoveAssignedTeam = async (mentorId, teamName) => {
    if (!window.confirm(`Remove team "${teamName}" from this mentor?`)) return;
    
    try {
      const updatedMentor = await removeTeamFromMentor(mentorId, teamName);
      setMentors(prev => 
        prev.map(m => m._id === mentorId ? updatedMentor : m)
      );
      fetchStatistics(); // Refresh statistics
    } catch (err) {
      console.error('Error removing team:', err);
      alert('Failed to remove team. Please try again.');
    }
  };

  const handleSaveMentor = async (mentorData) => {
    try {
      if (selectedMentor) {
        // Update existing mentor
        const updatedMentor = await updateMentor(selectedMentor._id, mentorData);
        setMentors(prev => 
          prev.map(m => m._id === selectedMentor._id ? updatedMentor : m)
        );
      } else {
        // Add new mentor
        const newMentor = await createMentor(mentorData);
        setMentors(prev => [newMentor, ...prev]);
      }
      setShowMentorModal(false);
      setSelectedMentor(null);
      fetchStatistics(); // Refresh statistics
    } catch (err) {
      console.error('Error saving mentor:', err);
      alert('Failed to save mentor. Please try again.');
    }
  };

  const handleRemoveMentor = async (mentorId) => {
    const mentor = mentors.find((m) => m._id === mentorId);
    const name = mentor ? mentor.name : 'this mentor';
    
    if (!window.confirm(`Remove ${name}? This action cannot be undone.`)) return;
    
    try {
      await deleteMentor(mentorId);
      setMentors(prev => prev.filter((m) => m._id !== mentorId));
      if (selectedMentor?._id === mentorId) {
        setSelectedMentor(null);
      }
      fetchStatistics(); // Refresh statistics
    } catch (err) {
      console.error('Error deleting mentor:', err);
      alert('Failed to delete mentor. Please try again.');
    }
  };

  return (
    <div className="mentor-management">
      <div className="page-header">
        <h1 className="page-title">Mentor Management</h1>
        <p className="page-subtitle">Manage mentor profiles, availability, and team assignments</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--primary-dark)20', color: 'var(--primary-dark)' }}>
                <UserCheck size={24} />
              </div>
              <h3>Total Mentors</h3>
            </div>
            <div className="card-value">
              <span className="value">{statistics.totalMentors}</span>
              <span className="change">Registered</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--success)20', color: 'var(--success)' }}>
                <CheckCircle size={24} />
              </div>
              <h3>Available Mentors</h3>
            </div>
            <div className="card-value">
              <span className="value">{statistics.availableMentors}</span>
              <span className="change positive">Active</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--info)20', color: 'var(--info)' }}>
                <Users size={24} />
              </div>
              <h3>Assigned Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{statistics.totalAssignedTeams}</span>
              <span className="change">Teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="action-bar">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Expertise</label>
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
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Search</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleAddMentor}>
            <Plus size={16} />
            Add Mentor
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading mentors...</p>
        </div>
      )}

      {/* Mentors Grid */}
      {!loading && !error && (
        <div className="mentors-grid">
          {mentors.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={48} />
              <h3>No mentors found</h3>
              <p>Try adjusting your filters or add a new mentor.</p>
            </div>
          ) : (
            mentors.map((mentor) => (
              <div key={mentor._id} className="mentor-card card">
                <div className="card-body">
                  <div className="mentor-header">
                    <div className="mentor-avatar">
                      <span>{mentor.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div className="mentor-info">
                      <h3 className="mentor-name">{mentor.name}</h3>
                      <p className="mentor-title">{mentor.expertise.join(', ')}</p>
                      <div className="mentor-status">
                        {getStatusBadge(mentor.status)}
                        {getAvailabilityBadge(mentor.availability)}
                      </div>
                    </div>
                    <div className="mentor-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditMentor(mentor)}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button className="btn btn-error btn-sm" onClick={() => handleRemoveMentor(mentor._id)}>
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mentor-details">
                    <div className="contact-info">
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{mentor.email}</span>
                      </div>
                      {mentor.phone && (
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{mentor.phone}</span>
                        </div>
                      )}
                      {mentor.location && (
                        <div className="contact-item">
                          <MapPin size={14} />
                          <span>{mentor.location}</span>
                        </div>
                      )}
                    </div>

                    {mentor.bio && (
                      <div className="mentor-bio">
                        <p>{mentor.bio}</p>
                      </div>
                    )}

                    <div className="assigned-teams">
                      <h4>Assigned Teams</h4>
                      {mentor.assignedTeams && mentor.assignedTeams.length > 0 ? (
                        <div className="team-tags">
                          {mentor.assignedTeams.map((team, index) => (
                            <span key={index} className="team-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {team}
                              <button
                                className="btn btn-error btn-sm"
                                style={{ padding: '2px 6px' }}
                                title="Remove team"
                                onClick={() => handleRemoveAssignedTeam(mentor._id, team)}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No teams assigned</p>
                      )}
                      <div className="add-team-row" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Add team name..."
                          value={newTeamNameByMentorId[mentor._id] || ''}
                          onChange={(e) => setNewTeamNameByMentorId((prev) => ({ ...prev, [mentor._id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddAssignedTeam(mentor._id);
                            }
                          }}
                          style={{ flex: 1 }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddAssignedTeam(mentor._id)}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="availability-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={mentor.availability}
                          onChange={() => toggleAvailability(mentor._id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className="toggle-label">
                        {mentor.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mentor Modal */}
      {showMentorModal && (
        <MentorModal
          mentor={selectedMentor}
          onClose={() => setShowMentorModal(false)}
          onSave={handleSaveMentor}
        />
      )}
    </div>
  );
};

// Mentor Modal Component
const MentorModal = ({ mentor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: mentor?.name || '',
    email: mentor?.email || '',
    phone: mentor?.phone || '',
    location: mentor?.location || '',
    bio: mentor?.bio || '',
    expertise: mentor?.expertise || [],
    availability: mentor?.availability ?? true,
    status: mentor?.status || 'active'
  });

  const expertiseOptions = ['AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Data Science', 'UI/UX', 'Full Stack', 'Hardware'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleExpertiseChange = (expertise) => {
    const updatedExpertise = formData.expertise.includes(expertise)
      ? formData.expertise.filter(exp => exp !== expertise)
      : [...formData.expertise, expertise];
    setFormData({ ...formData, expertise: updatedExpertise });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mentor ? 'Edit Mentor' : 'Add New Mentor'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Enter mentor bio and experience..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Areas of Expertise</label>
              <div className="expertise-checkboxes">
                {expertiseOptions.map((expertise) => (
                  <label key={expertise} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.expertise.includes(expertise)}
                      onChange={() => handleExpertiseChange(expertise)}
                    />
                    <span className="checkmark"></span>
                    {expertise}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <div className="availability-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {formData.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {mentor ? 'Update Mentor' : 'Add Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorManagement;