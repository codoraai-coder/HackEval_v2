import { API_BASE_URL } from './config.js';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Mentor API functions
export const getMentors = async (params = {}) => {
  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/mentor?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to fetch mentors');
  } catch (error) {
    console.error('Error fetching mentors:', error);
    throw error;
  }
};

export const getMentorStatistics = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/mentor/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to fetch mentor statistics');
  } catch (error) {
    console.error('Error fetching mentor statistics:', error);
    throw error;
  }
};

export const createMentor = async (mentorData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/mentor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mentorData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to create mentor');
  } catch (error) {
    console.error('Error creating mentor:', error);
    throw error;
  }
};

export const updateMentor = async (id, mentorData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/mentor/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mentorData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to update mentor');
  } catch (error) {
    console.error('Error updating mentor:', error);
    throw error;
  }
};

export const deleteMentor = async (id) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/mentor/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return true;
    }
    throw new Error('Failed to delete mentor');
  } catch (error) {
    console.error('Error deleting mentor:', error);
    throw error;
  }
};

export const toggleMentorAvailability = async (id) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/mentor/${id}/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to toggle mentor availability');
  } catch (error) {
    console.error('Error toggling mentor availability:', error);
    throw error;
  }
};

export const addTeamToMentor = async (id, teamName) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/mentor/${id}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ teamName })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to add team to mentor');
  } catch (error) {
    console.error('Error adding team to mentor:', error);
    throw error;
  }
};

export const removeTeamFromMentor = async (id, teamName) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/mentor/${id}/teams`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ teamName })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to remove team from mentor');
  } catch (error) {
    console.error('Error removing team from mentor:', error);
    throw error;
  }
};