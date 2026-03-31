import React from 'react';
import { Shield, Activity, BarChart3, Settings, User, AlertTriangle, Radar, Lock } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, deviceStats, scanStatus }) => {
  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard', badge: deviceStats.online },
    { id: 'scan', icon: Radar, label: 'Network Scan' },
    { id: 'onvif-scan', icon: Lock, label: 'ONVIF Scan' },
    { id: 'vulnerabilities', icon: AlertTriangle, label: 'Vulnerabilities' },
    { id: 'history', icon: BarChart3, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-60 h-screen bg-bg-secondary border-r border-cyan-500/10 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-500" />
          <div>
            <h1 className="text-xl font-heading font-bold text-cyan-500">SmartCam</h1>
            <p className="text-xs text-text-tertiary">Shield</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                ${isActive 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-glow-cyan' 
                  : 'text-text-secondary hover:bg-bg-hover hover:text-cyan-400'
                }
              `}
            >
              <Icon size={20} />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 bg-cyan-500/30 text-cyan-400 rounded text-xs font-bold">
                  {item.badge}
                </span>
              )}
              
              {item.count !== undefined && (
                <span className="text-text-tertiary text-sm">({item.count})</span>
              )}
              
              {item.alert && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse-glow"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-cyan-500/10">
        <h3 className="text-sm font-semibold text-text-tertiary mb-3 uppercase tracking-wider">
          Quick Stats
        </h3>
        <div className="space-y-2">
          <StatItem color="red" count={deviceStats.critical} label="Critical" pulsing={deviceStats.critical > 0} />
          <StatItem color="amber" count={deviceStats.high} label="High" />
          <StatItem color="emerald" count={deviceStats.low} label="Secure" />
        </div>
      </div>

      {/* Scan Status */}
      {scanStatus.isScanning && (
        <div className="p-4 border-t border-cyan-500/10">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-sm font-semibold text-purple-400">Scanning...</span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${scanStatus.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {scanStatus.currentDevice || 'Initializing...'}
            </p>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">Administrator</p>
            <p className="text-xs text-text-tertiary truncate">admin@smartcam.shield</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const StatItem = ({ color, count, label, pulsing = false }) => {
  const colors = {
    red: 'text-red-400 bg-red-500/10 border-red-600',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-600',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-600',
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded border ${colors[color]} ${pulsing ? 'animate-pulse-glow' : ''}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-lg font-bold ${colors[color]}`}>{count}</span>
    </div>
  );
};

export default Sidebar;
