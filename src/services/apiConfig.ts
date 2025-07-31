// API Configuration - Switch between mock and real API in one place
import { apiClient as realApiClient } from './api';
import { mockApiClient } from './mockApi';

// 🎛️ CONFIGURATION: Change this to switch between mock and real API
// Can be controlled via environment variable VITE_USE_MOCK_API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || true; // Default to true for development

// Export the appropriate API client based on configuration
export const apiClient = USE_MOCK_API ? mockApiClient : realApiClient;

// Export configuration for debugging
export const apiConfig = {
    useMockApi: USE_MOCK_API,
    apiType: USE_MOCK_API ? 'Mock API' : 'Real API',
    baseUrl: USE_MOCK_API ? 'Mock Data' : (import.meta.env.VITE_API_BASE_URL || '/api'),
    environment: import.meta.env.MODE
};

// Log current API configuration
console.log('🔧 API Configuration:', apiConfig);
