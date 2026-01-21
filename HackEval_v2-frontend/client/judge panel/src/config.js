export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";



  // Environment configuration
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Evaluation parameters with weights
export const EVALUATION_PARAMETERS = {
  problem_solution_fit: { weight: 0.10, label: 'Problem-Solution Fit' },
  functionality_features: { weight: 0.20, label: 'Functionality & Features' },
  technical_feasibility: { weight: 0.20, label: 'Technical Feasibility & Robustness' },
  innovation_creativity: { weight: 0.15, label: 'Innovation & Creativity' },
  user_experience: { weight: 0.15, label: 'User Experience (UI/UX)' },
  impact_value: { weight: 0.10, label: 'Impact & Value Proposition' },
  presentation_demo_quality: { weight: 0.05, label: 'Presentation & Demo Quality' },
  team_collaboration: { weight: 0.05, label: 'Team Collaboration' }
};

// Score ranges and colors
export const SCORE_RANGES = {
  excellent: { min: 8, color: '#10B981', label: 'Excellent' },
  good: { min: 6, max: 7.9, color: '#F59E0B', label: 'Good' },
  average: { min: 4, max: 5.9, color: '#EF4444', label: 'Needs Improvement' },
  poor: { max: 3.9, color: '#DC2626', label: 'Poor' }
};