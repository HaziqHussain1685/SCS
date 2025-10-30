import { formatDistanceToNow, format } from 'date-fns';

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
  } catch (error) {
    return 'Invalid date';
  }
};

export const getRiskColor = (riskLevel) => {
  const colors = {
    CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-600', glow: 'shadow-glow-red' },
    HIGH: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-600', glow: '' },
    MEDIUM: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', glow: '' },
    LOW: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-600', glow: 'shadow-glow-emerald' },
    OFFLINE: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-600', glow: '' },
    UNKNOWN: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-600', glow: '' },
  };
  return colors[riskLevel] || colors.UNKNOWN;
};

export const getHealthScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
};

export const getHealthScoreGradient = (score) => {
  if (score >= 80) return 'from-emerald-500 to-cyan-500';
  if (score >= 60) return 'from-yellow-500 to-emerald-500';
  if (score >= 40) return 'from-amber-500 to-yellow-500';
  return 'from-red-500 to-amber-500';
};

export const calculateAverageHealth = (devices) => {
  if (!devices || devices.length === 0) return 0;
  const onlineDevices = devices.filter(d => d.status === 'online');
  if (onlineDevices.length === 0) return 0;
  const total = onlineDevices.reduce((sum, device) => sum + device.health_score, 0);
  return Math.round(total / onlineDevices.length);
};

export const getCriticalIssuesCount = (devices) => {
  if (!devices || devices.length === 0) return 0;
  return devices.filter(d => d.risk_level === 'CRITICAL').length;
};

export const getServiceRisk = (port) => {
  if ([21, 2121].includes(port)) return 'HIGH';
  if ([23, 2323, 2324].includes(port)) return 'CRITICAL';
  if ([554, 5541, 5543, 5544].includes(port)) return 'MEDIUM';
  return 'MEDIUM';
};

export const getServiceIcon = (service) => {
  const icons = {
    HTTP: '🌐',
    FTP: '📁',
    Telnet: '💻',
    RTSP: '📹',
  };
  return icons[service] || '🔌';
};
