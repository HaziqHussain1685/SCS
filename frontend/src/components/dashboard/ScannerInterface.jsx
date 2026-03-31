import React, { useState } from 'react';
import {
  Zap,
  Search,
  AlertCircle,
  CheckCircle,
  Loader,
  Shield,
  Settings,
  Info,
} from 'lucide-react';

const ScannerInterface = ({ onScanResults, onScanStart }) => {
  const [targetIP, setTargetIP] = useState('192.168.18.234');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullScan, setFullScan] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const validateIP = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(ip);
  };

  const handleScan = async () => {
    if (!validateIP(targetIP)) {
      setError('Invalid IP address format');
      return;
    }

    setIsLoading(true);
    setError(null);
    onScanStart();

    try {
      setScanProgress(10);
      const response = await fetch('http://localhost:5000/api/scan/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: targetIP,
          full_scan: fullScan,
        }),
      });

      setScanProgress(50);

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      setScanProgress(90);

      if (data.success) {
        onScanResults(data.data);
        setScanProgress(100);
      } else {
        throw new Error(data.error || 'Scan failed');
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setScanProgress(0);
    }
  };

  const handleQuickIP = (ip) => {
    setTargetIP(ip);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-cyan-400 animate-pulse" />
              <Zap className="w-6 h-6 text-yellow-400 absolute bottom-0 right-0 animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            IoT Camera Security Scanner
          </h1>
          <p className="text-slate-400">Professional Vulnerability Detection & Proof-of-Concept Testing</p>
        </div>

        {/* Main Scanner Card */}
        <div className="p-8 border border-slate-700 rounded-2xl backdrop-blur-sm bg-slate-900/40 shadow-2xl animate-fadeIn mb-6">
          {/* IP Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Target IP Address
            </label>
            <input
              type="text"
              value={targetIP}
              onChange={(e) => {
                setTargetIP(e.target.value);
                setError(null);
              }}
              placeholder="192.168.0.1"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">Enter the IP address of the camera to scan</p>
          </div>

          {/* Quick IP Presets */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 mb-2">Quick Presets:</p>
            <div className="flex gap-2 flex-wrap">
              {['192.168.1.100', '192.168.18.234', '10.0.0.50'].map((ip) => (
                <button
                  key={ip}
                  onClick={() => handleQuickIP(ip)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    targetIP === ip
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ip}
                </button>
              ))}
            </div>
          </div>

          {/* Scan Options */}
          <div className="mb-6 p-4 border border-slate-700 rounded-lg bg-slate-800/30">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fullScan}
                onChange={(e) => setFullScan(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-400" />
                <span>
                  <span className="text-sm font-medium">Full Port Scan</span>
                  <span className="text-xs text-slate-500 ml-2">(scans all 65535 ports - slower but comprehensive)</span>
                </span>
              </span>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 border border-red-900/50 bg-red-900/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400 text-sm">Scan Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Main Scan Button */}
          <button
            onClick={handleScan}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 mb-4 ${
              isLoading
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transform hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Scanning Device...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Start Security Scan</span>
              </>
            )}
          </button>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mb-4">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{scanProgress}% - Initializing scan...</p>
            </div>
          )}

          {/* Scan Steps Info */}
          <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/30 text-sm">
            <p className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              What This Scan Includes
            </p>
            <ul className="space-y-1 text-slate-400 text-xs">
              <li>✓ Device connectivity check (ping & port probing)</li>
              <li>✓ Port scanning ({fullScan ? 'all' : 'common'} ports)</li>
              <li>✓ Service enumeration and version detection</li>
              <li>✓ RTSP stream testing & frame capture</li>
              <li>✓ ONVIF device management detection</li>
              <li>✓ Web interface security analysis</li>
              <li>✓ Default credentials risk assessment</li>
              <li>✓ Vulnerability scoring & prioritization</li>
            </ul>
          </div>
        </div>

        {/* Information Box */}
        <div className="p-6 border border-purple-900/50 bg-purple-900/10 rounded-lg backdrop-blur-sm">
          <h3 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• This scanner is for authorized security testing only</li>
            <li>• Ensure you have permission before scanning any device</li>
            <li>• Media streaming engine required for frame capture</li>
            <li>• Results include actionable remediation steps</li>
            <li>• All vulnerabilities are presented for educational demonstration</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default ScannerInterface;
