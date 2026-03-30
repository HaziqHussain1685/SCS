// React core
import React, { useState, useEffect } from 'react';

// Animation library for smooth updates
import { motion, AnimatePresence } from 'framer-motion';

// Icons for camera status
import { Camera, AlertTriangle, CheckCircle, Wifi, WifiOff, Heart, Shield, Clock } from 'lucide-react';

// API service
import { scannerAPI } from '../../services/api';

/**
 * AttackFeed - Live Real Camera Status Monitor (FYP2 - Real Cameras)
 * Displays actual camera status, health, and vulnerabilities
 * Fetches real data from backend API instead of simulation
 * Shows all detected cameras with their current security status
 */
const AttackFeed = () => {
  // ===== STATE =====
  const [cameras, setCameras] = useState([]);  // Real camera devices from API
  const [loading, setLoading] = useState(true);  // Initial data load state
  const [isActive, setIsActive] = useState(true);  // Auto-refresh toggle
  const [lastUpdate, setLastUpdate] = useState(new Date());  // Last API call time

  // ===== RISK COLOR MAPPING =====
  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'CRITICAL':
        return {
          text: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          badge: 'bg-red-500'
        };
      case 'HIGH':
        return {
          text: 'text-orange-500',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          badge: 'bg-orange-500'
        };
      case 'MEDIUM':
        return {
          text: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          badge: 'bg-yellow-500'
        };
      default:
        return {
          text: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          badge: 'bg-green-500'
        };
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return { text: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 60) return { text: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 40) return { text: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { text: 'text-red-400', bg: 'bg-red-500/20' };
  };

  // ===== API DATA FETCHING =====
  
  /**
   * Fetch real camera data from backend API
   * Gets current device list and their security status
   */
  const fetchCameraStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch latest scan results using API service
      const response = await scannerAPI.getLatestScan();
      
      if (response && response.success && response.data) {
        const device = response.data;
        
        // Transform API data to display format
        const cameraList = [{
          id: device.target_ip || device.ip || 'cam-1',
          name: device.target_ip ? `Smart Camera (${device.target_ip})` : 'Smart Camera',
          ip: device.target_ip || device.ip,
          status: device.status === 'online' ? 'online' : 'offline',
          healthScore: device.health_score || 75,
          riskLevel: device.risk_level || 'LOW',
          openPorts: device.open_ports?.length || 0,
          lastScan: new Date(device.scan_time || Date.now()).toLocaleTimeString(),
          vulnerabilities: device.vulnerabilities || [],
          criticalCount: (device.vulnerabilities || []).filter(v => v.risk === 'CRITICAL').length,
          highCount: (device.vulnerabilities || []).filter(v => v.risk === 'HIGH').length
        }];
        
        setCameras(cameraList);
      } else {
        // No scan results yet
        setCameras([]);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching camera status:', error);
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== LIFECYCLE =====
  
  /**
   * Initial load and auto-refresh
   * Fetch camera status on mount and periodically when active
   */
  useEffect(() => {
    fetchCameraStatus();
    
    if (!isActive) return;
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCameraStatus, 30000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Camera className="w-6 h-6 text-cyan-400" />
            {isActive && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Camera Status</h3>
            <p className="text-sm text-gray-400">Real-time device monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCameraStatus}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50 transition-all"
            title="Refresh camera status"
          >
            {loading ? 'Updating...' : 'Refresh'}
          </button>
          
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isActive 
                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Camera Feed Container */}
      <div className="bg-[#0F1629] border border-cyan-500/20 rounded-xl overflow-hidden">
        <div className="h-[320px] overflow-hidden relative">
          {/* Background grid effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,191,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,191,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          {/* Camera List */}
          <div className="relative z-10 p-4 space-y-2 h-full overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-gray-500"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Camera className="w-12 h-12 mb-3 opacity-50" />
                  </motion.div>
                  <p className="text-lg font-medium">Loading camera status...</p>
                  <p className="text-sm">Connecting to backend API</p>
                </motion.div>
              )}
              
              {!loading && cameras.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-gray-500"
                >
                  <Shield className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">No cameras detected</p>
                  <p className="text-sm">Run a scan to discover cameras on your network</p>
                </motion.div>
              )}
              
              {cameras.map((camera) => (
                <CameraStatusCard key={camera.id} camera={camera} getRiskColor={getRiskColor} getHealthColor={getHealthColor} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer with stats */}
        {!loading && cameras.length > 0 && (
          <div className="border-t border-cyan-500/20 bg-black/40 px-4 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-400">
                  Online: <span className="text-green-400 font-semibold">
                    {cameras.filter(c => c.status === 'online').length}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-gray-400">
                  Offline: <span className="text-red-400 font-semibold">
                    {cameras.filter(c => c.status === 'offline').length}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual camera status card
 * Shows device info, health score, risk level, and vulnerabilities
 */
const CameraStatusCard = React.forwardRef(({ camera, getRiskColor, getHealthColor }, ref) => {
  const riskColor = getRiskColor(camera.riskLevel);
  const healthColor = getHealthColor(camera.healthScore);
  const statusIcon = camera.status === 'online' ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 p-3 rounded-lg border ${riskColor.bg} ${riskColor.border} backdrop-blur-sm hover:shadow-lg transition-all`}
    >
      {/* Status Indicator */}
      <div className="flex-shrink-0 pt-1">
        {statusIcon}
      </div>

      {/* Camera Icon */}
      <div className="flex-shrink-0 pt-1">
        <Camera className="w-4 h-4 text-cyan-400" />
      </div>

      {/* Camera Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-semibold text-sm ${camera.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
            {camera.status.toUpperCase()}
          </span>
          <span className="text-white text-sm">|</span>
          <span className="text-white font-medium text-sm truncate">
            {camera.name}
          </span>
          <span className="text-gray-500 text-xs">({camera.ip})</span>
        </div>

        {/* Health Score and Risk */}
        <div className="flex items-center gap-3 text-xs mb-1">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span className={`font-semibold ${healthColor.text}`}>
              Health: {camera.healthScore}/100
            </span>
          </div>
          
          <span className="text-gray-600">•</span>
          
          <div className={`px-2 py-0.5 rounded text-xs font-bold ${riskColor.bg} ${riskColor.text}`}>
            {camera.riskLevel} RISK
          </div>
        </div>

        {/* Vulnerabilities Summary */}
        {(camera.criticalCount > 0 || camera.highCount > 0) && (
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>
              {camera.criticalCount > 0 && `${camera.criticalCount} CRITICAL, `}
              {camera.highCount > 0 && `${camera.highCount} HIGH`}
            </span>
          </div>
        )}

        {/* Port and scan info */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{camera.openPorts} open port{camera.openPorts !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span className="text-gray-600">{camera.lastScan}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0 pt-1">
        {camera.criticalCount > 0 ? (
          <div className="relative">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <motion.div
              className="absolute inset-0 bg-red-500 rounded-full"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        ) : camera.highCount > 0 ? (
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>
    </motion.div>
  );
});

// Set display name for debugging
CameraStatusCard.displayName = 'CameraStatusCard';

export default AttackFeed;
