import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

// Create axios instance with timeout and error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.log("API request error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      console.log("API server not available - running in offline mode");
      // Return mock data for offline mode
      return Promise.resolve({ data: getMockData(error.config.url) });
    }
    console.log("API response error:", error);
    return Promise.reject(error);
  },
);

// Mock data for offline mode
const getMockData = (url) => {
  if (url.includes("/teams")) {
    return {
      id: "TC-2024-001",
      teamId: "TC-2024-001",
      name: "Team Innovators",
      members: [
        {
          id: 1,
          name: "John Doe",
          role: "Team Lead",
          email: "john@example.com",
        },
        {
          id: 2,
          name: "Jane Smith",
          role: "Developer",
          email: "jane@example.com",
        },
        {
          id: 3,
          name: "Mike Johnson",
          role: "Designer",
          email: "mike@example.com",
        },
        {
          id: 4,
          name: "Sarah Wilson",
          role: "Developer",
          email: "sarah@example.com",
        },
      ],
      track: "Web Development",
      project: {
        name: "Smart Dashboard",
        description:
          "A comprehensive team management dashboard for hackathons.",
        status: "In Progress",
        githubUrl: "https://github.com/team-innovators/smart-dashboard",
        techStack: ["React", "Node.js", "MongoDB"],
      },
      submissions: [
        {
          id: 1,
          title: "Project Proposal",
          status: "Approved",
          submittedAt: "2024-02-15T10:00:00Z",
          feedback: "Excellent proposal!",
        },
        {
          id: 2,
          title: "MVP Demo",
          status: "Pending",
          submittedAt: "2024-02-18T15:30:00Z",
          feedback: null,
        },
        {
          id: 3,
          title: "Final Presentation",
          status: "Scheduled",
          submittedAt: null,
          feedback: null,
        },
      ],
      mentorSessions: [
        {
          id: 1,
          mentorName: "Dr. Sarah Wilson",
          topic: "Architecture Review",
          scheduledFor: "2024-02-20T14:00:00Z",
          status: "Scheduled",
        },
        {
          id: 2,
          mentorName: "Prof. James Brown",
          topic: "Technical Implementation",
          scheduledFor: "2024-02-22T11:00:00Z",
          status: "Pending",
        },
      ],
      currentRank: 5,
      score: 85,
      status: "Active",
      analytics: {
        commitCount: 156,
        codeReviews: 24,
        testsWritten: 89,
        bugsFixed: 15,
        velocity: 85,
        codeQuality: 95,
        collaborationScore: 4.8,
        onTimeDelivery: 92,
      },
    };
  }
  return null;
};

// Get all teams
export const getAllTeams = async () => {
  try {
    const response = await api.get("/teams");
    return response.data;
  } catch (error) {
    console.log("Error fetching teams:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch teams");
  }
};

// Get team by ID
export const getTeamById = async (id) => {
  try {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching team by ID:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch team");
  }
};

// Get team by team ID
export const getTeamByTeamId = async (teamId) => {
  try {
    const response = await api.get(`/teams/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching team by team ID:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch team");
  }
};

// Create new team
export const createTeam = async (teamData) => {
  try {
    const response = await api.post("/teams", teamData);
    return response.data;
  } catch (error) {
    console.log("Error creating team:", error);
    throw new Error(error.response?.data?.message || "Failed to create team");
  }
};

// Update team
export const updateTeam = async (id, teamData) => {
  try {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  } catch (error) {
    console.log("Error updating team:", error);
    throw new Error(error.response?.data?.message || "Failed to update team");
  }
};

// Add member contribution
export const addContribution = async (teamId, contributionData) => {
  try {
    const response = await api.post(
      `/teams/${teamId}/contributions`,
      contributionData,
    );
    return response.data;
  } catch (error) {
    console.log("Error adding contribution:", error);
    throw new Error(
      error.response?.data?.message || "Failed to add contribution",
    );
  }
};

// Get team analytics
export const getTeamAnalytics = async (teamId) => {
  try {
    const response = await api.get(`/teams/${teamId}/analytics`);
    return response.data;
  } catch (error) {
    console.log("Error fetching team analytics:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch team analytics",
    );
  }
};

// Get teams by category
export const getTeamsByCategory = async (category) => {
  try {
    const response = await api.get(`/teams/category/${category}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching teams by category:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch teams by category",
    );
  }
};

// Logout API call
export const logout = async () => {
  try {
    await api.post("/team_logout");
  } catch (error) {
    console.log("Error during logout:", error);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("team"); 
  window.location.href = "/signin";
};
