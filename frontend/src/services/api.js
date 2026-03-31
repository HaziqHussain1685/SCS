import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for long-running scans
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transform nmap scan results to match frontend component expectations
function transformScanResults(scanData) {
  if (!scanData) return null;
  
  return {
    ip_address: scanData.target_ip || scanData.ip,
    ip: scanData.target_ip || scanData.ip,
    name: `Camera (${scanData.target_ip || 'Unknown'})`,
    device_name: `Smart Camera`,
    status: scanData.status || 'offline',
    health_score: scanData.health_score || 0,
    risk_level: scanData.risk_level || 'UNKNOWN',
    open_ports: (scanData.open_ports || []).map((portNum, idx) => {
      const vuln = (scanData.vulnerabilities || []).find(v => v.port === portNum);
      return {
        port: portNum,
        service: vuln?.service || 'Unknown',
        risk: vuln?.risk || 'MEDIUM'
      };
    }),
    vulnerabilities: scanData.vulnerabilities || [],
    scan_time: scanData.scan_time,
    device_info: {
      model: 'Secura V380',
      firmware: 'Unknown',
      exposed_to_internet: false
    }
  };
}

export const scannerAPI = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // ============== PING / REACHABILITY ==============
  
  // Check if a single device is reachable
  pingDevice: async (ip) => {
    try {
      const response = await api.post('/ping', { ip });
      return response.data;
    } catch (err) {
      return {
        success: false,
        error: err.message,
        data: { status: 'error', reachable: false }
      };
    }
  },

  // Check multiple devices
  pingBatch: async (ips) => {
    try {
      const response = await api.post('/ping/batch', { ips });
      return response.data;
    } catch (err) {
      return {
        success: false,
        error: err.message,
        results: [],
        summary: { total: 0, online: 0, offline: 0 }
      };
    }
  },

  // ============== SCANNING ==============

  // Run comprehensive scan (nmap + ONVIF)
  runComprehensiveScan: async (target = '192.168.18.234') => {
    const response = await api.post('/scan/comprehensive', { target });
    return response.data;
  },

  // Run a new scan on target
  runScan: async (target = '192.168.18.234') => {
    const response = await api.post('/scan/nmap', { target });
    const transformed = transformScanResults(response.data.data);
    return {
      success: response.data.success,
      devices: transformed ? [transformed] : [],
      scan_time: response.data.data?.scan_time
    };
  },

  // Get latest scan results as devices
  getDevices: async () => {
    try {
      const response = await api.get('/scan/latest');
      const transformed = transformScanResults(response.data.data);
      return {
        success: response.data.success,
        devices: transformed ? [transformed] : []
      };
    } catch (err) {
      // If no latest scan, return empty
      return {
        success: false,
        devices: [],
        error: 'No previous scans found'
      };
    }
  },

  // Get scan history
  getHistory: async () => {
    const response = await api.get('/scan/history');
    const transformed = (response.data.scans || []).map(scan => transformScanResults(scan));
    return {
      success: response.data.success,
      scans: transformed,
      total: transformed.length
    };
  },

  // Get latest scan details
  getLatestScan: async () => {
    const response = await api.get('/scan/latest');
    const transformed = transformScanResults(response.data.data);
    return {
      success: response.data.success,
      data: transformed
    };
  },

  // Get device details from latest scan
  getDeviceDetails: async (target = '192.168.18.234') => {
    try {
      const response = await api.get('/scan/latest');
      return transformScanResults(response.data.data);
    } catch (err) {
      return null;
    }
  },

  // Run nmap scan from frontend (alias for runScan)
  runNmapScan: async (target = '192.168.18.234') => {
    const response = await api.post('/scan/nmap', { target });
    const transformed = transformScanResults(response.data.data);
    return {
      success: response.data.success,
      data: transformed
    };
  },

  // Run ONVIF security scan
  runOnvifScan: async (target = '192.168.18.234') => {
    const response = await api.post('/scan/onvif', { target });
    return response.data;
  },

  // Get latest ONVIF scan
  getLatestOnvifScan: async () => {
    try {
      const response = await api.get('/scan/onvif/latest');
      return response.data;
    } catch (err) {
      return {
        success: false,
        data: null,
        error: 'No previous ONVIF scans found'
      };
    }
  },

  // Get ONVIF scan history
  getOnvifHistory: async () => {
    const response = await api.get('/scan/onvif/history');
    return response.data;
  },

  // Clear scan history
  clearHistory: async () => {
    const response = await api.delete('/scan/clear');
    return response.data;
  },

  // Alert settings
  getAlertSettings: async () => {
    try {
      const response = await api.get('/alert-settings');
      return response.data;
    } catch (err) {
      console.error('Error fetching alert settings:', err);
      return {
        success: false,
        data: {
          emailAlerts: false,
          emailAddress: '',
          alertOnCritical: true,
          alertOnHigh: true,
          alertOnMedium: false,
          smsAlerts: false,
          phoneNumber: '',
          slackWebhook: '',
          slackAlerts: false
        }
      };
    }
  },

  saveAlertSettings: async (settings) => {
    try {
      const response = await api.post('/alert-settings', settings);
      return response.data;
    } catch (err) {
      console.error('Error saving alert settings:', err);
      return { success: false, error: err.message };
    }
  },

  // Camera groups
  getGroups: async () => {
    try {
      const response = await api.get('/groups');
      return response.data;
    } catch (err) {
      console.error('Error fetching groups:', err);
      return { success: false, data: [] };
    }
  },

  createGroup: async (groupData) => {
    try {
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (err) {
      console.error('Error creating group:', err);
      return { success: false, error: err.message };
    }
  },

  updateGroup: async (groupId, groupData) => {
    try {
      const response = await api.put(`/groups/${groupId}`, groupData);
      return response.data;
    } catch (err) {
      console.error('Error updating group:', err);
      return { success: false, error: err.message };
    }
  },

  deleteGroup: async (groupId) => {
    try {
      const response = await api.delete(`/groups/${groupId}`);
      return response.data;
    } catch (err) {
      console.error('Error deleting group:', err);
      return { success: false, error: err.message };
    }
  },

  // PDF export
  exportPDF: async (reportData) => {
    try {
      const response = await api.post('/export/pdf', reportData);
      return response.data;
    } catch (err) {
      console.error('Error exporting PDF:', err);
      return { success: false, error: err.message };
    }
  },

  // WS-Discovery network scanning
  discoverDevices: async () => {
    try {
      const response = await api.post('/discovery/scan');
      return response.data;
    } catch (err) {
      console.error('Error discovering devices:', err);
      return { 
        success: false, 
        error: err.message,
        data: { device_count: 0, devices: [] }
      };
    }
  },

  // Get discovery history
  getDiscoveryHistory: async () => {
    try {
      const response = await api.get('/discovery/history');
      return response.data;
    } catch (err) {
      console.error('Error fetching discovery history:', err);
      return { success: false, data: [] };
    }
  },

  // Get latest discovery results
  getLatestDiscovery: async () => {
    try {
      const response = await api.get('/discovery/latest');
      return response.data;
    } catch (err) {
      console.error('Error fetching latest discovery:', err);
      return { 
        success: false, 
        data: null,
        message: 'No discovery scans performed yet'
      };
    }
  },

  // Health check endpoints
  getHealthStatus: async (ip = null) => {
    try {
      const endpoint = ip ? `/health/status/${ip}` : '/health/status';
      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      console.error('Error fetching health status:', err);
      return { 
        success: false, 
        error: err.message,
        data: ip ? {} : {}
      };
    }
  },

  addDeviceToHealthCheck: async (ip) => {
    try {
      const response = await api.post(`/health/add/${ip}`);
      return response.data;
    } catch (err) {
      console.error(`Error adding device ${ip} to health check:`, err);
      return { success: false, error: err.message };
    }
  },

  removeDeviceFromHealthCheck: async (ip) => {
    try {
      const response = await api.post(`/health/remove/${ip}`);
      return response.data;
    } catch (err) {
      console.error(`Error removing device ${ip} from health check:`, err);
      return { success: false, error: err.message };
    }
  },

  startHealthMonitoring: async () => {
    try {
      const response = await api.post('/health/start');
      return response.data;
    } catch (err) {
      console.error('Error starting health monitoring:', err);
      return { success: false, error: err.message };
    }
  },

  stopHealthMonitoring: async () => {
    try {
      const response = await api.post('/health/stop');
      return response.data;
    } catch (err) {
      console.error('Error stopping health monitoring:', err);
      return { success: false, error: err.message };
    }
  },

  manualHealthCheck: async () => {
    try {
      const response = await api.post('/health/check');
      return response.data;
    } catch (err) {
      console.error('Error triggering manual health check:', err);
      return { success: false, error: err.message };
    }
  },

  // ===== PHASE 1: IoT Network Security Scanners =====
  
  // IoT Network Traffic Analysis
  scanIoTNet: async (target) => {
    try {
      const response = await api.post(`/scan/iotnet/${target}`);
      return response.data;
    } catch (err) {
      console.error('Error analyzing IoT network traffic:', err);
      return { success: false, error: err.message };
    }
  },

  // Telnet Shell Enumeration
  scanTelnetShell: async (target) => {
    try {
      const response = await api.post(`/scan/telnetshell/${target}`);
      return response.data;
    } catch (err) {
      console.error('Error enumerating telnet shell:', err);
      return { success: false, error: err.message };
    }
  },

  // Network Flows Analysis
  scanNetFlows: async (target) => {
    try {
      const response = await api.post(`/scan/netflows/${target}`);
      return response.data;
    } catch (err) {
      console.error('Error analyzing network flows:', err);
      return { success: false, error: err.message };
    }
  },

  // ===== PHASE 2: Firmware & Hardware Security Scanners =====

  // ChipSec - UEFI/BIOS Firmware Security Analysis
  scanChipSec: async (target) => {
    try {
      const response = await api.post(`/scan/chipsec/${target}`);
      return response.data;
    } catch (err) {
      console.error('Error analyzing firmware security:', err);
      return { success: false, error: err.message };
    }
  },

  // FFind - Firmware File Extraction & Analysis
  scanFFInd: async (target) => {
    try {
      const response = await api.post(`/scan/ffind/${target}`);
      return response.data;
    } catch (err) {
      console.error('Error extracting firmware:', err);
      return { success: false, error: err.message };
    }
  },

  // PicoCom - UART/Serial Console Access Testing
  scanPicoCom: async (target) => {
    try {
      const response = await api.post(`/scan/picocom/${target}`);
      return response.data;
    } catch (err) {
      console.error('Error scanning serial console:', err);
      return { success: false, error: err.message };
    }
  },

  // ===== COMPREHENSIVE: Full IoT Security Audit =====

  // Run all security scanners in one comprehensive scan
  runComprehensiveIoTSecurityScan: async (target) => {
    try {
      const response = await api.post(`/scan/iot-security/${target}`);
      return response.data;
    } catch (err) {
      console.error('Error running comprehensive IoT security scan:', err);
      return { 
        success: false, 
        error: err.message,
        data: { scanners_completed: 0 }
      };
    }
  }
};

