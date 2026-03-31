import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader, AlertCircle, ChevronRight } from 'lucide-react';

/**
 * Real-time scan timeline component
 * Shows progress through each scanning stage with status indicators
 */
const ScanTimeline = ({ scanStages = [], isScanning = false, currentStage = null }) => {
  // Default stages if not provided
  const defaultStages = [
    { id: 'connectivity', label: 'Device Connectivity', description: 'Checking if device is reachable' },
    { id: 'port_scan', label: 'Port Detection', description: 'Scanning for open ports' },
    { id: 'service_detection', label: 'Service Analysis', description: 'Identifying services and versions' },
    { id: 'vulnerability_analysis', label: 'Threat Assessment', description: 'Analyzing security vulnerabilities' },
    { id: 'report_generation', label: 'Report Generation', description: 'Compiling final assessment' },
  ];

  const stages = scanStages.length > 0 ? scanStages : defaultStages;

  const getStageStatus = (stageId) => {
    // If stage is completed
    if (currentStage && stages.map(s => s.id).indexOf(stageId) < stages.map(s => s.id).indexOf(currentStage)) {
      return 'completed';
    }
    // If stage is current
    if (currentStage === stageId && isScanning) {
      return 'in-progress';
    }
    // If stage is pending
    return 'pending';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (status === 'in-progress') {
      return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'border-green-500 bg-green-500/10';
    if (status === 'in-progress') return 'border-blue-500 bg-blue-500/10';
    return 'border-slate-700 bg-slate-800/50';
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          Scan Progress
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {isScanning ? 'Scanning in progress...' : 'Scan timeline'}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.id} className="flex gap-4">
              {/* Timeline Dot and Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative z-10 p-2 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                    ${getStatusColor(status)}
                  `}
                >
                  {getStatusIcon(status)}
                </div>
                {!isLast && (
                  <div
                    className={`
                      w-0.5 h-12 my-2 transition-all duration-300
                      ${status === 'completed' ? 'bg-green-500' : status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-700'}
                    `}
                  />
                )}
              </div>

              {/* Stage Content */}
              <div
                className={`
                  flex-1 pb-2 transition-all duration-300
                  ${status === 'in-progress' ? 'opacity-100 scale-100' : status === 'completed' ? 'opacity-75' : 'opacity-50'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold text-sm ${
                      status === 'in-progress' ? 'text-blue-300' :
                      status === 'completed' ? 'text-green-300' :
                      'text-slate-300'
                    }`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{stage.description}</p>
                  </div>
                </div>
              </div>

              {/* Status Label */}
              <div className="flex items-center">
                {status === 'completed' && (
                  <span className="text-xs font-semibold text-green-400 bg-green-500/20 px-2 py-1 rounded">
                    Done
                  </span>
                )}
                {status === 'in-progress' && (
                  <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-2 py-1 rounded animate-pulse">
                    Active
                  </span>
                )}
                {status === 'pending' && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-700 px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">Overall Progress</span>
            <span className="text-xs font-semibold text-cyan-400">
              {Math.round((stages.map(s => s.id).indexOf(currentStage) + 1) / stages.length * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((stages.map(s => s.id).indexOf(currentStage) + 1) / stages.length * 100)}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanTimeline;
