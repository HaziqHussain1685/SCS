import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Download, CheckSquare } from 'lucide-react';
import Button from '../ui/Button';
import { exportScanResultsAsJSON, exportScanResultsAsCSV, exportScanResultsAsHTML } from '../../utils/exportUtils';

const ExportReportModal = ({ isOpen, onClose, devices, scanResults }) => {
  const [exporting, setExporting] = useState(false);
  // Use fresh scanResults devices if available, otherwise fallback to devices prop
  const devicesToDisplay = scanResults ? [{ 
    ip_address: scanResults.target_ip,
    device_name: `Smart Camera (${scanResults.target_ip})`,
    health_score: scanResults.global_health_score,
    risk_level: scanResults.global_risk_level
  }] : devices;
  
  const [selectedDevices, setSelectedDevices] = useState(
    devicesToDisplay.map(d => d.ip_address || d.name)
  );
  const [exportFormat, setExportFormat] = useState('html'); // html, csv, json
  const [options, setOptions] = useState({
    include_summary: true,
    include_stats: true,
    include_device_details: true,
    include_vulnerabilities: true,
    include_recommendations: true
  });

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const devicesToExport = devicesToDisplay.filter(d => 
        selectedDevices.includes(d.ip_address || d.name)
      );

      if (devicesToExport.length === 0) {
        alert('Please select at least one device to export');
        setExporting(false);
        return;
      }

      // Use fresh scanResults if available for most current data
      const reportData = scanResults ? {
        target_ip: scanResults.target_ip,
        scan_time: scanResults.scan_time,
        global_health_score: scanResults.global_health_score,
        global_risk_level: scanResults.global_risk_level,
        nmap: scanResults.nmap,
        onvif: scanResults.onvif,
        combined_vulnerabilities: scanResults.combined_vulnerabilities,
        devices: devicesToExport,
        options: options
      } : {
        target_ip: devicesToExport[0]?.ip_address || devicesToExport[0]?.ip || 'Unknown',
        scan_time: new Date().toISOString(),
        global_health_score: devicesToExport[0]?.health_score || 75,
        global_risk_level: devicesToExport[0]?.risk_level || 'LOW',
        nmap: devicesToExport[0]?.nmap_data || null,
        onvif: devicesToExport[0]?.onvif_data || null,
        combined_vulnerabilities: devicesToExport[0]?.vulnerabilities || [],
        devices: devicesToExport,
        options: options
      };

      // Export based on selected format
      if (exportFormat === 'html') {
        exportScanResultsAsHTML(reportData);
      } else if (exportFormat === 'csv') {
        exportScanResultsAsCSV(reportData);
      } else if (exportFormat === 'json') {
        exportScanResultsAsJSON(reportData);
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export report: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const toggleDevice = (deviceId) => {
    if (selectedDevices.includes(deviceId)) {
      setSelectedDevices(selectedDevices.filter(d => d !== deviceId));
    } else {
      setSelectedDevices([...selectedDevices, deviceId]);
    }
  };

  const toggleAll = () => {
    if (selectedDevices.length === devicesToDisplay.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devicesToDisplay.map(d => d.ip_address || d.name));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-bg-secondary rounded-xl shadow-2xl border border-cyan-500/20 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Export Security Report</h2>
              <p className="text-sm text-text-secondary">Generate a comprehensive PDF report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Device Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Select Devices</h3>
              <button
                onClick={toggleAll}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                {selectedDevices.length === devicesToDisplay.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-bg-tertiary rounded-lg border border-gray-700">
              {devicesToDisplay.map((device) => {
                const deviceId = device.ip_address || device.name;
                const isSelected = selectedDevices.includes(deviceId);
                
                return (
                  <label
                    key={deviceId}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDevice(deviceId)}
                      className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="text-text-primary font-medium">
                        {device.device_name || device.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {deviceId} • Health: {device.health_score}/100
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      device.health_score >= 80 ? 'text-emerald-400' :
                      device.health_score >= 60 ? 'text-blue-400' :
                      device.health_score >= 40 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {device.health_score}
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedDevices.length === 0 && (
              <p className="text-sm text-orange-400 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Please select at least one device
              </p>
            )}
          </div>

          {/* Report Sections */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <h3 className="font-semibold text-text-primary">Report Sections</h3>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-700 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={options.include_summary}
                  onChange={(e) => setOptions({ ...options, include_summary: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <div>
                  <div className="text-text-primary font-medium">Executive Summary</div>
                  <div className="text-xs text-text-secondary">Overview and key findings</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-700 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={options.include_stats}
                  onChange={(e) => setOptions({ ...options, include_stats: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <div>
                  <div className="text-text-primary font-medium">Statistics & Charts</div>
                  <div className="text-xs text-text-secondary">Health distribution and metrics</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-700 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={options.include_device_details}
                  onChange={(e) => setOptions({ ...options, include_device_details: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <div>
                  <div className="text-text-primary font-medium">Device Details</div>
                  <div className="text-xs text-text-secondary">Individual device information</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-700 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={options.include_vulnerabilities}
                  onChange={(e) => setOptions({ ...options, include_vulnerabilities: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <div>
                  <div className="text-text-primary font-medium">Vulnerabilities</div>
                  <div className="text-xs text-text-secondary">Detailed security issues</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-700 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={options.include_recommendations}
                  onChange={(e) => setOptions({ ...options, include_recommendations: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <div>
                  <div className="text-text-primary font-medium">Recommendations</div>
                  <div className="text-xs text-text-secondary">Action items and fixes</div>
                </div>
              </label>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <h3 className="font-semibold text-text-primary">Export Format</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat('html')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportFormat === 'html'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-700 bg-bg-tertiary hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-text-primary mb-1">HTML</div>
                <div className="text-xs text-text-secondary">Formatted report</div>
              </button>

              <button
                onClick={() => setExportFormat('csv')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportFormat === 'csv'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-700 bg-bg-tertiary hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-text-primary mb-1">CSV</div>
                <div className="text-xs text-text-secondary">Spreadsheet</div>
              </button>

              <button
                onClick={() => setExportFormat('json')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportFormat === 'json'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-700 bg-bg-tertiary hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-text-primary mb-1">JSON</div>
                <div className="text-xs text-text-secondary">Raw data</div>
              </button>
            </div>
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cyan-100">
                <p className="font-semibold mb-1">Report Preview</p>
                <p className="text-cyan-200/80">
                  Your report will include {selectedDevices.length} device(s) with{' '}
                  {Object.values(options).filter(Boolean).length} section(s) in {exportFormat.toUpperCase()} format.
                  The file will be downloaded automatically when ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || selectedDevices.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportReportModal;
