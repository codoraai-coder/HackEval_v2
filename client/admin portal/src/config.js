// Get base URL from env, strip trailing /api if present
const envUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = envUrl.replace(/\/api\/?$/, "");
