// React core
import React, { useState } from 'react';

// Icon imports for UI elements
import { X, RefreshCw, Shield, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';

// UI components
import Badge from '../ui/Badge';  // Status/risk level badges
import Button from '../ui/Button';  // Reusable button component

// Animation library for smooth transitions
import { motion, AnimatePresence } from 'framer-motion';

// Utility functions for formatting
import { getHealthScoreColor, formatDateTime } from '../../utils/helpers';

/**
 * DeviceModal - Full-screen modal displaying comprehensive device security information
 * Features three tabs: Overview (general info), Vulnerabilities (security issues), Recommendations (fixes)
 * Supports both scanned cameras (from API) and manual cameras (from localStorage)
 * 
 * @param {Object} device - Device object with security scan results
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onRescan - Callback to trigger device rescan
 * @param {Function} onDelete - Callback to delete manual camera
 */
const DeviceModal = ({ device, onClose, onRescan, onDelete }) => {
  // ===== STATE =====
  const [activeTab, setActiveTab] = useState('overview');  // Current tab (overview/vulnerabilities/recommendations)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);  // Delete confirmation dialog visibility

  // Guard clause - don't render if no device provided
  if (!device) return null;

  // Tab configuration with icons
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },  // Device details and stats
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },  // Security issues
    { id: 'recommendations', label: 'Recommendations', icon: Shield },  // Remediation steps
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-bg-secondary border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-bg-tertiary border-b border-cyan-500/20 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl">
                  📹
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-text-primary">
                    {device.name}
                  </h2>
                  <p className="text-text-tertiary">
                    {device.device_info?.model || 'Camera Device'} • {device.ip}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={device.risk_level} pulsing={device.risk_level === 'CRITICAL'}>
                  {device.risk_level}
                </Badge>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
                >
                  <X className="text-text-tertiary hover:text-text-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-cyan-500/20 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 transition-all
                    ${activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-text-tertiary hover:text-text-primary'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            {activeTab === 'overview' && <OverviewTab device={device} />}
            {activeTab === 'vulnerabilities' && <VulnerabilitiesTab device={device} />}
            {activeTab === 'recommendations' && <RecommendationsTab device={device} />}
          </div>

          {/* Footer */}
          <div className="bg-bg-tertiary border-t border-cyan-500/20 p-6 flex justify-between">
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              {device.manual && onDelete && (
                <Button 
                  variant="ghost" 
                  icon={Trash2} 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Delete Camera
                </Button>
              )}
            </div>
            <Button variant="primary" icon={RefreshCw} onClick={onRescan}>
              Rescan Device
            </Button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-bg-secondary border border-red-500/30 rounded-xl p-6 max-w-md mx-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Delete Camera?</h3>
                    <p className="text-sm text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-cyan-400">{device.device_name}</span>? 
                  This will permanently remove the camera from your dashboard.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    icon={Trash2}
                    onClick={() => {
                      onDelete(device.ip_address);
                      onClose();
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const OverviewTab = ({ device }) => (
  <div className="space-y-6">
    {/* Health Score */}
    <div className="grid grid-cols-3 gap-4">
      <InfoCard label="Health Score" value={device.health_score} valueClass={getHealthScoreColor(device.health_score)} suffix="/100" />
      <InfoCard label="Status" value={device.status === 'online' ? '🟢 Online' : '🔴 Offline'} />
      <InfoCard label="Open Ports" value={device.open_ports.length} />
    </div>

    {/* Device Info */}
    <div>
      <h3 className="text-lg font-bold text-text-primary mb-4">Device Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <InfoRow label="Model" value={device.device_info?.model || 'N/A'} />
        <InfoRow label="Manufacturer" value={device.device_info?.manufacturer || 'N/A'} />
        <InfoRow label="Firmware" value={device.firmware_info?.version || 'N/A'} />
        <InfoRow label="Firmware Status" value={device.firmware_info?.status || 'N/A'} />
        <InfoRow label="Last Scan" value={formatDateTime(device.scan_time)} />
        <InfoRow label="Container" value={device.container_name} />
      </div>
    </div>

    {/* Open Ports */}
    <div>
      <h3 className="text-lg font-bold text-text-primary mb-4">Open Ports & Services</h3>
      <div className="grid grid-cols-2 gap-3">
        {device.open_ports.map((port) => (
          <div key={port.port} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-cyan-500/10">
            <div>
              <p className="font-mono text-cyan-400 font-semibold">{port.port}</p>
              <p className="text-sm text-text-tertiary">{port.service}</p>
            </div>
            <Badge variant={port.risk}>{port.risk}</Badge>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VulnerabilitiesTab = ({ device }) => {
  // Support both manual cameras (vulnerabilities) and scanned cameras (identified_risks)
  const vulnerabilities = device.vulnerabilities || [];
  const identifiedRisks = device.identified_risks || [];
  const hasVulnerabilities = vulnerabilities.length > 0 || identifiedRisks.length > 0;

  return (
    <div className="space-y-4">
      {/* Manual camera vulnerabilities */}
      {vulnerabilities.map((vuln, index) => (
        <div 
          key={`vuln-${index}`} 
          className={`p-4 bg-bg-tertiary rounded-lg border-l-4 ${
            vuln.severity === 'CRITICAL' ? 'border-red-500' :
            vuln.severity === 'HIGH' ? 'border-orange-500' :
            vuln.severity === 'MEDIUM' ? 'border-yellow-500' :
            'border-blue-500'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-text-primary">{vuln.name}</h4>
            <Badge variant={vuln.severity}>{vuln.severity}</Badge>
          </div>
          <p className="text-sm text-text-secondary mb-3">{vuln.description}</p>
          <div className="flex items-start gap-2 bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
            <Shield className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-cyan-400 font-semibold mb-1">Recommendation</p>
              <p className="text-sm text-gray-300">{vuln.recommendation}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Scanned camera risks */}
      {identifiedRisks.map((risk, index) => (
        <div key={`risk-${index}`} className="p-4 bg-bg-tertiary border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-text-primary">{risk.issue}</h4>
            <Badge variant={risk.severity}>{risk.severity}</Badge>
          </div>
          <p className="text-sm text-text-secondary mb-2">
            Impact: <span className="text-red-400 font-semibold">{risk.impact} points</span>
          </p>
        </div>
      ))}

      {!hasVulnerabilities && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-400 font-semibold">No vulnerabilities detected!</p>
          <p className="text-gray-400 text-sm mt-2">This device has a strong security posture</p>
        </div>
      )}

      {/* CVEs */}
      {device.firmware_info?.cves && device.firmware_info.cves.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Known CVEs</h3>
          <div className="space-y-2">
            {device.firmware_info.cves.map((cve, index) => (
              <div key={index} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <code className="text-red-400 font-mono">{cve}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RecommendationsTab = ({ device }) => {
  // Support both manual cameras (vulnerabilities) and scanned cameras (recommendations)
  const recommendations = device.recommendations || [];
  const vulnerabilities = device.vulnerabilities || [];
  
  // Generate recommendations from vulnerabilities for manual cameras
  const generatedRecommendations = vulnerabilities.map((vuln, index) => {
    const severityToPriority = {
      'CRITICAL': 'CRITICAL',
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW'
    };

    const actionSteps = {
      'Weak Default Credentials': [
        'Access camera web interface',
        'Navigate to Settings → Security',
        `Change username from '${device.detected_username}' to a unique username`,
        'Create a strong password (min 12 characters, mix of letters, numbers, symbols)',
        'Save changes and log in with new credentials',
        'Verify access works before closing browser'
      ],
      'Default Credentials': [
        'Log into camera web interface',
        'Go to System Settings → Password',
        'Change from default credentials to strong password',
        'Use password manager to store new credentials',
        'Test login with new password'
      ],
      'Outdated Firmware': [
        'Check manufacturer website for latest firmware',
        `Current version: ${device.firmware_version}`,
        'Download latest firmware package',
        'Backup camera settings before update',
        'Upload firmware via web interface',
        'Wait for update to complete (do not power off)',
        'Verify camera functionality after update'
      ],
      'Insecure Telnet Service': [
        'Access camera configuration',
        'Navigate to Network Services',
        'Disable Telnet service (port 23)',
        'Enable SSH if remote access is needed',
        'Configure SSH with key-based authentication',
        'Test SSH connection',
        'Verify Telnet port is closed with port scan'
      ],
      'Open FTP Service': [
        'Log into camera admin panel',
        'Go to Services → FTP Settings',
        'Disable FTP service',
        'Use SFTP or FTPS if file transfer is required',
        'Configure secure credentials for SFTP',
        'Test file transfer with secure protocol'
      ],
      'Unencrypted HTTP': [
        'Access camera web interface',
        'Navigate to Network → HTTPS Settings',
        'Enable HTTPS/SSL',
        'Generate or upload SSL certificate',
        'Set HTTPS as default protocol',
        'Update bookmarks to use https://',
        'Optionally disable HTTP port'
      ],
      'Minor Configuration Issue': [
        'Review all security settings in camera interface',
        'Enable automatic security updates if available',
        'Set strong SNMP community strings',
        'Disable unused network services',
        'Configure network segmentation/VLAN',
        'Set up monitoring and alerting'
      ]
    };

    return {
      action: vuln.name,
      priority: severityToPriority[vuln.severity] || 'MEDIUM',
      steps: actionSteps[vuln.name] || [
        'Contact security team for guidance',
        'Review manufacturer documentation',
        'Apply security patches if available',
        'Monitor device for suspicious activity'
      ]
    };
  });

  const allRecommendations = [...recommendations, ...generatedRecommendations];
  
  // Sort by priority
  const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
  const sortedRecommendations = allRecommendations.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="space-y-4">
      {sortedRecommendations.length > 0 ? (
        sortedRecommendations.map((rec, index) => (
          <div key={index} className="p-4 bg-bg-tertiary rounded-lg border border-cyan-500/10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-cyan-400">#{index + 1}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary">{rec.action}</h4>
                <Badge variant={rec.priority} className="mt-1">{rec.priority}</Badge>
              </div>
            </div>
            <div className="ml-10 space-y-2">
              {rec.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-secondary">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-400 font-semibold">All good! No actions needed.</p>
          <p className="text-gray-400 text-sm mt-2">This device is properly secured</p>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ label, value, valueClass = 'text-text-primary', suffix = '' }) => (
  <div className="p-4 bg-bg-tertiary rounded-lg border border-cyan-500/10">
    <p className="text-text-tertiary text-sm mb-1">{label}</p>
    <p className={`text-2xl font-bold ${valueClass}`}>
      {value}{suffix}
    </p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="p-3 bg-bg-tertiary rounded-lg">
    <p className="text-text-tertiary text-sm">{label}</p>
    <p className="text-text-primary font-semibold">{value}</p>
  </div>
);

export default DeviceModal;
