import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Activity, Wifi, Lock, Eye, Zap } from 'lucide-react';

const AttackFeed = () => {
  const [attacks, setAttacks] = useState([]);
  const [isActive, setIsActive] = useState(true);

  // Attack types with icons and colors
  const attackTypes = [
    { 
      type: 'Brute Force Attack', 
      icon: Lock, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    { 
      type: 'Port Scan', 
      icon: Wifi, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    { 
      type: 'Exploit Attempt', 
      icon: AlertTriangle, 
      color: 'text-red-600',
      bgColor: 'bg-red-600/10',
      borderColor: 'border-red-600/30'
    },
    { 
      type: 'Unauthorized Access', 
      icon: Eye, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/10',
      borderColor: 'border-orange-600/30'
    },
    { 
      type: 'DDoS Attack', 
      icon: Zap, 
      color: 'text-red-700',
      bgColor: 'bg-red-700/10',
      borderColor: 'border-red-700/30'
    },
    { 
      type: 'Malware Injection', 
      icon: AlertTriangle, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    }
  ];

  const cameras = ['Camera-1', 'Camera-2', 'Camera-3', 'Camera-4'];
  
  const sources = [
    '192.168.1.100', '192.168.1.105', '192.168.1.112', '192.168.1.156',
    '10.0.0.45', '10.0.0.89', '172.16.0.23', '172.16.0.67',
    '203.45.12.89', '185.220.101.5', '94.142.241.111'
  ];

  // Generate random attack
  const generateAttack = () => {
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const target = cameras[Math.floor(Math.random() * cameras.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const blocked = Math.random() > 0.3; // 70% blocked, 30% warning
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });

    return {
      id: Date.now() + Math.random(),
      time,
      type: attackType.type,
      icon: attackType.icon,
      color: attackType.color,
      bgColor: attackType.bgColor,
      borderColor: attackType.borderColor,
      target,
      source,
      blocked
    };
  };

  // Add new attacks periodically
  useEffect(() => {
    if (!isActive) return;

    // Add initial attacks
    const initialAttacks = Array.from({ length: 3 }, generateAttack);
    setAttacks(initialAttacks);

    // Generate new attacks every 5-10 seconds
    const interval = setInterval(() => {
      const newAttack = generateAttack();
      setAttacks(prev => {
        const updated = [newAttack, ...prev];
        return updated.slice(0, 8); // Keep only last 8 attacks
      });
    }, Math.random() * 5000 + 5000); // Random interval between 5-10s

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-6 h-6 text-cyan-400" />
            {isActive && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Security Feed</h3>
            <p className="text-sm text-gray-400">Real-time threat monitoring</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive 
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Attack Feed Container */}
      <div className="bg-[#0F1629] border border-cyan-500/20 rounded-xl overflow-hidden">
        <div className="h-[280px] overflow-hidden relative">
          {/* Background grid effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,191,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,191,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          {/* Attack List */}
          <div className="relative z-10 p-4 space-y-2 h-full overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {attacks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-gray-500"
                >
                  <Shield className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">No threats detected</p>
                  <p className="text-sm">System is secure</p>
                </motion.div>
              )}
              
              {attacks.map((attack) => {
                const Icon = attack.icon;
                return (
                  <motion.div
                    key={attack.id}
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${attack.bgColor} ${attack.borderColor} backdrop-blur-sm`}
                  >
                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      {attack.blocked ? (
                        <div className="relative">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <motion.div
                            className="absolute inset-0 bg-green-500 rounded-full"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <AlertTriangle className="w-6 h-6 text-orange-500" />
                          <motion.div
                            className="absolute inset-0 bg-orange-500 rounded-full"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Attack Icon */}
                    <div className={`flex-shrink-0 ${attack.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Attack Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${attack.blocked ? 'text-green-400' : 'text-orange-400'}`}>
                          {attack.blocked ? 'BLOCKED' : 'WARNING'}
                        </span>
                        <span className="text-white">|</span>
                        <span className={`font-medium ${attack.color}`}>
                          {attack.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="text-cyan-400 font-mono">{attack.target}</span>
                        </span>
                        <span>←</span>
                        <span className="font-mono">{attack.source}</span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-xs text-gray-500 font-mono">
                      {attack.time}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-[#0A0F1C] border-t border-cyan-500/20 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-400">Blocked:</span>
                <span className="text-green-400 font-semibold">
                  {attacks.filter(a => a.blocked).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-gray-400">Warnings:</span>
                <span className="text-orange-400 font-semibold">
                  {attacks.filter(a => !a.blocked).length}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>Live monitoring active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackFeed;
