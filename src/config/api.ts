// API Configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003',
  timeout: 30000, // 30 seconds
  retries: 3,
};

// Helper to check if API is configured
export const isApiConfigured = (): boolean => {
  return Boolean(API_CONFIG.baseUrl && API_CONFIG.baseUrl !== 'http://localhost:5003');
};

// Development fallback message
export const getApiStatusMessage = (): string => {
  if (isApiConfigured()) {
    return `Connected to API at ${API_CONFIG.baseUrl}`;
  }
  return 'Using mock data - Set VITE_API_BASE_URL environment variable to connect to your backend';
};