import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import AttackFeed from '../components/dashboard/AttackFeed';
import StatsBar from '../components/dashboard/StatsBar';
import HealthScoreGrid from '../components/dashboard/HealthScoreGrid';
import DeviceTable from '../components/dashboard/DeviceTable';
import VulnerabilityTimeline from '../components/dashboard/VulnerabilityTimeline';
import VulnerabilityChart from '../components/dashboard/VulnerabilityChart';
import DeviceModal from '../components/dashboard/DeviceModal';
import HistoryView from './HistoryView';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { scannerAPI } from '../services/api';
import { calculateAverageHealth, getCriticalIssuesCount, formatTimeAgo } from '../utils/helpers';
import { RefreshCw, PlayCircle } from 'lucide-react';

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scannerAPI.getDevices();
      
      if (response.success && response.devices) {
        setDevices(response.devices);
        if (response.devices.length > 0) {
          setLastScanTime(response.devices[0].scan_time);
        }
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to fetch devices. Please run a scan first.');
    } finally {
      setLoading(false);
    }
  };

  const runScan = async () => {
    try {
      setScanning(true);
      setError(null);
      const response = await scannerAPI.runScan();
      
      if (response.success) {
        setDevices(response.devices);
        setLastScanTime(response.scan_time);
      }
    } catch (err) {
      console.error('Error running scan:', err);
      setError('Failed to run scan. Please check if the scanner API is running.');
    } finally {
      setScanning(false);
    }
  };

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };

  const handleRescan = async () => {
    setSelectedDevice(null);
    await runScan();
  };

  // Calculate stats
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    critical: devices.filter(d => d.risk_level === 'CRITICAL').length,
    high: devices.filter(d => d.risk_level === 'HIGH').length,
    medium: devices.filter(d => d.risk_level === 'MEDIUM').length,
    low: devices.filter(d => d.risk_level === 'LOW').length,
    avgHealth: calculateAverageHealth(devices),
    lastScanTime: lastScanTime ? formatTimeAgo(lastScanTime) : 'Never',
    autoRefresh: false,
  };

  const deviceStats = {
    total: stats.total,
    online: stats.online,
    critical: stats.critical,
    high: stats.high,
    low: stats.low,
  };

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
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
