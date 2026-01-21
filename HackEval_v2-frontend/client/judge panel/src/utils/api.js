import { API_BASE_URL } from "../config";
const AAPI_BASE_URL = API_BASE_URL;

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('judgeToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Helper function for safe JSON parsing
const safeJsonParse = async (response, url) => {
    const responseText = await response.text();
    
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        console.error('Response is not JSON:', responseText.substring(0, 200));
        throw new Error(`Server returned HTML instead of JSON. Check if backend is running and URL is correct: ${url}`);
    }
    
    if (!response.ok) {
        const errorMsg = data.message || data.detail || `HTTP ${response.status}: Request failed`;
        throw new Error(errorMsg);
    }
    
    return data;
};

// Judge authentication
export const judgeLogin = async (username, password) => {
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        console.log('Attempting login with:', { username, password: '***' });
        console.log('API URL:', `${AAPI_BASE_URL}/judge/login`);

        const response = await fetch(`${AAPI_BASE_URL}/judge/login`, {
            method: 'POST',
            body: formData,
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('Backend error:', errorData);
            throw new Error(errorData.detail || `HTTP ${response.status}: Login failed`);
        }

        const data = await response.json();
        console.log('Login successful, received token');
        return data;
    } catch (error) {
        console.error('Login error details:', error);
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to backend server. Please check if the server is running on port 8000.');
        }
        throw error;
    }
};

// Get judge profile
export const getJudgeProfile = async () => {
    const url = `${AAPI_BASE_URL}/judge/profile`;
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    return await safeJsonParse(response, url);
};

// Get assigned teams
export const getAssignedTeams = async (roundId = null) => {
    const url = roundId 
        ? `${AAPI_BASE_URL}/judge/assigned-teams?round_id=${roundId}`
        : `${AAPI_BASE_URL}/judge/assigned-teams`;
    
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    return await safeJsonParse(response, url);
};

// Submit evaluation (CORRECTED URL based on your app.js route)
export const submitEvaluation = async (teamId, evaluation) => {
    const url = `${AAPI_BASE_URL}/judge/team-evaluation/submit`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            teamId: teamId,
            ...evaluation
        }),
    });

    return await safeJsonParse(response, url);
};

// Get evaluations
export const getEvaluations = async (roundId = null, teamId = null) => {
    let url = `${AAPI_BASE_URL}/judge/evaluation`;
    const params = new URLSearchParams();
    
    if (roundId) params.append('round_id', roundId);
    if (teamId) params.append('team_id', teamId);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    return await safeJsonParse(response, url);
};

// Get judge's own evaluations (CORRECTED URL based on your app.js route)
export const getMyEvaluations = async () => {
  const url = `${AAPI_BASE_URL}/judge/team-evaluation`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  const parsed = await safeJsonParse(response, url);
  console.log(response);
  if (!Array.isArray(parsed.data)) {
    throw new Error("Malformed API response: expected data array");
  }
  return parsed.data; // return the actual array
};


// Get specific evaluation by teamId (CORRECTED URL)
export const getEvaluation = async (teamId) => {
    const url = `${AAPI_BASE_URL}/judge/team-evaluation/${teamId}`;
    
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    return await safeJsonParse(response, url);
};

// Save draft evaluation (CORRECTED URL)
export const saveDraftEvaluation = async (teamId, evaluation) => {
    const url = `${AAPI_BASE_URL}/judge/team-evaluation/save-draft`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            teamId: teamId,
            ...evaluation
        }),
    });

    return await safeJsonParse(response, url);
};

// Get team details
export const getTeamDetails = async (teamId) => {
    const url = `${AAPI_BASE_URL}/team-ps/teams/${teamId}`;
    
    try {
        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        const data = await safeJsonParse(response, url);
        return data.data || data;
        
    } catch (error) {
        console.error('getTeamDetails error:', error);
        throw error;
    }
};

// Get all teams with problem statement details
export const getAllTeams = async () => {
    const url = `${AAPI_BASE_URL}/judge/all-teams`;
    
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    return await safeJsonParse(response, url);
};

// Count evaluations by team name (CORRECTED URL)
export const countEvaluationsByTeamName = async (teamName) => {
    const url = `${AAPI_BASE_URL}/judge/evaluation/count-by-team-name/${encodeURIComponent(teamName)}`;
    
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    return await safeJsonParse(response, url);
};

// Debug function to check API configuration
export const debugApiConfig = () => {
    console.log('=== API Configuration Debug ===');
    console.log('API Base URL:', AAPI_BASE_URL);
    console.log('Judge Token:', localStorage.getItem('judgeToken') ? 'Present' : 'Missing');
    console.log('Expected My Evaluations URL:', `${AAPI_BASE_URL}/judge/team-evaluation/my-evaluations`);
    console.log('Expected Submit Evaluation URL:', `${AAPI_BASE_URL}/judge/team-evaluation/submit`);
    console.log('Expected Get Evaluation URL:', `${AAPI_BASE_URL}/judge/team-evaluation/:teamId`);
    console.log('=============================');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('judgeToken');
    return !!token;
};

// Logout
export const logout = () => {
    localStorage.removeItem('judgeToken');
    localStorage.removeItem('judgeUsername');
    window.location.href = '/';
};

// Test API connectivity
export const testApiConnection = async () => {
    try {
        const response = await fetch(`${AAPI_BASE_URL}/`);
        const data = await response.json();
        console.log('API Connection Test:', data);
        return true;
    } catch (error) {
        console.error('API Connection Failed:', error);
        return false;
    }
};


