import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { scannerAPI } from '../services/api';
import { formatDateTime, formatTimeAgo } from '../utils/helpers';
import { Clock, Calendar, Camera, AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryView = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedScan, setExpandedScan] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scannerAPI.getHistory();
      
      if (response.success) {
        // Sort by most recent first
        const sortedHistory = response.history.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setHistory(sortedHistory);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to fetch scan history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading scan history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No Scan History</h3>
          <p className="text-text-tertiary">Run your first scan to start building history.</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-heading font-bold text-text-primary mb-2">
          Scan History
        </h1>
        <p className="text-text-tertiary">
          View all previous network scans and their results
        </p>
      </div>

      {/* History Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Calendar className="text-cyan-400" />}
          label="Total Scans"
          value={history.length}
        />
        <StatCard
          icon={<Clock className="text-emerald-400" />}
          label="Last Scan"
          value={formatTimeAgo(history[0]?.timestamp)}
        />
        <StatCard
          icon={<Camera className="text-purple-400" />}
          label="Devices Tracked"
          value={history[0]?.devices?.length || 0}
        />
        <StatCard
          icon={<AlertTriangle className="text-red-400" />}
          label="Issues Found"
          value={getTotalIssues(history)}
        />
      </div>

      {/* History Timeline */}
      <Card hover={false}>
        <div className="space-y-4">
          {history.map((scan, index) => (
            <ScanHistoryItem
              key={scan.scan_id}
              scan={scan}
              isExpanded={expandedScan === scan.scan_id}
              onToggle={() => setExpandedScan(expandedScan === scan.scan_id ? null : scan.scan_id)}
              isLatest={index === 0}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-bg-tertiary rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-text-tertiary text-sm">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

const ScanHistoryItem = ({ scan, isExpanded, onToggle, isLatest }) => {
  const summary = {
    total: scan.devices?.length || 0,
    online: scan.devices?.filter(d => d.status === 'online').length || 0,
    critical: scan.devices?.filter(d => d.risk_level === 'CRITICAL').length || 0,
    high: scan.devices?.filter(d => d.risk_level === 'HIGH').length || 0,
    medium: scan.devices?.filter(d => d.risk_level === 'MEDIUM').length || 0,
    low: scan.devices?.filter(d => d.risk_level === 'LOW').length || 0,
  };

  const avgHealth = scan.devices?.length > 0
    ? Math.round(scan.devices.filter(d => d.status === 'online').reduce((sum, d) => sum + d.health_score, 0) / scan.devices.filter(d => d.status === 'online').length)
    : 0;

  return (
    <div
      className={`
        border rounded-lg transition-all
        ${isLatest ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-cyan-500/20 hover:border-cyan-500/40'}
      `}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Expand Icon */}
            <div className="mt-1">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-cyan-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              )}
            </div>

            {/* Scan Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-text-primary">
                  Scan #{scan.scan_id}
                </h3>
                {isLatest && (
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded border border-cyan-500/50">
                    LATEST
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-text-tertiary mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDateTime(scan.timestamp)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(scan.timestamp)}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-text-secondary">
                    {summary.online}/{summary.total} Online
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary">
                    Avg Health: 
                    <span className={`ml-1 font-bold ${
                      avgHealth >= 80 ? 'text-emerald-400' :
                      avgHealth >= 60 ? 'text-yellow-400' :
                      avgHealth >= 40 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {avgHealth}/100
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Badges */}
          <div className="flex gap-2">
            {summary.critical > 0 && (
              <Badge variant="CRITICAL" pulsing={isLatest}>
                {summary.critical} Critical
              </Badge>
            )}
            {summary.high > 0 && (
              <Badge variant="HIGH">
                {summary.high} High
              </Badge>
            )}
            {summary.low > 0 && (
              <Badge variant="LOW">
                {summary.low} Secure
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-cyan-500/20 p-4 bg-bg-tertiary"
        >
          <h4 className="text-sm font-semibold text-text-primary mb-3">Devices Scanned</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scan.devices?.map((device) => (
              <DeviceHistoryCard key={device.name} device={device} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const DeviceHistoryCard = ({ device }) => (
  <div className="p-3 bg-bg-secondary rounded-lg border border-cyan-500/10">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="text-2xl">📹</div>
        <div>
          <p className="font-semibold text-text-primary text-sm">
            {device.name.split(' - ')[0]}
          </p>
          <p className="text-xs text-text-tertiary">
            {device.device_info?.model || 'Unknown Model'}
          </p>
        </div>
      </div>
      <Badge variant={device.risk_level}>{device.risk_level}</Badge>
    </div>
    
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-tertiary">Health Score:</span>
      <span className={`font-bold ${
        device.health_score >= 80 ? 'text-emerald-400' :
        device.health_score >= 60 ? 'text-yellow-400' :
        device.health_score >= 40 ? 'text-amber-400' :
        'text-red-400'
      }`}>
        {device.status === 'offline' ? '--' : device.health_score}/100
      </span>
    </div>
    
    <div className="flex items-center justify-between text-xs mt-1">
      <span className="text-text-tertiary">Status:</span>
      <span className={device.status === 'online' ? 'text-emerald-400' : 'text-gray-400'}>
        {device.status === 'online' ? '🟢 Online' : '🔴 Offline'}
      </span>
    </div>
    
    {device.identified_risks?.length > 0 && (
      <div className="mt-2 pt-2 border-t border-cyan-500/10">
        <p className="text-xs text-text-tertiary mb-1">Issues:</p>
        <div className="flex flex-wrap gap-1">
          {device.identified_risks.slice(0, 2).map((risk, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded">
              {risk.issue.substring(0, 20)}...
            </span>
          ))}
          {device.identified_risks.length > 2 && (
            <span className="text-xs text-text-tertiary">
              +{device.identified_risks.length - 2} more
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);

const getTotalIssues = (history) => {
  if (!history || history.length === 0) return 0;
  return history.reduce((total, scan) => {
    const scanIssues = scan.devices?.reduce((count, device) => {
      return count + (device.identified_risks?.length || 0);
    }, 0) || 0;
    return total + scanIssues;
  }, 0);
};

export default HistoryView;
