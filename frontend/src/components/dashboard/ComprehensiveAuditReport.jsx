import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Zap, Clock, TrendingDown, FileText, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ComprehensiveAuditReport - Professional security audit report display
 * Shows all findings from 8-scanner comprehensive security audit
 */
const ComprehensiveAuditReport = ({ auditData, device }) => {
  const [expandedSection, setExpandedSection] = useState('overview');
  const [expandedFinding, setExpandedFinding] = useState(null);

  if (!auditData) {
    return <div className="p-8 text-center text-gray-500">No audit data available</div>;
  }

  const {
    overall_risk_score = 0,
    overall_risk_level = 'UNKNOWN',
    summary = {},
    all_findings = [],
    recommendations = [],
    scanners = {},
    target_ip = '',
    scan_duration_seconds = 0,
    timestamp = new Date().toISOString()
  } = auditData;

  // Risk level color mapping
  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-300';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-300';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-300';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'MEDIUM':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'LOW':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-gray-600" />;
    }
  };

  // Helper to convert objects to readable text
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item, i) => (
          <div key={i} className="text-sm">
            • {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ));
      } else {
        return <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
      }
    }
    return String(value || '');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ===== AUDIT HEADER ===== */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Security Audit Report
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Target: {target_ip}</span>
              <span>•</span>
              <span>{new Date(timestamp).toLocaleString()}</span>
              <span>•</span>
              <span>{summary.scanners_completed || 0}/8 scanners completed</span>
            </div>
          </div>
          
          {/* Risk Score Display */}
          <div className="text-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${getRiskColor(overall_risk_level)}`}>
              <div className="text-center">
                <div className="text-4xl font-bold">{overall_risk_score.toFixed(1)}</div>
                <div className="text-xs font-semibold uppercase">{overall_risk_level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{summary.critical_issues || 0}</div>
            <div className="text-sm text-slate-600">Critical Issues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{summary.high_issues || 0}</div>
            <div className="text-sm text-slate-600">High Issues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{summary.medium_issues || 0}</div>
            <div className="text-sm text-slate-600">Medium Issues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-600">{summary.vulnerabilities_found || 0}</div>
            <div className="text-sm text-slate-600">Total Findings</div>
          </div>
        </div>

        {/* Scan Duration */}
        <div className="mt-4 text-sm text-slate-600 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Scan completed in {scan_duration_seconds?.toFixed(2) || 0} seconds</span>
        </div>
      </div>

      {/* ===== SCANNER STATUS OVERVIEW ===== */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <button
          onClick={() => toggleSection('scanners')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50"
        >
          <h2 className="text-xl font-bold text-slate-900">Scanner Status</h2>
          {expandedSection === 'scanners' ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSection === 'scanners' && (
          <div className="border-t border-slate-200 p-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'NMAP', key: 'nmap', desc: 'Port & Service Scanning' },
                { name: 'ONVIF', key: 'onvif', desc: 'Camera Protocol Security' },
                { name: 'IoTNet', key: 'iotnet', desc: 'Network Traffic Analysis' },
                { name: 'TelnetShell', key: 'telnetshell', desc: 'Telnet Enumeration' },
                { name: 'NetFlows', key: 'netflows', desc: 'Network Flow Mapping' },
                { name: 'ChipSec', key: 'chipsec', desc: 'Firmware Security' },
                { name: 'FFind', key: 'ffind', desc: 'Firmware Extraction' },
                { name: 'PicoCom', key: 'picocom', desc: 'Serial Console Access' }
              ].map((scanner) => {
                const status = scanners[scanner.key]?.status || 'unknown';
                const statusColor = status === 'completed' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : 'text-gray-600';
                const statusIcon = status === 'completed' ? '✓' : status === 'failed' ? '✗' : '○';
                
                return (
                  <div key={scanner.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                    <span className={`text-lg font-bold ${statusColor}`}>{statusIcon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{scanner.name}</div>
                      <div className="text-xs text-slate-600">{scanner.desc}</div>
                    </div>
                    <span className={`text-xs font-semibold uppercase ${statusColor}`}>{status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== CRITICAL FINDINGS ===== */}
      {summary.critical_issues > 0 && (
        <div className="bg-red-50 rounded-lg shadow-md border-2 border-red-300">
          <button
            onClick={() => toggleSection('critical')}
            className="w-full p-4 flex items-center justify-between hover:bg-red-100"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-600">
                Critical Issues ({summary.critical_issues})
              </h2>
            </div>
            {expandedSection === 'critical' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSection === 'critical' && (
            <div className="border-t border-red-200 p-4 space-y-3">
              {all_findings
                .filter(f => f.severity?.toUpperCase() === 'CRITICAL')
                .map((finding, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setExpandedFinding(expandedFinding === `critical-${idx}` ? null : `critical-${idx}`)}
                    className="bg-white rounded p-4 border-l-4 border-red-600 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{finding.description}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                            {finding.scanner}
                          </span>
                          <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                            {finding.type}
                          </span>
                        </div>
                      </div>
                      <Zap className="w-5 h-5 text-red-600 flex-shrink-0 ml-4" />
                    </div>
                    
                    {expandedFinding === `critical-${idx}` && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                        {finding.details && (
                          <div>
                            <div className="font-semibold text-slate-700">Details:</div>
                            <div className="text-sm text-slate-600 mt-1">
                              {renderValue(finding.details)}
                            </div>
                          </div>
                        )}
                        {finding.recommendation && (
                          <div>
                            <div className="font-semibold text-slate-700">Recommendation:</div>
                            <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-1">
                              {renderValue(finding.recommendation)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ===== HIGH PRIORITY FINDINGS ===== */}
      {summary.high_issues > 0 && (
        <div className="bg-orange-50 rounded-lg shadow-md border-2 border-orange-300">
          <button
            onClick={() => toggleSection('high')}
            className="w-full p-4 flex items-center justify-between hover:bg-orange-100"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-orange-600">
                High Priority Issues ({summary.high_issues})
              </h2>
            </div>
            {expandedSection === 'high' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSection === 'high' && (
            <div className="border-t border-orange-200 p-4 space-y-3">
              {all_findings
                .filter(f => f.severity?.toUpperCase() === 'HIGH')
                .slice(0, 5)
                .map((finding, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded p-4 border-l-4 border-orange-600"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{finding.description}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          {renderValue(finding.details)}
                        </div>
                        {finding.recommendation && (
                          <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-2">
                            <strong>Fix:</strong> {renderValue(finding.recommendation)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ===== PROFESSIONAL RECOMMENDATIONS ===== */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow-md border-2 border-blue-300">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full p-4 flex items-center justify-between hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-600">
                Professional Remediation Roadmap ({recommendations.length})
              </h2>
            </div>
            {expandedSection === 'recommendations' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSection === 'recommendations' && (
            <div className="border-t border-blue-200 p-4 space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{rec.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          rec.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.priority}
                        </span>
                        {rec.category && (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                            {rec.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {rec.estimated_effort && (
                      <div className="text-right text-xs text-slate-600">
                        <div className="font-semibold">Effort</div>
                        <div>{rec.estimated_effort}</div>
                      </div>
                    )}
                  </div>
                  
<p className="text-slate-700 mb-3">{renderValue(rec.description)}</p>
                  
                  {rec.remediation_steps && (
                    <div className="bg-slate-50 rounded p-3 mb-3">
                      <div className="font-semibold text-slate-900 mb-2">Remediation Steps:</div>
                      <div className="space-y-1 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                        {Array.isArray(rec.remediation_steps) 
                          ? rec.remediation_steps.map((step, i) => (
                              <div key={i}>{step}</div>
                            ))
                          : typeof rec.remediation_steps === 'string'
                          ? rec.remediation_steps.split('\n').map((step, i) => (
                              <div key={i}>{step}</div>
                            ))
                          : <div className="text-xs bg-slate-100 p-2 rounded">{JSON.stringify(rec.remediation_steps, null, 2)}</div>
                        }
                      </div>
                    </div>
                  )}
                  
                  {rec.actions && (
                    <div className="bg-slate-50 rounded p-3 mb-3">
                      <div className="font-semibold text-slate-900 mb-2">Action Items:</div>
                      <div className="space-y-1 text-sm text-slate-700">
                        {Array.isArray(rec.actions) && typeof rec.actions[0] === 'string'
                          ? rec.actions.map((action, i) => (
                              <div key={i} className="flex gap-2">
                                <span>•</span>
                                <span>{action}</span>
                              </div>
                            ))
                          : typeof rec.actions === 'string'
                          ? rec.actions.split('\n').map((line, i) => (
                              <div key={i} className="flex gap-2">
                                <span>•</span>
                                <span>{line}</span>
                              </div>
                            ))
                          : <div className="text-xs bg-slate-100 p-2 rounded">{JSON.stringify(rec.actions, null, 2)}</div>
                        }
                      </div>
                    </div>
                  )}
                  
                  {rec.verification && (
                    <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>Verify:</strong> {renderValue(rec.verification)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== MEDIUM FINDINGS ===== */}
      {summary.medium_issues > 0 && (
        <div className="bg-yellow-50 rounded-lg shadow-md border border-yellow-300">
          <button
            onClick={() => toggleSection('medium')}
            className="w-full p-4 flex items-center justify-between hover:bg-yellow-100"
          >
            <h2 className="text-lg font-bold text-yellow-700">
              Medium Priority Issues ({summary.medium_issues})
            </h2>
            {expandedSection === 'medium' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSection === 'medium' && (
            <div className="border-t border-yellow-200 p-4 space-y-2">
              {all_findings
                .filter(f => f.severity?.toUpperCase() === 'MEDIUM')
                .slice(0, 3)
                .map((finding, idx) => (
                  <div key={idx} className="bg-white rounded p-3 border-l-4 border-yellow-600">
                    <div className="font-semibold text-slate-900 text-sm">{finding.description}</div>
                    <div className="text-xs text-slate-600 mt-1">{renderValue(finding.details)}</div>
                  </div>
                ))}
              {summary.medium_issues > 3 && (
                <div className="text-xs text-yellow-700 italic pt-2 border-t border-yellow-200 mt-2 pt-2">
                  +{summary.medium_issues - 3} more medium issues...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 text-center text-sm text-slate-600">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Audit Report Generated: {new Date(timestamp).toLocaleString()}</span>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          This report provides comprehensive security findings and professional remediation guidance
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAuditReport;
