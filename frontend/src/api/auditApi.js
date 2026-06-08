import axios from 'axios';

// Same server serves both frontend & backend — use relative URL
const API_BASE = '/api';

export const generateAudit = async (formData) => {
  const response = await axios.post(`${API_BASE}/generate-audit`, formData);
  return response.data;
};

export const getPdfUrl = (path) => {
  if (!path) return null;
  const cleanPath = path.startsWith('/api') ? path : `/api${path}`;
  if (window.location.port === '3000') {
    return `http://localhost:8000${cleanPath}`;
  }
  return cleanPath;
};
