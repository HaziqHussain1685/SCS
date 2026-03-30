import React, { useState } from 'react';
import { AlertTriangle, Activity, Lock, AlertCircle, Zap } from 'lucide-react';
import { scannerAPI } from '../../services/api';

export function ONVIFScanInterface() {
  const [target, setTarget] = useState('192.168.18.234');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    setScanProgress(10);

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 300);

      console.log('Starting ONVIF scan for target:', target);
      
      // Call backend API
      const data = await scannerAPI.runOnvifScan(target);
      
      console.log('ONVIF scan completed:', data);

      clearInterval(progressInterval);

      setResults(data.data);
      setScanProgress(100);
    } catch (err) {
      console.error('ONVIF scan error:', err);
      setError(err.message || 'ONVIF scan failed');
      setScanProgress(0);
    } finally {
      setScanning(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Scan Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ONVIF Security Scan</h2>
        <p className="text-gray-600 text-sm mb-4">Test ONVIF vulnerability (credentials, authentication bypass)</p>
        
        <div className="space-y-4">
          {/* Target Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target IP Address
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={scanning}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="e.g., 192.168.18.234"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the IP address of your ONVIF camera
            </p>
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={scanning || !target}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              scanning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {scanning ? (
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-5 h-5 animate-spin" />
                Scanning ONVIF...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Start ONVIF Scan
              </div>
            )}
          </button>

          {/* Progress Bar */}
          {scanning && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-right">{Math.round(scanProgress)}%</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Scan Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && !scanning && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ONVIF Scan Results</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Health Score */}
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium">Health Score</p>
                <p className={`text-3xl font-bold ${getHealthScoreColor(results.health_score)}`}>
                  {results.health_score}/100
                </p>
                <p className="text-xs text-gray-600 mt-1">{results.risk_level} Risk</p>
              </div>

              {/* ONVIF Status */}
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium">ONVIF Service</p>
                <p className={`text-lg font-bold ${results.onvif_service_found ? 'text-orange-500' : 'text-green-500'}`}>
                  {results.onvif_service_found ? 'FOUND' : 'NOT FOUND'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {results.onvif_service_found ? 'Service detected' : 'Service not reachable'}
                </p>
              </div>
            </div>

            {/* Credentials Found */}
            {results.credentials_found && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  ⚠️ Default Credentials Found
                </p>
                <p className="text-sm text-red-700">
                  Username: <code className="bg-red-100 px-2 py-1 rounded">{results.credentials_found.username}</code>
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Password: <code className="bg-red-100 px-2 py-1 rounded">{results.credentials_found.password}</code>
                </p>
              </div>
            )}

            {/* Device Info */}
            {results.device_info && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-800 mb-2">Device Information</p>
                {results.device_info.model && (
                  <p className="text-sm text-gray-700"><strong>Model:</strong> {results.device_info.model}</p>
                )}
                {results.device_info.firmware && (
                  <p className="text-sm text-gray-700"><strong>Firmware:</strong> {results.device_info.firmware}</p>
                )}
              </div>
            )}
          </div>

          {/* Vulnerabilities */}
          {results.vulnerabilities && results.vulnerabilities.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Found {results.vulnerabilities.length} Vulnerability/ies
              </h3>

              <div className="space-y-3">
                {results.vulnerabilities.map((vuln, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 rounded-lg p-4 ${
                      vuln.risk === 'CRITICAL'
                        ? 'border-red-500 bg-red-50'
                        : vuln.risk === 'HIGH'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{vuln.name}</p>
                        <p className="text-sm text-gray-700 mt-1">{vuln.description}</p>
                        {vuln.cve && vuln.cve !== 'N/A' && (
                          <p className="text-xs text-gray-600 mt-2 font-mono">{vuln.cve}</p>
                        )}
                      </div>
                      <span className={`font-bold px-3 py-1 rounded text-sm ${getRiskColor(vuln.risk)} whitespace-nowrap`}>
                        {vuln.risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
