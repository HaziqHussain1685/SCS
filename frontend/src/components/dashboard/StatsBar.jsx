import React from 'react';
import Card from '../ui/Card';
import { motion } from 'framer-motion';

const StatsBar = ({ stats }) => {
  const statCards = [
    {
      icon: '📹',
      label: 'Total Devices',
      value: stats.total,
      subtitle: `${stats.online} Connected`,
      color: 'cyan',
    },
    {
      icon: '🔴',
      label: 'Critical Issues',
      value: stats.critical,
      subtitle: 'Requires attention',
      color: 'red',
      pulsing: stats.critical > 0,
    },
    {
      icon: '🛡️',
      label: 'Avg Health Score',
      value: `${stats.avgHealth}/100`,
      subtitle: stats.avgHealth < 60 ? 'Below threshold' : 'Good standing',
      color: stats.avgHealth >= 60 ? 'emerald' : 'amber',
    },
    {
      icon: '⚡',
      label: 'Last Scan',
      value: stats.lastScanTime,
      subtitle: stats.autoRefresh ? 'Auto-refresh: ON' : 'Manual mode',
      color: 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
};

const StatCard = ({ icon, label, value, subtitle, color, pulsing = false }) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-700/20 border-cyan-500/30',
    red: 'from-red-500/20 to-red-700/20 border-red-500/30',
    emerald: 'from-emerald-500/20 to-emerald-700/20 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-700/20 border-amber-500/30',
  };

  const textColors = {
    cyan: 'text-cyan-400',
    red: 'text-red-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <Card 
      className={`bg-gradient-to-br ${colorClasses[color]} ${pulsing ? 'animate-pulse-glow' : ''}`}
      hover={false}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-tertiary text-sm mb-2">{label}</p>
          <p className={`text-4xl font-bold ${textColors[color]} mb-1`}>
            {value}
          </p>
          <p className="text-text-tertiary text-xs">{subtitle}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </Card>
  );
};

export default StatsBar;
