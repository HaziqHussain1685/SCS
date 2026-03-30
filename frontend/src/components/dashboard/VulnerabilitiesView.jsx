import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Zap, RefreshCw, FileText } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import VulnerabilityCard from './VulnerabilityCard';
import VulnerabilityRemediationModal from './VulnerabilityRemediationModal';

const VulnerabilitiesView = () => {
  const [analysis, setAnalysis] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [remediationModalOpen, setRemediationModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch analysis
      const analysisRes = await fetch('http://localhost:5000/api/vulnerabilities/from-results');
      const analysisData = await analysisRes.json();
      
      if (analysisData.success) {
        setAnalysis(analysisData.data);
      } else {
        setError(analysisData.message);
      }

      // Fetch summary
      const summaryRes = await fetch('http://localhost:5000/api/vulnerabilities/summary');
      const summaryData = await summaryRes.json();
      
      if (summaryData.success) {
        setSummary(summaryData);
      }
    } catch (err) {
      setError('Failed to fetch vulnerability data. Make sure scan results are saved in the results folder.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (vuln, deviceName) => {
    setSelectedVuln(vuln);
    setSelectedDevice(deviceName);
    setRemediationModalOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('http://localhost:5000/api/vulnerabilities/export', {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vulnerability_report_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate report');
      }
    } catch (err) {
      alert('Error exporting report');
    } finally {
      setExporting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-900/30 border-red-700';
      case 'HIGH':
        return 'text-orange-400 bg-orange-900/30 border-orange-700';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
      default:
        return 'text-blue-400 bg-blue-900/30 border-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading vulnerability analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-700 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-200 mb-2">Unable to Load Vulnerabilities</h3>
            <p className="text-red-100 mb-4">{error}</p>
            <Button onClick={fetchVulnerabilities} variant="primary" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!analysis || analysis.devices.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Scan Results Found</h3>
        <p className="text-gray-400 mb-4">
          Run scans and save results to the results folder to see vulnerability analysis here.
        </p>
        <Button onClick={fetchVulnerabilities} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Check for Results
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {summary && (
        <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-purple-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Security Assessment Summary</h2>
              <p className="text-gray-400 text-sm">
                Last updated: {new Date(summary.last_updated).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="primary"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              {exporting ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>

          {/* Main Message */}
          <div className="bg-black/30 rounded-lg p-4 mb-4 border border-purple-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">
              {analysis.summary.message}
            </h3>
            <p className="text-gray-300 mb-3">{analysis.summary.action}</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-black/30 rounded-lg p-4 border border-blue-700/50">
              <p className="text-gray-400 text-sm mb-1">Total Cameras</p>
              <p className="text-3xl font-bold text-blue-400">{analysis.summary.total_devices}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-red-700/50">
              <p className="text-gray-400 text-sm mb-1">Critical Issues</p>
              <p className="text-3xl font-bold text-red-400">{analysis.summary.critical_issues}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-yellow-700/50">
              <p className="text-gray-400 text-sm mb-1">Avg. Health Score</p>
              <p className="text-3xl font-bold text-yellow-400">{analysis.summary.average_health_score}/100</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-purple-700/50">
              <p className="text-gray-400 text-sm mb-1">Analyzed</p>
              <p className="text-3xl font-bold text-purple-400">{new Date(analysis.summary.average_health_score).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-black/30 rounded-lg p-4 border border-green-700/50">
            <h4 className="font-semibold text-green-200 mb-2">Recommended Actions:</h4>
            <ul className="space-y-1 text-green-100 text-sm">
              {analysis.summary.next_steps?.map((step, idx) => (
                <li key={idx}>• {step}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Severity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-900/20 border-red-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-red-200 text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-100">{summary?.critical_count || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-orange-900/20 border-orange-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-orange-200 text-sm">High</p>
              <p className="text-2xl font-bold text-orange-100">{summary?.high_count || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-900/20 border-yellow-700">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-yellow-200 text-sm">Medium</p>
              <p className="text-2xl font-bold text-yellow-100">{summary?.medium_count || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-900/20 border-blue-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-blue-200 text-sm">Devices</p>
              <p className="text-2xl font-bold text-blue-100">{analysis?.devices?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Device Vulnerabilities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Detailed Vulnerability Analysis</h3>
          <Button onClick={fetchVulnerabilities} variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {analysis.devices.map((device) => (
          <Card key={device.device_name} className="p-0 overflow-hidden">
            {/* Device Header */}
            <div className="bg-gray-900 p-4 border-b border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-lg font-semibold text-white">{device.device_name}</h4>
                  <p className="text-sm text-gray-400">IP: {device.device_ip}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(device.risk_level)}`}>
                    {device.risk_level}
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">{device.health_score}/100</div>
                </div>
              </div>
            </div>

            {/* Vulnerabilities List */}
            {device.vulnerabilities && device.vulnerabilities.length > 0 ? (
              <div className="p-4 space-y-3">
                {device.vulnerabilities.map((vuln, idx) => (
                  <VulnerabilityCard
                    key={idx}
                    vulnerability={vuln}
                    deviceName={device.device_name}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                No vulnerabilities detected
              </div>
            )}

            {/* Last Scan Time */}
            <div className="bg-gray-900 px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
              Last scanned: {new Date(device.scan_time).toLocaleString()}
            </div>
          </Card>
        ))}
      </div>

      {/* Remediation Modal */}
      <VulnerabilityRemediationModal
        isOpen={remediationModalOpen}
        onClose={() => setRemediationModalOpen(false)}
        vulnerability={selectedVuln}
        deviceName={selectedDevice}
      />
    </div>
  );
};

export default VulnerabilitiesView;
