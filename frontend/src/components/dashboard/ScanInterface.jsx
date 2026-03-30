import React, { useState } from 'react';
import { AlertTriangle, Activity, Zap, AlertCircle } from 'lucide-react';
import { scannerAPI } from '../../services/api';

export function ScanInterface() {
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
        setScanProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 500);

      console.log('Starting scan for target:', target);
      
      // Call backend API
      const data = await scannerAPI.runNmapScan(target);
      
      console.log('Scan completed:', data);

      clearInterval(progressInterval);

      setResults(data);
      setScanProgress(100);
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Scan failed');
      setScanProgress(0);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Run Security Scan</h2>
        
        <div className="space-y-4">
          {/* Target Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target IP Address or Subnet
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={scanning}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="e.g., 192.168.1.100 or 192.168.1.0/24"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter a single IP address or subnet (e.g., 192.168.18.0/24)
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
                Scanning... {scanProgress.toFixed(0)}%
              </div>
            ) : (
              'Start Scan'
            )}
          </button>

          {/* Progress Bar */}
          {scanning && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Scan Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan Results */}
      {results && (
        <ScanResults data={results} />
      )}
    </div>
  );
}

function ScanResults({ data }) {
  if (!data.devices || data.devices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600 text-center py-8">No devices found in scan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.devices.map((device, idx) => (
        <DeviceResult key={idx} device={device} />
      ))}
    </div>
  );
}

function DeviceResult({ device }) {
  const { ip, hostname, os, ports, health_score } = device;
  
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Device Header */}
      <div className={`p-4 ${getHealthColor(health_score)}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-2xl font-bold">{ip}</h3>
            <p className="text-sm opacity-75">{hostname} • {os}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getHealthColor(health_score).split(' ')[0]}`}>
              {Math.round(health_score)}/100
            </div>
            <p className="text-sm font-semibold">Health Score</p>
          </div>
        </div>
      </div>

      {/* Open Ports */}
      {ports && ports.length > 0 ? (
        <div className="border-t divide-y">
          <div className="px-4 py-3 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">
              {ports.length} Open Port{ports.length !== 1 ? 's' : ''} Found
            </p>
          </div>

          {ports.map((port, idx) => (
            <PortDetail key={idx} port={port} />
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-600">
          <p>No open ports detected</p>
        </div>
      )}
    </div>
  );
}

function PortDetail({ port }) {
  const { port: portNum, service, version, risk, vulnerabilities, recommendations } = port;
  
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getRiskIcon = (risk) => {
    if (risk === 'CRITICAL' || risk === 'HIGH') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">
            Port {portNum} • {service}
          </p>
          <p className="text-sm text-gray-600">Version: {version || 'Unknown'}</p>
        </div>
        {risk && (
          <div className={`px-3 py-1 rounded border flex items-center gap-2 ${getRiskColor(risk)} text-sm font-semibold`}>
            {getRiskIcon(risk)}
            {risk}
          </div>
        )}
      </div>

      {vulnerabilities && vulnerabilities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">VULNERABILITIES:</p>
          <ul className="space-y-1">
            {vulnerabilities.map((vuln, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{vuln}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-700 mb-2">HOW TO FIX:</p>
          <ol className="space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-600 font-semibold">{idx + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
