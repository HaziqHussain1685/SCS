import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  Wifi,
  Camera,
  Network,
  Zap,
  Eye,
  Lock,
  Volume2,
  TrendingDown,
  Loader,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

/**
 * AdvancedCybersecurityDashboard
 * Professional cybersecurity-themed IoT Camera Scanner
 * Features:
 * - Modern dark theme with neon accents
 * - Real-time vulnerability detection
 * - RTSP proof-of-vulnerability display
 * - Attack scenario simulation
 * - Smooth animations and glowing effects
 */
const AdvancedCybersecurityDashboard = ({ scanResults = null, isScanning = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [animatedRiskScore, setAnimatedRiskScore] = useState(0);

  // Animate risk score when results change
  useEffect(() => {
    if (scanResults?.overall_risk_score) {
      const interval = setInterval(() => {
        setAnimatedRiskScore((prev) => {
          const target = scanResults.overall_risk_score;
          if (prev < target) {
            return Math.min(prev + 0.5, target);
          }
          return prev;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scanResults?.overall_risk_score]);

  const getRiskColor = (score) => {
    if (score >= 8) return 'from-red-600 to-red-900';
    if (score >= 6) return 'from-orange-600 to-orange-900';
    if (score >= 4) return 'from-yellow-600 to-yellow-900';
    if (score >= 2) return 'from-blue-600 to-blue-900';
    return 'from-green-600 to-green-900';
  };

  const getRiskTextColor = (score) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    if (score >= 2) return 'text-blue-400';
    return 'text-green-400';
  };

  const getRiskLevel = (score) => {
    if (score >= 8) return 'CRITICAL';
    if (score >= 6) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    if (score >= 2) return 'LOW';
    return 'MINIMAL';
  };

  const getStatusColor = (status) => {
    return status === 'ONLINE' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBg = (status) => {
    return status === 'ONLINE' ? 'bg-green-900/30' : 'bg-red-900/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-4 md:p-8">
      {/* Background animated grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              IoT Camera Security Scanner
            </h1>
          </div>
          <p className="text-slate-400">Advanced vulnerability detection & proof-of-concept demonstration</p>
        </div>

        {/* Scanning State */}
        {isScanning && (
          <div className="mb-8 p-6 border border-cyan-500/30 bg-cyan-900/10 rounded-lg animate-pulse">
            <div className="flex items-center gap-4">
              <Loader className="w-6 h-6 animate-spin text-cyan-400" />
              <div>
                <p className="font-semibold text-cyan-400">Security Scan In Progress</p>
                <p className="text-sm text-slate-400">Scanning device, analyzing ports, testing RTSP streams...</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {scanResults ? (
          <>
            {/* Device Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Device Status Card */}
              <div className={`p-6 border rounded-lg backdrop-blur-sm transition-all transform hover:scale-105 ${getStatusBg(scanResults.device_profile.status)} border-slate-700`}>
                <div className="flex items-center justify-between mb-3">
                  <Wifi className={`w-5 h-5 ${getStatusColor(scanResults.device_profile.status)}`} />
                  {scanResults.device_profile.status === 'ONLINE' ? (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse glow-green"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-slate-400">Device Status</p>
                <p className={`text-2xl font-bold ${getStatusColor(scanResults.device_profile.status)}`}>
                  {scanResults.device_profile.status}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Method: {scanResults.device_profile.status_method}
                </p>
              </div>

              {/* Camera Type Card */}
              <div className="p-6 border border-slate-700 rounded-lg backdrop-blur-sm transition-all transform hover:scale-105 hover:border-purple-500/50">
                <div className="flex items-center justify-between mb-3">
                  <Camera className="w-5 h-5 text-purple-400" />
                  <span className="text-xs bg-purple-900/50 px-2 py-1 rounded text-purple-300">
                    {scanResults.device_profile.confidence}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">Device Type</p>
                <p className="text-lg font-semibold text-purple-400">{scanResults.device_profile.camera_type}</p>
                <p className="text-xs text-slate-500 mt-2">IP: {scanResults.target_ip}</p>
              </div>

              {/* Open Ports Card */}
              <div className="p-6 border border-slate-700 rounded-lg backdrop-blur-sm transition-all transform hover:scale-105 hover:border-orange-500/50">
                <div className="flex items-center justify-between mb-3">
                  <Network className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-sm text-slate-400">Open Ports</p>
                <p className="text-2xl font-bold text-orange-400">{scanResults.device_profile.services_detected}</p>
                <div className="text-xs text-slate-500 mt-2">
                  {scanResults.device_profile.open_ports.slice(0, 3).map((port) => (
                    <span key={port.port} className="block">
                      {port.port} ({port.service})
                    </span>
                  ))}
                </div>
              </div>

              {/* Overall Risk Score Card */}
              <div className={`p-6 border rounded-lg backdrop-blur-sm transition-all transform hover:scale-105 bg-gradient-to-br ${getRiskColor(scanResults.overall_risk_score)} border-slate-700`}>
                <div className="flex items-center justify-between mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-300" />
                  <Shield className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-300 font-semibold">Overall Risk</p>
                <p className={`text-3xl font-bold ${getRiskTextColor(scanResults.overall_risk_score)}`}>
                  {animatedRiskScore.toFixed(1)}/10
                </p>
                <p className="text-xs text-slate-400 mt-2">{getRiskLevel(scanResults.overall_risk_score)} SEVERITY</p>
              </div>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border border-red-900/50 bg-red-900/10 rounded-lg">
                <p className="text-sm text-slate-400">Critical Issues</p>
                <p className="text-2xl font-bold text-red-400">{scanResults.summary.critical_issues}</p>
              </div>
              <div className="p-4 border border-orange-900/50 bg-orange-900/10 rounded-lg">
                <p className="text-sm text-slate-400">High Issues</p>
                <p className="text-2xl font-bold text-orange-400">{scanResults.summary.high_issues}</p>
              </div>
              <div className="p-4 border border-yellow-900/50 bg-yellow-900/10 rounded-lg">
                <p className="text-sm text-slate-400">Medium Issues</p>
                <p className="text-2xl font-bold text-yellow-400">{scanResults.summary.medium_issues}</p>
              </div>
              <div className="p-4 border border-blue-900/50 bg-blue-900/10 rounded-lg">
                <p className="text-sm text-slate-400">Low Issues</p>
                <p className="text-2xl font-bold text-blue-400">{scanResults.summary.low_issues}</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 flex-wrap border-b border-slate-700/50">
              {['overview', 'vulnerabilities', 'rtsp-proof', 'attack-scenario', 'recommendations'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
              {activeTab === 'overview' && (
                <OverviewTab scanResults={scanResults} />
              )}

              {activeTab === 'vulnerabilities' && (
                <VulnerabilitiesTab
                  vulnerabilities={scanResults.all_findings}
                  selectedVuln={selectedVuln}
                  setSelectedVuln={setSelectedVuln}
                />
              )}

              {activeTab === 'rtsp-proof' && (
                <RTSPProofTab rtspProof={scanResults.rtsp_proof_of_concept} />
              )}

              {activeTab === 'attack-scenario' && (
                <AttackScenarioTab vulnerabilities={scanResults.all_findings} />
              )}

              {activeTab === 'recommendations' && (
                <RecommendationsTab
                  vulnerabilities={scanResults.all_findings}
                  recommendations={scanResults.recommendations}
                />
              )}
            </div>

            {/* Scan Details Footer */}
            <div className="mt-8 pt-6 border-t border-slate-700/50 text-xs text-slate-500 flex justify-between flex-wrap gap-4">
              <span>Scan Duration: {scanResults.scan_duration_seconds?.toFixed(1)}s</span>
              <span>Scan Mode: {scanResults.scan_mode}</span>
              <span>Timestamp: {new Date(scanResults.timestamp).toLocaleString()}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-cyan-400/30 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400 text-lg">Start a scan to analyze device security</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .glow-green {
          animation: pulse-glow 2s infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .glow-text {
          text-shadow: 0 0 10px currentColor;
        }
      `}</style>
    </div>
  );
};

// ==================== TAB COMPONENTS ====================

const OverviewTab = ({ scanResults }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerabilities Breakdown */}
        <div className="p-6 border border-slate-700 rounded-lg backdrop-blur-sm">
          <h3 className="font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Vulnerability Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Critical', value: scanResults.summary.critical_issues, color: 'red' },
              { label: 'High', value: scanResults.summary.high_issues, color: 'orange' },
              { label: 'Medium', value: scanResults.summary.medium_issues, color: 'yellow' },
              { label: 'Low', value: scanResults.summary.low_issues, color: 'blue' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-${item.color}-400`}></div>
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className={`ml-auto font-bold text-${item.color}-400`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Information */}
        <div className="p-6 border border-slate-700 rounded-lg backdrop-blur-sm">
          <h3 className="font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Device Information
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400">IP Address:</span> <span className="text-slate-200 font-mono">{scanResults.target_ip}</span></p>
            <p><span className="text-slate-400">Device Type:</span> <span className="text-slate-200">{scanResults.device_profile.camera_type}</span></p>
            <p><span className="text-slate-400">Confidence:</span> <span className="text-slate-200">{scanResults.device_profile.confidence}%</span></p>
            <p><span className="text-slate-400">Status:</span> <span className={`font-bold ${scanResults.device_profile.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}`}>{scanResults.device_profile.status}</span></p>
            <p><span className="text-slate-400">Open Ports:</span> <span className="text-slate-200">{scanResults.device_profile.services_detected}</span></p>
          </div>
        </div>
      </div>

      {/* Top Vulnerabilities */}
      <div className="p-6 border border-slate-700 rounded-lg backdrop-blur-sm">
        <h3 className="font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Top Critical Issues
        </h3>
        <div className="space-y-3">
          {scanResults.all_findings
            .filter((v) => v.severity === 'CRITICAL')
            .slice(0, 3)
            .map((vuln, idx) => (
              <div key={idx} className="p-3 bg-red-900/20 border border-red-900/50 rounded">
                <p className="font-semibold text-red-400 text-sm">{vuln.title}</p>
                <p className="text-xs text-slate-400 mt-1">{vuln.description?.substring(0, 100)}...</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const VulnerabilitiesTab = ({ vulnerabilities, selectedVuln, setSelectedVuln }) => {
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sorted = [...vulnerabilities].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div className="space-y-4">
      {sorted.map((vuln, idx) => (
        <div
          key={idx}
          onClick={() => setSelectedVuln(selectedVuln === idx ? null : idx)}
          className={`p-4 border rounded-lg backdrop-blur-sm cursor-pointer transition-all ${
            selectedVuln === idx ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-600'
          } ${
            vuln.severity === 'CRITICAL'
              ? 'border-l-4 border-l-red-500'
              : vuln.severity === 'HIGH'
                ? 'border-l-4 border-l-orange-500'
                : 'border-l-4 border-l-slate-600'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  vuln.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-300' :
                  vuln.severity === 'HIGH' ? 'bg-orange-900/50 text-orange-300' :
                  vuln.severity === 'MEDIUM' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-blue-900/50 text-blue-300'
                }`}>
                  {vuln.severity}
                </span>
                {vuln.proof_of_concept && (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-purple-900/50 text-purple-300">
                    PROOF CONFIRMED
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-slate-50">{vuln.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{vuln.description?.substring(0, 150)}...</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 ml-2" />
          </div>

          {selectedVuln === idx && (
            <div className="mt-4 pt-4 border-t border-slate-700 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-cyan-400 mb-1">Description</p>
                <p className="text-slate-300">{vuln.description}</p>
              </div>
              {vuln.attack_scenario && (
                <div>
                  <p className="font-semibold text-orange-400 mb-1">Attack Scenario</p>
                  <p className="text-slate-300">{vuln.attack_scenario}</p>
                </div>
              )}
              {vuln.remediation && (
                <div>
                  <p className="font-semibold text-green-400 mb-1">Remediation</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {vuln.remediation.slice(0, 3).map((step, i) => (
                      <li key={i} className="text-xs">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const RTSPProofTab = ({ rtspProof }) => {
  const [liveStreamUrl, setLiveStreamUrl] = React.useState(null);
  const [showLiveStream, setShowLiveStream] = React.useState(false);
  const [capturing, setCapturing] = React.useState(false);
  const [streamError, setStreamError] = React.useState(null);
  const [snapshots, setSnapshots] = React.useState([]);

  React.useEffect(() => {
    if (rtspProof?.accessible && rtspProof?.snapshots?.[0]?.url) {
      const rtspUrl = rtspProof.snapshots[0].url;
      const encodedUrl = encodeURIComponent(rtspUrl);
      setLiveStreamUrl(`/live-stream?rtsp_url=${encodedUrl}`);
    }
    fetch('/api/snapshots?limit=5')
      .then(r => r.json())
      .then(d => { if (d.success && d.snapshots) { setSnapshots(d.snapshots); } })
      .catch(err => console.log('Snapshots load error:', err));
  }, [rtspProof]);

  const handleCaptureSnapshot = async () => {
    if (!rtspProof?.snapshots?.[0]?.url) return;
    setCapturing(true);
    try {
      const response = await fetch('/api/snapshot/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rtsp_url: rtspProof.snapshots[0].url, camera_id: 'dashboard' })
      });
      const data = await response.json();
      if (data.success) {
        const snapsResponse = await fetch('/api/snapshots?limit=5');
        const snapsData = await snapsResponse.json();
        if (snapsData.success) { setSnapshots(snapsData.snapshots); }
      }
    } catch (err) { console.error('Capture error:', err);
    } finally { setCapturing(false); }
  };

  if (!rtspProof) {
    return (
      <div className="p-6 border border-slate-700 rounded-lg backdrop-blur-sm text-center">
        <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No RTSP proof-of-concept data available</p>
        <p className="text-xs text-slate-500 mt-1">RTSP testing requires FFmpeg and an accessible camera</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rtspProof.accessible ? (
        <>
          <div className="p-6 border-2 border-red-500/50 bg-red-900/20 rounded-lg animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
              <h3 className="text-xl font-bold text-red-400">⚠ CRITICAL: UNAUTHORIZED STREAM ACCESS CONFIRMED</h3>
            </div>
            <p className="text-red-300 text-sm">Live camera footage is actively accessible without authentication</p>
            <p className="text-red-300/70 text-xs mt-2">Anyone on your network can view this feed in real-time</p>
          </div>

          {liveStreamUrl && (
            <div className="border border-purple-500/30 bg-purple-900/10 rounded-lg overflow-hidden">
              <div className="bg-slate-800 p-4 border-b border-purple-500/30 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-purple-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Live Camera Feed
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Real-time MJPEG stream from accessible camera</p>
                </div>
                <button
                  onClick={() => setShowLiveStream(!showLiveStream)}
                  className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-500 rounded transition-colors"
                >
                  {showLiveStream ? 'Hide' : 'Show'}
                </button>
              </div>
              {showLiveStream && (
                <div className="p-4">
                  <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 mb-3">
                    <div className="aspect-video bg-slate-950 flex items-center justify-center">
                      <img
                        key={liveStreamUrl}
                        src={liveStreamUrl}
                        alt="Live RTSP Stream"
                        className="w-full h-full object-cover"
                        onError={() => setStreamError('Failed to load stream')}
                        onLoad={() => setStreamError(null)}
                      />
                    </div>
                  </div>
                  {streamError && <p className="text-red-400 text-sm">{streamError}</p>}
                  <p className="text-xs text-slate-500 mt-2">
                    ℹ️ Stream updates every 2-5 seconds. If not loading, ensure FFmpeg is installed.
                  </p>
                </div>
              )}
            </div>
          )}

          {(rtspProof.snapshots && rtspProof.snapshots.length > 0 || snapshots.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-cyan-400 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Captured Snapshots
                </h4>
                <button
                  onClick={handleCaptureSnapshot}
                  disabled={capturing || !rtspProof?.accessible}
                  className="px-3 py-1 text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded transition-colors disabled:cursor-not-allowed"
                >
                  {capturing ? 'Capturing...' : 'Capture New'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rtspProof.snapshots && rtspProof.snapshots.map((snapshot, idx) => (
                  <div key={`original-${idx}`} className="border border-slate-700 rounded-lg overflow-hidden backdrop-blur-sm hover:border-slate-600 transition-colors">
                    <div className="bg-slate-800/80 p-3 border-b border-slate-700">
                      <p className="font-semibold text-cyan-400 text-sm">Captured Frame {idx + 1}</p>
                      <p className="text-xs text-slate-400 mt-1">Stream: {snapshot.path}</p>
                    </div>
                    <div className="p-4">
                      {snapshot.snapshot && (
                        <div className="bg-slate-900 rounded overflow-hidden mb-3 border border-slate-700">
                          <img
                            src={snapshot.snapshot}
                            alt={`RTSP Snapshot ${idx + 1}`}
                            className="w-full h-auto"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23334155%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23cbd5e1%22%3ESnapshot Not Found%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-2 text-xs text-slate-400">
                        <p><span className="text-slate-300">URL:</span> {snapshot.url}</p>
                        <p><span className="text-slate-300">Credentials:</span> {snapshot.credential}</p>
                        <p><span className="text-slate-300">Size:</span> {(snapshot.file_size_bytes / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                ))}
                {snapshots.slice(0, 2).map((snapshot, idx) => (
                  <div key={`recent-${idx}`} className="border border-slate-700 rounded-lg overflow-hidden backdrop-blur-sm hover:border-slate-600 transition-colors">
                    <div className="bg-slate-800/80 p-3 border-b border-slate-700">
                      <p className="font-semibold text-blue-400 text-sm">Recent Capture</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(snapshot.created).toLocaleTimeString()}</p>
                    </div>
                    <div className="p-4">
                      <a href={snapshot.url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="bg-slate-900 rounded overflow-hidden mb-3 border border-slate-700 hover:border-blue-500 transition-colors">
                          <img
                            src={snapshot.url}
                            alt="Snapshot"
                            className="w-full h-auto"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23334155%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23cbd5e1%22%3EImage Not Found%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      </a>
                      <div className="space-y-1 text-xs text-slate-400">
                        <p><span className="text-slate-300">File:</span> {snapshot.filename}</p>
                        <p><span className="text-slate-300">Size:</span> {(snapshot.file_size_bytes / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rtspProof.attack_scenario_confirmed && (
            <div className="p-6 border border-orange-900/50 bg-orange-900/20 rounded-lg">
              <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Attack Scenario
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                {rtspProof.attack_scenario_confirmed.steps?.map((step, idx) => (
                  <li key={idx} className="text-xs">{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="p-4 border border-slate-600 bg-slate-800/30 rounded-lg">
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Impact
            </h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• <span className="text-slate-300">Privacy Risk:</span> Live surveillance accessible to anyone on the network</li>
              <li>• <span className="text-slate-300">No Authentication:</span> Access without username/password required</li>
              <li>• <span className="text-slate-300">Real-time Threat:</span> Footage can be recorded and analyzed</li>
              <li>• <span className="text-slate-300">Network Exposure:</span> Accessible from any device that can reach this IP</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="p-6 border border-green-900/50 bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-green-400">RTSP Properly Secured</h3>
          </div>
          <p className="text-green-300 text-sm">No accessible RTSP streams found. RTSP port is protected or not responding.</p>
        </div>
      )}
    </div>
  );
};

const AttackScenarioTab = ({ vulnerabilities }) => {
  const criticalVulns = vulnerabilities.filter((v) => v.severity === 'CRITICAL');

  return (
    <div className="space-y-4">
      <div className="p-6 border border-red-900/50 bg-red-900/10 rounded-lg">
        <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Simulated Attack Path
        </h3>

        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Reconnaissance',
              description: 'Attacker performs network scan and identifies camera IP with open ports.',
              tools: 'nmap, port scanners',
            },
            {
              step: 2,
              title: 'Service Enumeration',
              description: 'Discovers RTSP (554), HTTP (8089), ONVIF (8899) services.',
              tools: 'nmap, netstat',
            },
            {
              step: 3,
              title: 'Authentication Test',
              description: 'Tests for default credentials and anonymous access.',
              tools: 'curl, ffmpeg, hydra',
            },
            {
              step: 4,
              title: 'Stream Access',
              description: 'Gains live video feed access using VLC or custom client.',
              tools: 'VLC, ffmpeg, GStreamer',
            },
            {
              step: 5,
              title: 'Exploitation',
              description: 'Records surveillance footage, extracts metadata, gains reconnaissance data.',
              tools: 'ffmpeg, video tools',
            },
            {
              step: 6,
              title: 'Persistence',
              description: 'Maintains access by adding backdoor accounts or API tokens.',
              tools: 'Custom scripts, API clients',
            },
          ].map((attack) => (
            <div key={attack.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-red-600 text-slate-50 flex items-center justify-center font-bold text-sm">
                  {attack.step}
                </div>
                {attack.step < 6 && (
                  <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-red-900 mt-2"></div>
                )}
              </div>
              <div className="pb-4">
                <p className="font-semibold text-slate-50">{attack.title}</p>
                <p className="text-sm text-slate-400 mt-1">{attack.description}</p>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="text-slate-400">Tools:</span> {attack.tools}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {criticalVulns.length > 0 && (
        <div className="p-6 border border-orange-900/50 bg-orange-900/10 rounded-lg">
          <h3 className="font-semibold text-orange-400 mb-3">Critical Vulnerabilities Enabling This Attack</h3>
          <ul className="space-y-2">
            {criticalVulns.map((vuln, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex gap-2">
                <span className="text-orange-400 font-bold">•</span>
                {vuln.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const RecommendationsTab = ({ vulnerabilities, recommendations }) => {
  const severityGroups = {
    CRITICAL: vulnerabilities.filter((v) => v.severity === 'CRITICAL'),
    HIGH: vulnerabilities.filter((v) => v.severity === 'HIGH'),
    MEDIUM: vulnerabilities.filter((v) => v.severity === 'MEDIUM'),
  };

  return (
    <div className="space-y-6">
      {Object.entries(severityGroups)
        .filter(([, vulns]) => vulns.length > 0)
        .map(([severity, vulns]) => (
          <div
            key={severity}
            className={`p-6 border rounded-lg backdrop-blur-sm ${
              severity === 'CRITICAL'
                ? 'border-red-900/50 bg-red-900/10'
                : severity === 'HIGH'
                  ? 'border-orange-900/50 bg-orange-900/10'
                  : 'border-yellow-900/50 bg-yellow-900/10'
            }`}
          >
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
              severity === 'CRITICAL' ? 'text-red-400' : severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
            }`}>
              <Lock className="w-4 h-4" />
              Fix {severity} Issues ({vulns.length})
            </h3>

            <div className="space-y-4">
              {vulns.map((vuln, idx) => (
                <div key={idx} className="p-3 bg-slate-900/30 rounded border border-slate-700/50">
                  <p className="font-semibold text-slate-200 text-sm mb-2">{vuln.title}</p>
                  {vuln.remediation && (
                    <ol className="list-decimal list-inside space-y-1">
                      {vuln.remediation.slice(0, 5).map((step, i) => (
                        <li key={i} className="text-xs text-slate-400">{step}</li>
                      ))}
                    </ol>
                  )}
                  <p className="text-xs text-slate-500 mt-2">Effort: {vuln.effort} | Priority: {vuln.priority}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

      <div className="p-6 border border-green-900/50 bg-green-900/10 rounded-lg">
        <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          General Security Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-green-400">✓</span>
            Change all default credentials immediately
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">✓</span>
            Enable all available security features (authentication, encryption)
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">✓</span>
            Use firewall to restrict access to trusted IPs only
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">✓</span>
            Update camera firmware to latest security version
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">✓</span>
            Use VPN for remote access instead of exposing directly
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">✓</span>
            Monitor for unauthorized access attempts
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedCybersecurityDashboard;
