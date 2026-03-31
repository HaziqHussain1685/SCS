import React, { useState, useRef, useEffect } from 'react';
import { Wifi, AlertCircle, Shield, Activity, Zap, Copy, Check } from 'lucide-react';
import { scannerAPI } from '../../services/api';

/**
 * ModernScanInterface - Beautiful, modern IP camera vulnerability scanner
 * Features:
 * - Live device status checking (ping)
 * - Animated scanning state
 * - Modern card-based results
 * - Glowing risk indicator
 * - Smooth transitions
 */
export const ModernScanInterface = () => {
  // ===== STATE =====
  const [ip, setIp] = useState('192.168.18.234');
  const [isScanning, setIsScanning] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState(null); // 'online', 'offline', 'checking'
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const scanProgressRef = useRef(null);

  // ===== HELPERS =====

  const getRiskColor = (level) => {
    const colors = {
      CRITICAL: 'from-red-600 to-red-500',
      HIGH: 'from-orange-600 to-orange-500',
      MEDIUM: 'from-yellow-600 to-yellow-500',
      LOW: 'from-blue-600 to-blue-500',
      MINIMAL: 'from-green-600 to-green-500',
    };
    return colors[level] || 'from-gray-600 to-gray-500';
  };

  const getRiskBgColor = (level) => {
    const colors = {
      CRITICAL: 'bg-red-100 dark:bg-red-900/30',
      HIGH: 'bg-orange-100 dark:bg-orange-900/30',
      MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30',
      LOW: 'bg-blue-100 dark:bg-blue-900/30',
      MINIMAL: 'bg-green-100 dark:bg-green-900/30',
    };
    return colors[level] || 'bg-gray-100 dark:bg-gray-900/30';
  };

  const getRiskTextColor = (level) => {
    const colors = {
      CRITICAL: 'text-red-600 dark:text-red-400',
      HIGH: 'text-orange-600 dark:text-orange-400',
      MEDIUM: 'text-yellow-600 dark:text-yellow-400',
      LOW: 'text-blue-600 dark:text-blue-400',
      MINIMAL: 'text-green-600 dark:text-green-400',
    };
    return colors[level] || 'text-gray-600 dark:text-gray-400';
  };

  // ===== FUNCTIONS =====

  const handlePing = async () => {
    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }

    setIsPinging(true);
    setError(null);

    try {
      const response = await scannerAPI.pingDevice(ip);
      if (response.success) {
        const status = response.data.status; // 'online' or 'offline'
        setDeviceStatus(status);
        
        if (status === 'offline') {
          setError(`⚠️ Device at ${ip} is not reachable. It may be offline or blocked.`);
        } else {
          setError(null);
        }
      } else {
        setDeviceStatus('checking');
        setError('Unable to ping device');
      }
    } catch (err) {
      setDeviceStatus('checking');
      setError('Error pinging device: ' + err.message);
    } finally {
      setIsPinging(false);
    }
  };

  const handleScan = async () => {
    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }

    // First ping to check if online
    setIsPinging(true);
    try {
      const pingResponse = await scannerAPI.pingDevice(ip);
      if (pingResponse.success) {
        const status = pingResponse.data.status;
        setDeviceStatus(status);

        if (status === 'offline') {
          setError(`⚠️ Device appears offline. Scan may fail or take longer.`);
          // Continue with scan anyway
        }
      }
    } catch (err) {
      console.log('Ping check failed, but continuing with scan', err);
    } finally {
      setIsPinging(false);
    }

    // Start full scan
    setIsScanning(true);
    setError(null);
    setResults(null);

    try {
      const scanResponse = await scannerAPI.runComprehensiveScan(ip);

      if (scanResponse.success) {
        setResults(scanResponse.data);
        setError(null);
      } else {
        setError(scanResponse.error || 'Scan failed');
      }
    } catch (err) {
      setError('Error running scan: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-cyan-500" />
          <h1 className="text-4xl font-bold text-white">IoT Camera Scanner</h1>
        </div>
        <p className="text-slate-400">Advanced vulnerability detection powered by Nmap</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/70 transition-colors">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* IP Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="e.g., 192.168.18.234"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Device Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/30 md:min-w-max">
              {isPinging ? (
                <>
                  <Activity className="w-5 h-5 text-amber-500 animate-spin" />
                  <span className="text-sm text-amber-400">Checking...</span>
                </>
              ) : deviceStatus === 'online' ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-400 font-medium">🟢 Online</span>
                </>
              ) : deviceStatus === 'offline' ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-400 font-medium">🔴 Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-500">Check Status</span>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {/* Ping Button */}
              <button
                onClick={handlePing}
                disabled={isPinging || isScanning}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isPinging || isScanning
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white'
                }`}
              >
                <Wifi className="w-4 h-4" />
                Ping
              </button>

              {/* Scan Button */}
              <button
                onClick={handleScan}
                disabled={isScanning || isPinging}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isScanning
                    ? 'bg-cyan-600/50 text-cyan-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/50'
                }`}
              >
                {isScanning ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Scan Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyan-500 animate-spin" />
              <div>
                <p className="text-white font-medium">Scanning in progress...</p>
                <p className="text-slate-400 text-sm">Running comprehensive nmap analysis</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-6 animate-in fade-in-50">
            {/* Main Status Card */}
            <div className={`rounded-xl p-8 border backdrop-blur bg-opacity-10 ${getRiskBgColor(results.overall_risk_level)}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">OVERALL RISK LEVEL</p>
                  <h2 className={`text-3xl font-bold ${getRiskTextColor(results.overall_risk_level)}`}>
                    {results.overall_risk_level}
                  </h2>
                </div>

                {/* Glowing Risk Score */}
                <div className={`relative`}>
                  <div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br ${getRiskColor(results.overall_risk_level)} blur-xl absolute opacity-60`}
                  />
                  <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getRiskColor(results.overall_risk_level)} flex items-center justify-center border-2 border-white/20 shadow-2xl`}>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-white">{results.overall_risk_score}</p>
                      <p className="text-xs text-white/80">/10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Critical', value: results.summary.critical_issues, color: 'red' },
                  { label: 'High', value: results.summary.high_issues, color: 'orange' },
                  { label: 'Medium', value: results.summary.medium_issues, color: 'yellow' },
                  { label: 'Low', value: results.summary.low_issues, color: 'blue' },
                ].map((stat) => (
                  <div key={stat.label} className={`bg-${stat.color}-900/20 border border-${stat.color}-700/30 rounded-lg p-4 text-center`}>
                    <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                    <p className={`text-xs text-${stat.color}-300`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Profile */}
            {results.device_profile && (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-500" />
                  Device Profile
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Device Type</p>
                    <p className="text-white font-medium">
                      {results.device_profile.is_camera ? '📹 IP Camera' : '❓ Unknown Device'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Camera Type</p>
                    <p className="text-white font-medium">{results.device_profile.camera_type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Detection Confidence</p>
                    <p className="text-white font-medium">{results.device_profile.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Open Ports</p>
                    <p className="text-white font-medium">{results.device_profile.services_detected}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Open Ports */}
            {results.device_profile?.open_ports && results.device_profile.open_ports.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  Open Ports ({results.device_profile.open_ports.length})
                </h3>
                <div className="space-y-2">
                  {results.device_profile.open_ports.map((port, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 flex justify-between items-center hover:bg-slate-700/50 transition-colors cursor-pointer group"
                      onClick={() => copyToClipboard(`${ip}:${port.port}`)}
                    >
                      <div>
                        <p className="text-white font-mono font-medium">{port.port}/tcp</p>
                        <p className="text-slate-400 text-sm">{port.service}</p>
                      </div>
                      <Copy className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {results.all_findings && results.all_findings.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Vulnerabilities ({results.all_findings.length})
                </h3>
                <div className="space-y-3">
                  {results.all_findings.slice(0, 10).map((vuln, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-4 border ${getRiskBgColor(vuln.severity)} border-opacity-50`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold ${getRiskTextColor(vuln.severity)}`}>
                          {vuln.title}
                        </h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getRiskBgColor(vuln.severity)} ${getRiskTextColor(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm">{vuln.description}</p>
                      {vuln.affected_port && (
                        <p className="text-slate-400 text-xs mt-2">Port: {vuln.affected_port}</p>
                      )}
                    </div>
                  ))}
                  {results.all_findings.length > 10 && (
                    <p className="text-slate-400 text-sm text-center py-2">
                      +{results.all_findings.length - 10} more vulnerabilities
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Scan Metadata */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Scan Information</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Target IP</p>
                  <p className="text-white font-mono">{results.target_ip}</p>
                </div>
                <div>
                  <p className="text-slate-400">Scan Duration</p>
                  <p className="text-white font-mono">{results.scan_duration_seconds?.toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-slate-400">Scan Mode</p>
                  <p className="text-white font-mono">{results.scan_mode}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!results && !isScanning && (
          <div className="text-center py-20 text-slate-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Enter an IP address and click "Scan Now" to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernScanInterface;
