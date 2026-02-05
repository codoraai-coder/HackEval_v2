import React, { useState, useEffect } from 'react';
import './RoundScheduler.css';
import {
  Plus,
  Calendar,
  Clock,
  Upload,
  Edit,
  Trash2,
  Eye,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RoundScheduler = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch rounds from API
  const fetchRounds = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/rounds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setError('Authentication required. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch rounds: ${response.status}`);
      }

      const data = await response.json();
      // Use data.data which contains the array of rounds from ApiResponse
      setRounds(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rounds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span className="badge badge-warning">Draft</span>;
      case 'live': return <span className="badge badge-success">Live</span>;
      case 'completed': return <span className="badge badge-info">Completed</span>;
      default: return <span className="badge badge-warning">Draft</span>;
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditRound = (round) => {
    setSelectedRound(round);
    setShowModal(true);
  };

  const handleAddRound = () => {
    setSelectedRound(null);
    setShowModal(true);
  };

  const handleDeleteRound = async (roundId) => {
    const round = rounds.find((r) => r._id === roundId);
    const name = round ? round.name : 'this round';

    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/rounds/${roundId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        showMessage('Authentication required. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete round: ${response.status}`);
      }

      await fetchRounds();
      showMessage('Round deleted successfully!', 'success');
    } catch (err) {
      showMessage(`Failed to delete round: ${err.message}`);
      console.error('Error deleting round:', err);
    }
  };

  // Quick status update without opening modal
  const handleUpdateStatus = async (roundId, newStatus) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/rounds/${roundId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401) {
        showMessage('Authentication required. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update status: ${response.status}`);
      }

      await fetchRounds();
      showMessage(`Status updated to ${newStatus}!`, 'success');
    } catch (err) {
      showMessage(`Failed to update status: ${err.message}`);
      console.error('Error updating status:', err);
    }
  };

  const handleSaveRound = async (roundData) => {
    try {
      const token = getAuthToken();
      const url = selectedRound
        ? `${API_BASE_URL}/admin/rounds/${selectedRound._id}`
        : `${API_BASE_URL}/admin/rounds`;

      const method = selectedRound ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roundData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save round: ${response.status}`);
      }

      await fetchRounds();
      setShowModal(false);
      setSelectedRound(null);
      showMessage(`Round ${selectedRound ? 'updated' : 'created'} successfully!`, 'success');
    } catch (err) {
      showMessage(`Failed to save round: ${err.message}`);
      console.error('Error saving round:', err);
    }
  };

  if (loading) {
    return (
      <div className="round-scheduler">
        <div className="page-header">
          <h1 className="page-title">Round Scheduler</h1>
          <p className="page-subtitle">Manage hackathon rounds, schedules, and deadlines</p>
        </div>
        <div className="loading-container">
          <Loader size={32} className="spinner" />
          <p>Loading rounds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="round-scheduler">
      <div className="page-header">
        <h1 className="page-title">Round Scheduler</h1>
        <p className="page-subtitle">Manage hackathon rounds, schedules, and deadlines</p>
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

      <div className="action-bar">
        <div className="view-controls">
          <button
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            <Eye size={16} />
            List View
          </button>
        </div>
        <button className="btn btn-primary" onClick={handleAddRound}>
          <Plus size={16} />
          Add New Round
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="rounds-list">
          {rounds.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No Rounds Scheduled Yet</h3>
              <p>Get started by creating your first hackathon round</p>
              <button className="btn btn-primary" onClick={handleAddRound}>
                <Plus size={16} />
                Add New Round
              </button>
            </div>
          ) : (
            rounds.map((round) => (
              <div key={round._id} className="round-card card">
                <div className="card-body">
                  <div className="round-header">
                    <div className="round-info">
                      <h3 className="round-name">{round.name}</h3>
                      <p className="round-description">{round.description}</p>
                    </div>
                    <div className="round-status">
                      {getStatusBadge(round.status)}
                    </div>
                  </div>

                  <div className="round-details">
                    <div className="detail-item">
                      <Clock size={16} />
                      <div><strong>Start:</strong> {formatDateTime(round.startTime)}</div>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <div><strong>End:</strong> {formatDateTime(round.endTime)}</div>
                    </div>
                    <div className="detail-item">
                      <Upload size={16} />
                      <div><strong>Upload Deadline:</strong> {formatDateTime(round.uploadDeadline)}</div>
                    </div>
                  </div>

                  <div className="round-actions">
                    <select
                      className="form-select status-select"
                      value={round.status}
                      onChange={(e) => handleUpdateStatus(round._id, e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditRound(round)}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={() => handleDeleteRound(round._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="calendar-view">
          <div className="calendar-placeholder">
            <Calendar size={48} />
            <h3>Calendar View</h3>
            <p>Calendar view will be implemented here with a proper calendar component</p>
          </div>
        </div>
      )}

      {/* Add/Edit Round Modal */}
      {showModal && (
        <RoundModal
          round={selectedRound}
          onClose={() => {
            setShowModal(false);
            setSelectedRound(null);
          }}
          onSave={handleSaveRound}
        />
      )}
    </div>
  );
};

// Round Modal Component
const RoundModal = ({ round, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: round?.name || '',
    description: round?.description || '',
    startTime: round?.startTime ? new Date(round.startTime).toISOString().slice(0, 16) : '',
    endTime: round?.endTime ? new Date(round.endTime).toISOString().slice(0, 16) : '',
    uploadDeadline: round?.uploadDeadline ? new Date(round.uploadDeadline).toISOString().slice(0, 16) : '',
    status: round?.status || 'draft'
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Round name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.uploadDeadline) newErrors.uploadDeadline = 'Upload deadline is required';

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (new Date(formData.uploadDeadline) < new Date(formData.startTime) ||
      new Date(formData.uploadDeadline) > new Date(formData.endTime)) {
      newErrors.uploadDeadline = 'Upload deadline must be between start and end time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      // Convert datetime strings to proper format
      const submitData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        uploadDeadline: new Date(formData.uploadDeadline).toISOString()
      };

      await onSave(submitData);
    } catch (err) {
      console.error('Error in form submission:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{round ? 'Edit Round' : 'Add New Round'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Round Name</label>
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className={`form-input ${errors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  className={`form-input ${errors.startTime ? 'error' : ''}`}
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                {errors.startTime && <span className="error-text">{errors.startTime}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  className={`form-input ${errors.endTime ? 'error' : ''}`}
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
                {errors.endTime && <span className="error-text">{errors.endTime}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Deadline</label>
              <input
                type="datetime-local"
                name="uploadDeadline"
                className={`form-input ${errors.uploadDeadline ? 'error' : ''}`}
                value={formData.uploadDeadline}
                onChange={handleChange}
                required
              />
              {errors.uploadDeadline && <span className="error-text">{errors.uploadDeadline}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? <Loader size={16} className="spinner" /> : null}
              {round ? 'Update Round' : 'Create Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoundScheduler;