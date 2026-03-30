// React core imports
import React, { useState, useEffect } from 'react';

// Layout and dashboard components
import Sidebar from '../components/layout/Sidebar';  // Left navigation sidebar
import AttackFeed from '../components/dashboard/AttackFeed';  // Live security threat feed
import StatsBar from '../components/dashboard/StatsBar';  // Top statistics bar
import HealthScoreGrid from '../components/dashboard/HealthScoreGrid';  // Security score cards
import DeviceTable from '../components/dashboard/DeviceTable';  // Main device list table
import VulnerabilityTimeline from '../components/dashboard/VulnerabilityTimeline';  // Timeline visualization
import VulnerabilityChart from '../components/dashboard/VulnerabilityChart';  // Risk distribution chart
import VulnerabilitiesView from '../components/dashboard/VulnerabilitiesView';  // Vulnerability analysis view

// Modal components for feature interactions
import DeviceModal from '../components/dashboard/DeviceModal';  // Device detail view
import AddCameraModal from '../components/dashboard/AddCameraModal';  // Manual camera addition
import AlertSettingsModal from '../components/dashboard/AlertSettingsModal';  // Email/SMS configuration
import ExportReportModal from '../components/dashboard/ExportReportModal';  // PDF export
import GroupManagementModal from '../components/dashboard/GroupManagementModal';  // Camera grouping
import DiscoveryModal from '../components/dashboard/DiscoveryModal';  // Network device discovery

// Other views
import HistoryView from './HistoryView';  // Historical scan data view
import { ScanInterface } from '../components/dashboard/ScanInterface';  // Real-time nmap scan interface
import { ONVIFScanInterface } from '../components/dashboard/ONVIFScanInterface';  // ONVIF security scan interface
import ComprehensiveAuditReport from '../components/dashboard/ComprehensiveAuditReport';  // Professional 8-scanner audit report
import { ScanProgressIndicator } from '../components/dashboard/ScanProgressIndicator';  // Scan progress tracking

// UI components
import Button from '../components/ui/Button';  // Reusable button component
import LoadingSpinner from '../components/ui/LoadingSpinner';  // Loading indicator

// Services and utilities
import { scannerAPI } from '../services/api';  // Backend API client
import { calculateAverageHealth, getCriticalIssuesCount, formatTimeAgo } from '../utils/helpers';  // Data processing utilities
import { useTheme } from '../contexts/ThemeContext';  // Dark mode toggle
import { RefreshCw, PlayCircle, Plus, Bell, FileText, Folder, Moon, Sun, Wifi } from 'lucide-react';  // Icon library

/**
 * Dashboard - Main application view orchestrating all security monitoring features
 * Manages device scanning, display, and interaction with all modal features
 */
