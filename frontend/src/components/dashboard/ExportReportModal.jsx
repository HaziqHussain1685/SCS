import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Download, CheckSquare } from 'lucide-react';
import Button from '../ui/Button';

const ExportReportModal = ({ isOpen, onClose, devices }) => {
  const [exporting, setExporting] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState(devices.map(d => d.ip_address || d.name));
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
      const devicesToExport = devices.filter(d => 
        selectedDevices.includes(d.ip_address || d.name)
      );

      const response = await fetch('http://127.0.0.1:5000/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devices: devicesToExport,
          options: options
        }),
      });

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SmartCam_Security_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('PDF generation failed:', errorData);
        alert(`Failed to generate PDF report: ${errorData.message || 'Please check that reportlab is installed and the backend is running.'}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export report: ${error.message}. Make sure the backend API is running on port 5000.`);
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
    if (selectedDevices.length === devices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices.map(d => d.ip_address || d.name));
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
                {selectedDevices.length === devices.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-bg-tertiary rounded-lg border border-gray-700">
              {devices.map((device) => {
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

          {/* Preview Info */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cyan-100">
                <p className="font-semibold mb-1">Report Preview</p>
                <p className="text-cyan-200/80">
                  Your report will include {selectedDevices.length} device(s) with{' '}
                  {Object.values(options).filter(Boolean).length} section(s).
                  The PDF will be downloaded automatically when ready.
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
            {exporting ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportReportModal;
