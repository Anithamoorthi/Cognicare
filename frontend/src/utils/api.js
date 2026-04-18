// Centralized API configuration
// This allows switching between local and production environments easily

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default API_BASE_URL;
