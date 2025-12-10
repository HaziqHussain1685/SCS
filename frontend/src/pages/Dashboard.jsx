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

// Modal components for feature interactions
import DeviceModal from '../components/dashboard/DeviceModal';  // Device detail view
import AddCameraModal from '../components/dashboard/AddCameraModal';  // Manual camera addition
import AlertSettingsModal from '../components/dashboard/AlertSettingsModal';  // Email/SMS configuration
import ExportReportModal from '../components/dashboard/ExportReportModal';  // PDF export
import GroupManagementModal from '../components/dashboard/GroupManagementModal';  // Camera grouping

// Other views
import HistoryView from './HistoryView';  // Historical scan data view

// UI components
import Button from '../components/ui/Button';  // Reusable button component
import LoadingSpinner from '../components/ui/LoadingSpinner';  // Loading indicator

// Services and utilities
import { scannerAPI } from '../services/api';  // Backend API client
import { calculateAverageHealth, getCriticalIssuesCount, formatTimeAgo } from '../utils/helpers';  // Data processing utilities
import { RefreshCw, PlayCircle, Plus, Bell, FileText, Folder } from 'lucide-react';  // Icon library

/**
 * Dashboard - Main application view orchestrating all security monitoring features
 * Manages device scanning, display, and interaction with all modal features
 */
const Dashboard = () => {
  // ===== CORE STATE =====
  // Device data and loading states
  const [devices, setDevices] = useState([]);  // Combined list of scanned and manual cameras
  const [loading, setLoading] = useState(true);  // Initial data fetch loading state
  const [scanning, setScanning] = useState(false);  // Active scan operation in progress
  const [selectedDevice, setSelectedDevice] = useState(null);  // Device selected for detail view
  const [lastScanTime, setLastScanTime] = useState(null);  // Timestamp of most recent scan
  const [error, setError] = useState(null);  // Error message for user display
  
  // ===== VIEW STATE =====
  const [activeView, setActiveView] = useState('dashboard');  // Current view (dashboard or history)
  
  // ===== MODAL VISIBILITY STATE =====
  // Track which modal is currently open
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);  // Manual camera addition modal
  const [showAlertSettings, setShowAlertSettings] = useState(false);  // Email/SMS alert configuration
  const [showExportModal, setShowExportModal] = useState(false);  // PDF export modal
  const [showGroupManagement, setShowGroupManagement] = useState(false);  // Camera grouping modal
  
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
   * Trigger new network scan of all configured cameras
   * Posts scan request to backend and updates device list with results
   */
  const runScan = async () => {
    try {
      setScanning(true);  // Show scanning state in UI
      setError(null);  // Clear previous errors
      
      // Trigger backend scan operation
      const response = await scannerAPI.runScan();
      
      if (response.success) {
        setDevices(response.devices);  // Update device list with fresh scan results
        setLastScanTime(response.scan_time);  // Update timestamp
      }
    } catch (err) {
      console.error('Error running scan:', err);
      setError('Failed to run scan. Please check if the scanner API is running.');
    } finally {
      setScanning(false);  // Hide scanning state
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
    <div className="flex min-h-screen bg-bg-primary">
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
        {activeView === 'history' ? (
          <HistoryView />
        ) : activeView === 'settings' ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Settings</h2>
            <p className="text-text-tertiary">Settings page coming soon...</p>
          </div>
        ) : (
          <>
            {/* Dashboard View */}
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-heading font-bold text-text-primary mb-2">
                  Security Dashboard
                </h1>
                <p className="text-text-tertiary">
                  Monitor and protect your camera network in real-time
                </p>
              </div>
              <div className="flex gap-3">
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

            {/* No Devices State */}
            {!loading && devices.length === 0 && !error && (
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
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
