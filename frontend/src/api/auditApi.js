import axios from 'axios';

// Same server serves both frontend & backend — use relative URL
const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000/api`;

export const generateAudit = async (formData) => {
  const response = await axios.post(`${API_BASE}/generate-audit`, formData);
  return response.data;
};

export const getPdfUrl = (path) => {
  if (!path) return null;
  return `http://localhost:8000${path}`;
};
