import React from 'react';
import Card from '../ui/Card';
import { motion } from 'framer-motion';
import { getHealthScoreColor, getHealthScoreGradient } from '../../utils/helpers';

const HealthScoreGrid = ({ devices, onDeviceClick }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-heading font-bold mb-4 text-text-primary">
        Device Health Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {devices.map((device, index) => (
          <motion.div
            key={device.ip_address || device.name || index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <HealthMeter
              device={device}
              onClick={() => onDeviceClick(device)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const HealthMeter = ({ device, onClick }) => {
  const score = device.health_score;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const isOffline = device.status === 'offline';
  const isChecking = device.status === 'checking';
  const isUnavailable = isOffline || isChecking;

  return (
    <Card 
      onClick={onClick}
      className={`text-center ${isUnavailable ? 'opacity-50' : ''}`}
    >
      {/* Circular Progress */}
      <div className="relative w-40 h-40 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-bg-tertiary"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={isUnavailable ? circumference : offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : score >= 40 ? '#f59e0b' : '#ef4444'} />
              <stop offset="100%" stopColor={score >= 80 ? '#06b6d4' : score >= 60 ? '#10b981' : score >= 40 ? '#eab308' : '#f59e0b'} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${isUnavailable ? 'text-gray-400' : getHealthScoreColor(score)}`}>
            {isUnavailable ? '--' : score}
          </span>
          <span className="text-xs text-text-tertiary">{isOffline ? 'OFFLINE' : isChecking ? 'CHECKING' : 'HEALTH'}</span>
        </div>
      </div>

      {/* Device Info */}
      <h3 className="font-semibold text-text-primary mb-1">
        {device.device_name || device.name?.split(' - ')[0] || 'Unknown Device'}
      </h3>
      <p className="text-sm text-text-tertiary mb-3">
        {device.model || device.device_info?.model || 'Camera Device'}
      </p>

      {/* Risk Badge */}
      <div className={`
        inline-block px-3 py-1 rounded-full text-xs font-bold uppercase
        ${device.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500' :
          device.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500' :
          device.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
          device.risk_level === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
          'bg-gray-500/20 text-gray-400 border border-gray-500'}
      `}>
        {device.risk_level}
      </div>

      {/* View Details Button */}
      <button className="mt-4 w-full py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded border border-cyan-500/30 transition-all">
        View Details
      </button>
    </Card>
  );
};

export default HealthScoreGrid;
