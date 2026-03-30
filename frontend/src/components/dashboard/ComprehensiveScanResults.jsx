import React from 'react';
import { AlertTriangle, Check, AlertCircle, Lock, Zap, Wifi, Download } from 'lucide-react';
import { exportScanResultsAsJSON, exportScanResultsAsCSV, exportScanResultsAsHTML } from '../../utils/exportUtils';

export function ComprehensiveScanResults({ results }) {
  if (!results) return null;

  const { nmap, onvif, combined_vulnerabilities, global_health_score, global_risk_level, summary } = results;

  const getRiskColor = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-900 dark:text-red-200', badge: 'bg-red-500' };
      case 'HIGH':
        return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-900 dark:text-orange-200', badge: 'bg-orange-500' };
      case 'MEDIUM':
        return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-900 dark:text-yellow-200', badge: 'bg-yellow-500' };
      default:
        return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-900 dark:text-green-200', badge: 'bg-green-500' };
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-8 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Comprehensive Security Analysis</h2>
          <div className="flex gap-2">
            <button
              onClick={() => exportScanResultsAsJSON(results)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700"
              title="Download as JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => exportScanResultsAsCSV(results)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700"
              title="Download as CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportScanResultsAsHTML(results)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700"
              title="Download as HTML Report"
            >
              <Download className="w-4 h-4" />
              HTML
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Health Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Overall Health Score</p>
            <p className={`text-4xl font-bold ${getHealthColor(global_health_score)}`}>
              {global_health_score}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">/100</p>
          </div>

          {/* Risk Level */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Risk Level</p>
            <p className={`text-2xl font-bold ${
              global_risk_level === 'CRITICAL' ? 'text-red-600' :
              global_risk_level === 'HIGH' ? 'text-orange-600' :
              global_risk_level === 'MEDIUM' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {global_risk_level}
            </p>
          </div>

          {/* Total Vulnerabilities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Vulnerabilities Found</p>
            <p className="text-4xl font-bold text-orange-600">
              {combined_vulnerabilities.length}
            </p>
          </div>

          {/* Scan Tools */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Scan Tools Used</p>
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">nmap + ONVIF</p>
          </div>
        </div>

        {/* Key Findings */}
        {summary && summary.key_findings && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-3">Key Findings & Recommendations</h3>
            <div className="space-y-2">
              {summary.key_findings.map((finding, idx) => (
                <p key={idx} className={`text-sm ${
                  finding.startsWith('⚠️') ? 'text-red-700 dark:text-red-400 font-semibold' :
                  finding.startsWith('RECOMMENDATIONs') || finding === 'RECOMMENDATIONS:' ? 'text-gray-700 dark:text-gray-300 font-bold mt-2' :
                  finding.match(/^\d+\./) ? 'text-gray-700 dark:text-gray-400 ml-4' :
                  'text-gray-700 dark:text-gray-400'
                }`}>
                  {finding}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nmap Scan Results */}
      {nmap && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Network Scan (nmap)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{nmap.status || 'OFFLINE'}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Open Ports</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{nmap.open_ports?.length || 0}</p>
            </div>
          </div>

          {nmap.open_ports && nmap.open_ports.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Open Ports:</p>
              <div className="flex flex-wrap gap-2">
                {nmap.open_ports.slice(0, 10).map((port, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-mono border border-blue-200 dark:border-blue-800">
                    {port}
                  </span>
                ))}
                {nmap.open_ports.length > 10 && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-600">
                    +{nmap.open_ports.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONVIF Scan Results */}
      {onvif && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">ONVIF Security Scan</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ONVIF Service</p>
              <p className={`text-xl font-bold ${onvif.onvif_service_found ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                {onvif.onvif_service_found ? '⚠️ FOUND' : '✓ NOT FOUND'}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Health Score</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{onvif.health_score}/100</p>
            </div>
          </div>

          {onvif.credentials_found && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="font-semibold text-red-900 dark:text-red-300 mb-2">🔴 Default Credentials Detected</p>
              <p className="text-sm text-red-700 dark:text-red-400">
                Username: <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded text-red-900 dark:text-red-200">{onvif.credentials_found.username}</code>
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Password: <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded text-red-900 dark:text-red-200">{onvif.credentials_found.password}</code>
              </p>
            </div>
          )}

          {onvif.device_info && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Device Information</p>
              <p className="text-sm text-gray-700 dark:text-gray-400"><strong>Model:</strong> {onvif.device_info.model}</p>
              {onvif.device_info.firmware && (
                <p className="text-sm text-gray-700 dark:text-gray-400"><strong>Firmware:</strong> {onvif.device_info.firmware}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Combined Vulnerabilities */}
      {combined_vulnerabilities && combined_vulnerabilities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              All Vulnerabilities ({combined_vulnerabilities.length})
            </h3>
          </div>

          <div className="space-y-3">
            {combined_vulnerabilities.map((vuln, idx) => {
              const colors = getRiskColor(vuln.risk);
              return (
                <div
                  key={idx}
                  className={`border-l-4 rounded-lg p-4 ${colors.bg} ${colors.border} border`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${colors.badge} text-white`}>
                          {vuln.source?.toUpperCase()}
                        </span>
                        <p className={`font-semibold ${colors.text}`}>{vuln.name}</p>
                      </div>
                      <p className={`text-sm ${colors.text}`}>{vuln.description}</p>
                      {vuln.cve && vuln.cve !== 'N/A' && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">{vuln.cve}</p>
                      )}
                    </div>
                    <span className={`font-bold px-3 py-1 rounded text-sm whitespace-nowrap ml-4 ${colors.badge} text-white`}>
                      {vuln.risk}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
