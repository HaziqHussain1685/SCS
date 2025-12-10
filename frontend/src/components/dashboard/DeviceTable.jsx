import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ChevronDown, ChevronRight, Terminal, Wifi } from 'lucide-react';
import { getServiceIcon } from '../../utils/helpers';

const DeviceTable = ({ devices, onDeviceClick }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'health_score', direction: 'asc' });

  const sortedDevices = React.useMemo(() => {
    let sortableDevices = [...devices];
    sortableDevices.sort((a, b) => {
      if (sortConfig.key === 'health_score') {
        return sortConfig.direction === 'asc' 
          ? a.health_score - b.health_score 
          : b.health_score - a.health_score;
      }
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });
    return sortableDevices;
  }, [devices, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-text-primary">
          Device Status
        </h2>
        <div className="text-sm text-text-tertiary">
          {devices.length} device{devices.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyan-500/20">
              <th className="text-left py-3 px-4 text-text-tertiary font-semibold text-sm"></th>
              <th 
                className="text-left py-3 px-4 text-text-tertiary font-semibold text-sm cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort('name')}
              >
                Device
              </th>
              <th className="text-left py-3 px-4 text-text-tertiary font-semibold text-sm">
                IP Address
              </th>
              <th 
                className="text-left py-3 px-4 text-text-tertiary font-semibold text-sm cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort('health_score')}
              >
                Health Score
              </th>
              <th className="text-left py-3 px-4 text-text-tertiary font-semibold text-sm">
                Risk Level
              </th>
              <th className="text-left py-3 px-4 text-text-tertiary font-semibold text-sm">
                Open Ports
              </th>
              <th className="text-left py-3 px-4 text-text-tertiary font-semibold text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((device, index) => (
              <React.Fragment key={device.ip_address || device.name || index}>
                <tr 
                  className={`
                    border-b border-cyan-500/10 hover:bg-bg-hover transition-colors cursor-pointer
                    ${device.risk_level === 'CRITICAL' ? 'border-l-4 border-l-red-500' : ''}
                    ${device.risk_level === 'HIGH' ? 'border-l-4 border-l-amber-500' : ''}
                  `}
                  onClick={() => setExpandedRow(expandedRow === (device.ip_address || device.name) ? null : (device.ip_address || device.name))}
                >
                  <td className="py-4 px-4">
                    {expandedRow === (device.ip_address || device.name) ? (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        📹
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{device.device_name || device.name?.split(' - ')[0] || 'Unknown Device'}</p>
                        <p className="text-sm text-text-tertiary">
                          {device.model || device.device_info?.model || 'Unknown Model'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <code className="font-mono text-sm text-cyan-400">{device.ip_address || device.ip || 'N/A'}</code>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            device.health_score >= 80 ? 'bg-emerald-500' :
                            device.health_score >= 60 ? 'bg-yellow-500' :
                            device.health_score >= 40 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${device.health_score}%` }}
                        />
                      </div>
                      <span className={`font-bold ${
                        device.health_score >= 80 ? 'text-emerald-400' :
                        device.health_score >= 60 ? 'text-yellow-400' :
                        device.health_score >= 40 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {device.status === 'offline' ? '--' : device.health_score}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={device.risk_level} pulsing={device.risk_level === 'CRITICAL'}>
                      {device.risk_level}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">
                      {device.open_ports.slice(0, 3).map((port) => (
                        <span 
                          key={port.port}
                          className="px-2 py-1 bg-bg-tertiary rounded text-xs font-mono text-text-secondary"
                          title={`${port.service} - ${port.risk} risk`}
                        >
                          {port.port}
                        </span>
                      ))}
                      {device.open_ports.length > 3 && (
                        <span className="px-2 py-1 text-xs text-text-tertiary">
                          +{device.open_ports.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeviceClick(device);
                      }}
                      className="px-3 py-1.5 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded border border-cyan-500/30 transition-all"
                    >
                      Details
                    </button>
                  </td>
                </tr>
                
                {/* Expanded Row */}
                {expandedRow === (device.ip_address || device.name) && (
                  <tr className="bg-bg-tertiary">
                    <td colSpan="7" className="py-4 px-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                            <Wifi size={16} className="text-cyan-400" />
                            Open Ports & Services
                          </h4>
                          <div className="space-y-2">
                            {device.open_ports.map((port) => (
                              <div 
                                key={port.port}
                                className="flex items-center justify-between p-2 bg-bg-secondary rounded"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">{getServiceIcon(port.service)}</span>
                                  <span className="font-mono text-sm text-text-primary">{port.port}</span>
                                  <span className="text-sm text-text-tertiary">{port.service}</span>
                                </span>
                                <Badge variant={port.risk}>{port.risk}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                            <Terminal size={16} className="text-cyan-400" />
                            Device Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3 p-2 bg-bg-secondary rounded">
                              <span className="text-text-tertiary w-24">Model:</span>
                              <span className="text-text-primary font-medium">{device.device_info?.model || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-bg-secondary rounded">
                              <span className="text-text-tertiary w-24">Firmware:</span>
                              <span className="text-text-primary font-medium">{device.firmware_info?.version || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-bg-secondary rounded">
                              <span className="text-text-tertiary w-24">Status:</span>
                              <span className="text-text-primary font-medium">{device.status === 'online' ? '🟢 Online' : '🔴 Offline'}</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-bg-secondary rounded">
                              <span className="text-text-tertiary w-24">Credentials:</span>
                              <span className="text-text-primary font-medium">
                                {device.default_credentials_detected 
                                  ? `⚠️ ${device.detected_username}:${device.detected_password}` 
                                  : '✅ Secure'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between p-2 bg-bg-secondary rounded">
    <span className="text-text-tertiary">{label}:</span>
    <span className="text-text-primary font-medium">{value}</span>
  </div>
);

export default DeviceTable;