const Dashboard = () => {
  // ===== THEME CONTEXT =====
  const { isDark, toggleTheme } = useTheme();
  
  // ===== CORE STATE =====
  // Device data and loading states
  const [devices, setDevices] = useState([]);  // Combined list of scanned and manual cameras
  const [loading, setLoading] = useState(true);  // Initial data fetch loading state
  const [scanning, setScanning] = useState(false);  // Active scan operation in progress
  const [scanStartTime, setScanStartTime] = useState(null);  // Track scan start for progress indicator
  const [selectedDevice, setSelectedDevice] = useState(null);  // Device selected for detail view
  const [lastScanTime, setLastScanTime] = useState(null);  // Timestamp of most recent scan
  const [error, setError] = useState(null);  // Error message for user display
  const [scanResults, setScanResults] = useState(null);  // Comprehensive scan results from unified scanner
  const [healthStatus, setHealthStatus] = useState({});  // Health check status for all monitored IPs
  const [healthCheckLastUpdated, setHealthCheckLastUpdated] = useState(null);  // Last health check update time
  
  // ===== VIEW STATE =====
  const [activeView, setActiveView] = useState('dashboard');  // Current view (dashboard or history)
  
  // ===== MODAL VISIBILITY STATE =====
  // Track which modal is currently open
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);  // Manual camera addition modal
  const [showAlertSettings, setShowAlertSettings] = useState(false);  // Email/SMS alert configuration
  const [showExportModal, setShowExportModal] = useState(false);  // PDF export modal
  const [showGroupManagement, setShowGroupManagement] = useState(false);  // Camera grouping modal
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);  // Network device discovery modal
  
  // ===== FEATURE DATA =====
  const [manualCameras, setManualCameras] = useState([]);  // User-added cameras (localStorage)
  const [groups, setGroups] = useState([]);  // Camera groups for organization

  // ===== LIFECYCLE EFFECTS =====
  
  /**
   * Load manually added cameras from localStorage on component mount
   * Manual cameras persist across browser sessions and API outages
   */
  useEffect(() => {
    const savedCameras = localStorage.getItem('manualCameras');
    if (savedCameras) {
      try {
        setManualCameras(JSON.parse(savedCameras));  // Parse and restore saved cameras
      } catch (err) {
        console.error('Error loading manual cameras:', err);  // Handle corrupted localStorage
      }
    }
  }, []);  // Run once on mount

  /**
   * Fetch initial device data from backend API on component mount
   * Retrieves most recent scan results if available
   */
  useEffect(() => {
    fetchDevices();
    fetchHealthStatus();  // Get initial health status
  }, []);  // Run once on mount

  /**
   * Periodically fetch health status every 5 seconds
   * Keeps device online/offline status updated in real-time
   */
  useEffect(() => {
    // Fetch health status immediately
    fetchHealthStatus();
    
    // Set up interval for periodic health checks
    const healthCheckInterval = setInterval(() => {
      fetchHealthStatus();
    }, 5000);  // Update every 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(healthCheckInterval);
  }, []);  // Run once on mount

  // ===== DATA FETCHING FUNCTIONS =====
  
  /**
   * Fetch device list from backend API and combine with manual cameras
   * Gracefully handles API failures by showing manual cameras only
   */
  const fetchDevices = async () => {
    try {
      setLoading(true);  // Show loading spinner
      setError(null);  // Clear previous errors
      
      // Query backend for latest scan results
      const response = await scannerAPI.getDevices();
      
      if (response.success && response.devices) {
        // Merge scanned devices with user-added manual cameras
        const combinedDevices = [...response.devices, ...manualCameras];
        setDevices(combinedDevices);
        
        // Update last scan timestamp from API response
        if (combinedDevices.length > 0) {
          setLastScanTime(response.devices[0]?.scan_time || new Date().toISOString());
        }
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      
      // Fallback: If API unavailable but manual cameras exist, show them
      if (manualCameras.length > 0) {
        setDevices(manualCameras);
        setError('Scanner API unavailable. Showing manual cameras only.');
      } else {
        setError('Failed to fetch devices. Please run a scan first.');
      }
    } finally {
      setLoading(false);  // Hide loading spinner
    }
  };

  /**
   * Fetch health status from backend for all monitored devices
   * Updates device online/offline status based on ping results
   */
  const fetchHealthStatus = async () => {
    try {
      const response = await scannerAPI.getHealthStatus();
      
      if (response.success && response.data) {
        setHealthStatus(response.data);
        setHealthCheckLastUpdated(new Date());
        
        // Update device status based on health check results
        setDevices(prevDevices => 
          prevDevices.map(device => {
            const healthInfo = response.data[device.ip_address] || response.data[device.ip];
            if (healthInfo) {
              // Map health status to device status
              // "online" -> "online"
              // "offline" -> "offline"  
              // "unknown" -> "checking" (device recently added, waiting for first check)
              const mappedStatus = healthInfo.status === 'online' 
                ? 'online' 
                : healthInfo.status === 'offline'
                ? 'offline'
                : 'checking';  // Show as "checking" while waiting for first ping
              
              return {
                ...device,
                status: mappedStatus,
                last_health_check: healthInfo.last_check
              };
            }
            return device;
          })
        );
      }
    } catch (err) {
      console.error('Error fetching health status:', err);
      // Don't show error to user - health check is background operation
    }
  };

  /**
   * Add device to continuous health monitoring
   * @param {string} ipAddress - IP address of device to monitor
   */
  const addDeviceToHealthMonitoring = async (ipAddress) => {
    try {
      const response = await scannerAPI.addDeviceToHealthCheck(ipAddress);
      if (response.success) {
        console.log(`Device ${ipAddress} added to health monitoring`);
      }
    } catch (err) {
      console.error(`Error adding device to health monitoring:`, err);
    }
  };

  /**
   * Trigger comprehensive network scan of target camera
   * Runs both nmap and ONVIF scanners simultaneously for complete analysis
   * Posts scan request to backend and displays unified results
   * Updates all dashboard components with fresh real-time data
   */
  const runScan = async () => {
    try {
      setScanning(true);  // Show scanning state in UI
      setScanStartTime(new Date().toISOString());  // Track progress
      setError(null);  // Clear previous errors
      setScanResults(null);  // Clear previous results
      
      // Get target IP from first device if available, otherwise use default
      const targetIP = devices.length > 0 ? devices[0].ip_address : '192.168.18.234';
      
      // ===== TRIGGER COMPREHENSIVE 8-SCANNER AUDIT =====
      // Runs all scanners: nmap, ONVIF, iotnet, telnetshell, netflows, chipsec, ffind, picocom
      const response = await scannerAPI.runComprehensiveScan(targetIP);
      
      if (response && response.success) {
        const auditData = response.data;
        
        console.log('✓ Comprehensive audit completed:', {
          risk_level: auditData.overall_risk_level,
          risk_score: auditData.overall_risk_score,
          vulnerabilities_found: auditData.summary.vulnerabilities_found,
          scanners_completed: auditData.summary.scanners_completed
        });
        
        // ===== STORE COMPLETE AUDIT RESULTS =====
        // Includes all 8 scanner outputs, findings aggregation, and professional recommendations
        setScanResults(auditData);
        setLastScanTime(auditData.timestamp);
        
        // ===== UPDATE DEVICE WITH AUDIT RESULTS =====
        // Transform comprehensive audit into device representation for dashboard display
        const transformedDevice = {
          ip_address: auditData.target_ip,
          ip: auditData.target_ip,
          name: `Smart Camera (${auditData.target_ip})`,
          device_name: 'Smart Camera',
          status: auditData.device_profile?.status || 'online',
          health_score: 100 - (auditData.overall_risk_score * 10),  // Convert risk score to health score
          risk_level: auditData.overall_risk_level,
          risk_score: auditData.overall_risk_score,
          
          // Device profile information
          device_profile: auditData.device_profile,
          open_ports: auditData.device_profile?.open_ports || [],
          services_detected: auditData.device_profile?.services_detected || 0,
          
          // ===== COMPREHENSIVE AUDIT DATA =====
          // All scanner results and findings
          audit_data: {
            scanners: auditData.scanners,
            all_findings: auditData.all_findings,
            recommendations: auditData.recommendations,
            summary: auditData.summary,
            scan_duration: auditData.scan_duration_seconds,
            
            // Severity breakdown
            critical_issues: auditData.summary.critical_issues,
            high_issues: auditData.summary.high_issues,
            medium_issues: auditData.summary.medium_issues,
            total_vulnerabilities: auditData.summary.vulnerabilities_found
          },
          
          // Individual scanner data
          scanners: {
            nmap: auditData.scanners.nmap?.data || {},
            onvif: auditData.scanners.onvif?.data || {},
            iotnet: auditData.scanners.iotnet?.data || {},
            telnetshell: auditData.scanners.telnetshell?.data || {},
            netflows: auditData.scanners.netflows?.data || {},
            chipsec: auditData.scanners.chipsec?.data || {},
            ffind: auditData.scanners.ffind?.data || {},
            picocom: auditData.scanners.picocom?.data || {}
          },
          
          // Professional recommendations for remediation
          recommendations: auditData.recommendations,
          
          // Timestamp
          scan_time: auditData.timestamp,
          last_scanned: auditData.timestamp
        };
        
        // Update devices list with comprehensive audit data
        setDevices([transformedDevice]);
        
        // ===== AUTO-ADD TO HEALTH MONITORING =====
        // Register for continuous background ping checks
        await addDeviceToHealthMonitoring(auditData.target_ip);
        
      } else {
        setError('Failed to run comprehensive scan. Please check if the scanner API is running.');
      }
    } catch (err) {
      console.error('Error running comprehensive scan:', err);
      setError('Failed to run comprehensive scan. Error: ' + (err.message || 'Unknown error'));
    } finally {
      setScanning(false);  // Hide scanning state
      setScanStartTime(null);  // Clear progress tracker
    }
  };

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle device row click - open device detail modal
   * @param {Object} device - Device object to display in modal
   */
  const handleDeviceClick = (device) => {
    setSelectedDevice(device);  // Set selected device to trigger modal display
  };

  /**
   * Handle rescan action from device modal
   * Closes modal and triggers fresh network scan
   */
  const handleRescan = async () => {
    setSelectedDevice(null);  // Close device modal
    await runScan();  // Trigger new scan
  };

  /**
   * Handle manual camera addition from AddCameraModal
   * Persists camera to localStorage and adds to device list
   * @param {Object} newCamera - Newly created camera object
   */
  const handleAddCamera = (newCamera) => {
    // Add to manual cameras array
    const updatedManualCameras = [...manualCameras, newCamera];
    setManualCameras(updatedManualCameras);
    
    // Persist to localStorage for cross-session persistence
    localStorage.setItem('manualCameras', JSON.stringify(updatedManualCameras));
    
    // Add to current device display list
    setDevices(prev => [...prev, newCamera]);
    
    // Close the add camera modal
    setShowAddCameraModal(false);
  };

  /**
   * Handle manual camera deletion
   * Removes camera from localStorage and device list
   * @param {string} cameraIp - IP address of camera to delete
   */
  const handleDeleteCamera = (cameraIp) => {
    // Filter out deleted camera from manual cameras
    const updatedManualCameras = manualCameras.filter(cam => cam.ip_address !== cameraIp);
    setManualCameras(updatedManualCameras);
    
    // Update localStorage
    localStorage.setItem('manualCameras', JSON.stringify(updatedManualCameras));
    
    // Remove from device display list
    setDevices(prev => prev.filter(dev => dev.ip_address !== cameraIp));
  };

  /**
   * Handle device selection from WS-Discovery
   * Scans the selected discovered devices
   * @param {Array<string>} selectedIPs - Array of IP addresses to scan
   */
  const handleSelectDiscoveredDevice = async (selectedIPs) => {
    if (!selectedIPs || selectedIPs.length === 0) return;

    try {
      // Scan first selected device
      const targetIP = selectedIPs[0];
      
      setScanning(true);
      setScanStartTime(new Date().toISOString());
      setError(null);
      setScanResults(null);

      // Trigger comprehensive scan on selected device
      const response = await scannerAPI.runComprehensiveScan(targetIP);

      if (response && response.success) {
        const scanData = response.data;

        // Store comprehensive scan results
        setScanResults(scanData);
        setLastScanTime(scanData.scan_time || new Date().toISOString());

        // Transform scan results into device format
        const transformedDevice = {
          ip_address: scanData.target_ip || targetIP,
          ip: scanData.target_ip || targetIP,
          name: `Smart Camera (${scanData.target_ip || targetIP})`,
          device_name: 'Smart Camera',
          status: (scanData.nmap?.status === 'online') ? 'online' : 'offline',
          health_score: scanData.global_health_score || 0,
          risk_level: scanData.global_risk_level || 'UNKNOWN',
          open_ports: scanData.nmap?.open_ports || [],
          vulnerabilities: scanData.combined_vulnerabilities || [],
          scan_time: scanData.scan_time,
          nmap_data: scanData.nmap,
          onvif_data: scanData.onvif,
          device_info: {
            model: scanData.onvif?.device_info?.model || 'Unknown',
            firmware: scanData.onvif?.device_info?.firmware || 'Unknown',
            exposed_to_internet: false
          }
        };

        // Update devices list with fresh scan data
        setDevices([transformedDevice]);

        // ===== AUTO-ADD TO HEALTH MONITORING =====
        // Automatically register discovered device for continuous ping monitoring
        await addDeviceToHealthMonitoring(targetIP);

      } else {
        setError('Failed to scan discovered device. Please try again');
      }
    } catch (err) {
      console.error('Error scanning discovered device:', err);
      setError('Failed to scan device. Please check if the scanner API is running.');
    } finally {
      setScanning(false);
      setScanStartTime(null);
    }
  };

  // ===== STATISTICS CALCULATIONS =====
  // Compute real-time statistics from device array for dashboard display
  
  const stats = {
    total: devices.length,  // Total device count
    online: devices.filter(d => d.status === 'online').length,  // Reachable devices
    offline: devices.filter(d => d.status === 'offline').length,  // Unreachable devices
    critical: devices.filter(d => d.risk_level === 'CRITICAL').length,  // Critical risk devices
    high: devices.filter(d => d.risk_level === 'HIGH').length,  // High risk devices
    medium: devices.filter(d => d.risk_level === 'MEDIUM').length,  // Medium risk devices
    low: devices.filter(d => d.risk_level === 'LOW').length,  // Low risk devices
    avgHealth: calculateAverageHealth(devices),  // Average health score across all devices
    lastScanTime: lastScanTime ? formatTimeAgo(lastScanTime) : 'Never',  // Human-readable time since scan
    autoRefresh: false,  // Auto-refresh toggle state
  };

  // Simplified stats object for components that need fewer fields
  const deviceStats = {
    total: stats.total,
    online: stats.online,
    critical: stats.critical,
    high: stats.high,
    low: stats.low,
  };

  // Scan status information for UI feedback
  const scanStatus = {
    isScanning: scanning,
    progress: 0,
    currentDevice: '',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        deviceStats={deviceStats}
        scanStatus={scanStatus}
      />

      {/* Main Content */}
      <main className="flex-1 ml-60 p-8">
        {/* Render based on active view */}
        {activeView === 'scan' ? (
          <ScanInterface />
        ) : activeView === 'onvif-scan' ? (
          <ONVIFScanInterface />
        ) : activeView === 'vulnerabilities' ? (
          <VulnerabilitiesView />
        ) : activeView === 'history' ? (
          <HistoryView />
        ) : activeView === 'settings' ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-2">Settings</h2>
            <p className="text-text-tertiary dark:text-gray-400">Settings page coming soon...</p>
          </div>
        ) : (
          <>
            {/* Dashboard View */}
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-heading font-bold text-text-primary dark:text-white mb-2">
                  Security Dashboard
                </h1>
                <p className="text-text-tertiary dark:text-gray-400">
                  Monitor and protect your camera network in real-time
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={isDark ? Sun : Moon}
                  onClick={toggleTheme}
                  title={isDark ? 'Light Mode' : 'Dark Mode'}
                >
                  {isDark ? 'Light' : 'Dark'}
                </Button>
                <Button
                  variant="outline"
                  icon={Bell}
                  onClick={() => setShowAlertSettings(true)}
                  title="Alert Settings"
                >
                  Alerts
                </Button>
                <Button
                  variant="outline"
                  icon={Folder}
                  onClick={() => setShowGroupManagement(true)}
                  title="Group Management"
                >
                  Groups
                </Button>
                <Button
                  variant="outline"
                  icon={FileText}
                  onClick={() => setShowExportModal(true)}
                  disabled={devices.length === 0}
                  title="Export PDF Report"
                >
                  Export
                </Button>
                <Button
                  variant="secondary"
                  icon={Plus}
                  onClick={() => setShowAddCameraModal(true)}
                >
                  Add Camera
                </Button>
                <Button
                  variant="secondary"
                  icon={Wifi}
                  onClick={() => setShowDiscoveryModal(true)}
                  title="Discover ONVIF cameras on your network"
                >
                  Discover
                </Button>
                <Button
                  variant="ghost"
                  icon={RefreshCw}
                  onClick={fetchDevices}
                  disabled={scanning}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  icon={PlayCircle}
                  onClick={runScan}
                  disabled={scanning}
                >
                  {scanning ? 'Scanning...' : 'Run Scan'}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {/* Comprehensive Audit Report */}
            {scanResults && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-text-primary">Comprehensive Security Audit Report</h2>
                  <Button
                    variant="secondary"
                    onClick={() => setScanResults(null)}
                  >
                    ✕ Close Report
                  </Button>
                </div>
                <ComprehensiveAuditReport auditData={scanResults} device={devices[0]} />
              </div>
            )}

            {/* No Devices State */}
            {!loading && devices.length === 0 && !error && !scanResults && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📹</div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">No Devices Found</h2>
                <p className="text-text-tertiary mb-6">
                  Run your first scan to discover cameras on your network
                </p>
                <Button variant="primary" icon={PlayCircle} onClick={runScan}>
                  Run First Scan
                </Button>
              </div>
            )}

            {/* Dashboard Content */}
            {devices.length > 0 && (
              <>
                {/* Attack Feed */}
                <AttackFeed />

                {/* Stats Bar */}
                <StatsBar stats={stats} />

                {/* Health Score Grid */}
                <HealthScoreGrid devices={devices} onDeviceClick={handleDeviceClick} />

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
                  <div className="lg:col-span-2">
                    <DeviceTable devices={devices} onDeviceClick={handleDeviceClick} />
                  </div>
                  <div className="flex flex-col h-full">
                    <VulnerabilityChart devices={devices} />
                  </div>
                </div>

                {/* Vulnerability Timeline */}
                <VulnerabilityTimeline devices={devices} />
              </>
            )}

            {/* Device Modal */}
            {selectedDevice && (
              <DeviceModal
                device={selectedDevice}
                onClose={() => setSelectedDevice(null)}
                onRescan={handleRescan}
                onDelete={selectedDevice.manual ? handleDeleteCamera : null}
              />
            )}

            {/* Add Camera Modal */}
            <AddCameraModal
              isOpen={showAddCameraModal}
              onClose={() => setShowAddCameraModal(false)}
              onAddCamera={handleAddCamera}
            />

            {/* Alert Settings Modal */}
            <AlertSettingsModal
              isOpen={showAlertSettings}
              onClose={() => setShowAlertSettings(false)}
            />

            {/* Export Report Modal */}
            <ExportReportModal
              isOpen={showExportModal}
              onClose={() => setShowExportModal(false)}
              devices={devices}
              scanResults={scanResults}
            />

            {/* Group Management Modal */}
            <GroupManagementModal
              isOpen={showGroupManagement}
              onClose={() => setShowGroupManagement(false)}
              devices={devices}
              onGroupsUpdated={() => {
                // Refresh groups data
                console.log('Groups updated');
              }}
            />

            {/* Network Device Discovery Modal */}
            <DiscoveryModal
              isOpen={showDiscoveryModal}
              onClose={() => setShowDiscoveryModal(false)}
              onSelectDevice={handleSelectDiscoveredDevice}
            />

            {/* Scan Progress Indicator */}
            <ScanProgressIndicator isScanning={scanning} startTime={scanStartTime} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
