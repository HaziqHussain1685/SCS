import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

export function ScanProgressIndicator({ isScanning, startTime }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTotal] = useState(180); // 3 minutes estimated for nmap + ONVIF

  useEffect(() => {
    if (!isScanning || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isScanning, startTime]);

  if (!isScanning) return null;

  const progress = Math.min((elapsedTime / estimatedTotal) * 100, 95);
  const remaining = Math.max(estimatedTotal - elapsedTime, 0);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed bottom-8 right-8 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border border-blue-200 dark:border-blue-900">
      <div className="flex items-center gap-3 mb-4">
        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Scanning Camera Network</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Running nmap + ONVIF security analysis...</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Time Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Elapsed Time</p>
          <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
            {formatTime(elapsedTime)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Est. Time Remaining</p>
          <p className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
            {minutes}m {seconds}s
          </p>
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {Math.floor(progress)}% complete
        </p>
      </div>
    </div>
  );
}
