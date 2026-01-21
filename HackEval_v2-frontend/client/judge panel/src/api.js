import { API_BASE_URL } from './config.js';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('judgeToken');
};

// Get judge profile
export const getJudgeProfile = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/judge/current`, {
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
    throw new Error('Failed to fetch judge profile');
  } catch (error) {
    console.error('Error fetching judge profile:', error);
    throw error;
  }
};

// Get all teams
export const getAllTeams = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/judge/team-evaluation/teams`, {
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
    throw new Error('Failed to fetch teams');
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// Get my evaluations
export const getMyEvaluations = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/judge/team-evaluation`, {
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
    throw new Error('Failed to fetch evaluations');
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    throw error;
  }
};

// Submit evaluation
export const submitEvaluation = async (evaluationData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/judge/team-evaluation/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(evaluationData)
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error('Failed to submit evaluation');
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    throw error;
  }
};


export const saveDraft = async (evaluationData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/judge/team-evaluation/save-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(evaluationData)
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error('Failed to save draft');
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};