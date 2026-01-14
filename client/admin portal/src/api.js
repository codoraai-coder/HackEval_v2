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

// Leaderboard API functions
export const getLeaderboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard/ppt`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    throw new Error('Failed to fetch leaderboard');
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export const getTopLeaderboard = async (top = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard/ppt/top?top=${top}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    throw new Error('Failed to fetch top leaderboard');
  } catch (error) {
    console.error('Error fetching top leaderboard:', error);
    throw error;
  }
};

export const createLeaderboardEntry = async (entryData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/leaderboard/ppt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(entryData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to create leaderboard entry');
  } catch (error) {
    console.error('Error creating leaderboard entry:', error);
    throw error;
  }
};

export const uploadLeaderboardBulk = async (entries) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/leaderboard/ppt/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ entries })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    throw new Error('Failed to upload leaderboard');
  } catch (error) {
    console.error('Error uploading leaderboard:', error);
    throw error;
  }
};

export const deleteLeaderboardEntry = async (id) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/leaderboard/ppt/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return true;
    }
    throw new Error('Failed to delete leaderboard entry');
  } catch (error) {
    console.error('Error deleting leaderboard entry:', error);
    throw error;
  }
};

export const clearLeaderboard = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/leaderboard/ppt`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return true;
    }
    throw new Error('Failed to clear leaderboard');
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    throw error;
  }
};

// Round State API functions
export const getActiveRound = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/round-state/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || data.round;
    }
    throw new Error('Failed to fetch active round');
  } catch (error) {
    console.error('Error fetching active round:', error);
    throw error;
  }
};

export const setActiveRound = async (round) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/round-state/active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ round })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || data.round;
    }
    throw new Error('Failed to set active round');
  } catch (error) {
    console.error('Error setting active round:', error);
    throw error;
  }
};

export const getAllRoundStates = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/round-state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    throw new Error('Failed to fetch round states');
  } catch (error) {
    console.error('Error fetching round states:', error);
    throw error;
  }
};

export const deleteRoundState = async (id) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/round-state/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return true;
    }
    throw new Error('Failed to delete round state');
  } catch (error) {
    console.error('Error deleting round state:', error);
    throw error;
  }
};
