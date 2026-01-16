// Get base URL from env, strip trailing /api if present
const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const API_BASE_URL = envUrl.replace(/\/api\/?$/, "");
