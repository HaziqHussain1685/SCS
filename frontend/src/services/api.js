import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scannerAPI = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Run a new scan
  runScan: async () => {
    const response = await api.post('/scan');
    return response.data;
  },

  // Get current devices
  getDevices: async () => {
    const response = await api.get('/devices');
    return response.data;
  },

  // Get scan history
  getHistory: async () => {
    const response = await api.get('/history');
    return response.data;
  },

  // Get device details
  getDeviceDetails: async (deviceName) => {
    const response = await api.get(`/device/${deviceName}`);
    return response.data;
  },
};

export default api;
