import React, { useState } from 'react';
import { X, RefreshCw, Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { getHealthScoreColor, formatDateTime } from '../../utils/helpers';

const DeviceModal = ({ device, onClose, onRescan }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!device) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: Shield },
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
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" icon={RefreshCw} onClick={onRescan}>
              Rescan Device
            </Button>
          </div>
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

const VulnerabilitiesTab = ({ device }) => (
  <div className="space-y-4">
    {device.identified_risks && device.identified_risks.length > 0 ? (
      device.identified_risks.map((risk, index) => (
        <div key={index} className="p-4 bg-bg-tertiary border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-text-primary">{risk.issue}</h4>
            <Badge variant={risk.severity}>{risk.severity}</Badge>
          </div>
          <p className="text-sm text-text-secondary mb-2">
            Impact: <span className="text-red-400 font-semibold">{risk.impact} points</span>
          </p>
        </div>
      ))
    ) : (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <p className="text-emerald-400 font-semibold">No vulnerabilities detected!</p>
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

const RecommendationsTab = ({ device }) => (
  <div className="space-y-4">
    {device.recommendations && device.recommendations.length > 0 ? (
      device.recommendations.map((rec, index) => (
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
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
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
      </div>
    )}
  </div>
);

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
