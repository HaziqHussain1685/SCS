import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Wifi, Globe, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { scannerAPI } from '../../services/api';

const DiscoveryModal = ({ isOpen, onClose, onSelectDevice }) => {
  const [discovering, setDiscovering] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [lastDiscoveryTime, setLastDiscoveryTime] = useState(null);
  const [error, setError] = useState(null);

  // Load previous discovery results on mount
  useEffect(() => {
    if (isOpen) {
      loadLastDiscovery();
    }
  }, [isOpen]);

  const loadLastDiscovery = async () => {
    try {
      const result = await scannerAPI.getLatestDiscovery();
      if (result.success && result.data) {
        setDiscoveredDevices(result.data.devices || []);
        setLastDiscoveryTime(result.data.scan_time);
      }
    } catch (err) {
      console.error('Error loading last discovery:', err);
    }
  };

  const handleStartDiscovery = async () => {
    setDiscovering(true);
    setError(null);
    setSelectedDevices(new Set());

    try {
      const result = await scannerAPI.discoverDevices();

      if (result.success) {
        setDiscoveredDevices(result.data.devices || []);
        setLastDiscoveryTime(result.data.scan_time);
      } else {
        setError('Failed to discover devices. Please try again.');
      }
    } catch (err) {
      console.error('Discovery error:', err);
      setError('Error during device discovery. Check if network access is available.');
    } finally {
      setDiscovering(false);
    }
  };

  const handleToggleDevice = (ip) => {
    const newSelected = new Set(selectedDevices);
    if (newSelected.has(ip)) {
      newSelected.delete(ip);
    } else {
      newSelected.add(ip);
    }
    setSelectedDevices(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDevices.size === discoveredDevices.length) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(discoveredDevices.map(d => d.ip_address)));
    }
  };

  const handleScanSelected = () => {
    if (selectedDevices.size === 0) {
      setError('Please select at least one device to scan');
      return;
    }

    const devicesToScan = Array.from(selectedDevices);
    onSelectDevice(devicesToScan);
    handleClose();
  };

  const handleClose = () => {
    setSelectedDevices(new Set());
    setError(null);
    onClose();
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'mDNS':
        return 'text-blue-400';
      case 'PortScan':
        return 'text-orange-400';
      case 'ONVIF':
        return 'text-emerald-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-bg-secondary rounded-xl shadow-2xl border border-cyan-500/20 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-bg-secondary/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Wifi className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Discover Network Devices</h2>
              <p className="text-sm text-text-secondary">
                Automatically find ONVIF cameras on your network
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Discovery Status */}
          {lastDiscoveryTime && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="w-4 h-4" />
                Last discovery: {new Date(lastDiscoveryTime).toLocaleString()}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Discovery Button */}
          <div className="flex gap-3">
            <button
              onClick={handleStartDiscovery}
              disabled={discovering}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                discovering
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500'
              }`}
            >
              {discovering ? (
                <>
                  <div className="animate-spin">
                    <Search className="w-5 h-5" />
                  </div>
                  Discovering...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {discoveredDevices.length > 0 ? 'Re-scan Network' : 'Scan Network'}
                </>
              )}
            </button>
          </div>

          {/* Device List */}
          {discoveredDevices.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">
                  Found {discoveredDevices.length} device{discoveredDevices.length !== 1 ? 's' : ''}
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {selectedDevices.size === discoveredDevices.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {discoveredDevices.map((device) => {
                  const isSelected = selectedDevices.has(device.ip_address);
                  return (
                    <label
                      key={device.ip_address}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleDevice(device.ip_address)}
                        className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <code className="text-text-primary font-mono font-semibold">
                            {device.ip_address}
                          </code>
                        </div>
                        <div className="text-xs text-text-secondary mt-1 ml-6">
                          {device.hostname || 'Unknown'} •{' '}
                          <span className={getMethodColor(device.discovery_method)}>
                            {device.discovery_method}
                          </span>
                          {device.open_ports && device.open_ports.length > 0 && (
                            <>
                              {' '}
                              • Ports: {device.open_ports.join(', ')}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 flex-shrink-0">
                        {device.discovery_method}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 rounded-lg border border-gray-600 text-text-primary hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScanSelected}
                  disabled={selectedDevices.size === 0}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    selectedDevices.size === 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                  }`}
                >
                  Scan Selected ({selectedDevices.size})
                </button>
              </div>
            </>
          )}

          {!discovering && discoveredDevices.length === 0 && !error && (
            <div className="text-center py-12">
              <Wifi className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">
                Click "Scan Network" to discover ONVIF devices on your local network
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DiscoveryModal;
