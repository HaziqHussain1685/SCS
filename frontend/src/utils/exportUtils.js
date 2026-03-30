/**
 * Export utilities for scan results
 * Generates PDFs and other formats from comprehensive scan data
 */

export async function exportScanResultsAsJSON(results) {
  if (!results) {
    console.error('No results to export');
    return;
  }

  const jsonString = JSON.stringify(results, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, `scan_${results.target_ip}_${new Date().toISOString().split('T')[0]}.json`);
}

export async function exportScanResultsAsCSV(results) {
  if (!results || !results.combined_vulnerabilities) {
    console.error('No vulnerabilities to export');
    return;
  }

  const vulnerabilities = results.combined_vulnerabilities;
  
  // CSV headers
  const headers = ['Source', 'Name', 'Description', 'Risk Level', 'CVE', 'Target IP', 'Scan Time'];
  
  // Convert vulnerabilities to CSV rows
  const rows = vulnerabilities.map(vuln => [
    vuln.source || 'UNKNOWN',
    `"${(vuln.name || '').replace(/"/g, '""')}"`,
    `"${(vuln.description || '').replace(/"/g, '""')}"`,
    vuln.risk || 'UNKNOWN',
    vuln.cve || 'N/A',
    results.target_ip,
    results.scan_time
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(blob, `scan_vulnerabilities_${results.target_ip}_${new Date().toISOString().split('T')[0]}.csv`);
}

export async function exportScanResultsAsHTML(results) {
  if (!results) {
    console.error('No results to export');
    return;
  }

  const html = generateScanHTML(results);
  const blob = new Blob([html], { type: 'text/html' });
  downloadFile(blob, `scan_report_${results.target_ip}_${new Date().toISOString().split('T')[0]}.html`);
}

function generateScanHTML(results) {
  const { target_ip, scan_time, global_health_score, global_risk_level, nmap, onvif, combined_vulnerabilities } = results;

  const vulnerabilitiesHTML = combined_vulnerabilities.map(vuln => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${vuln.source}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${vuln.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${vuln.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${getRiskColor(vuln.risk)};">${vuln.risk}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${vuln.cve || 'N/A'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Security Scan Report - ${target_ip}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 32px; }
        .header p { margin: 5px 0; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .stat-card .value { font-size: 28px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .stat-card .label { font-size: 12px; color: #666; text-transform: uppercase; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        table th { background: #667eea; color: white; padding: 12px; text-align: left; }
        .critical { color: #dc2626; }
        .high { color: #ea580c; }
        .medium { color: #eab308; }
        .low { color: #16a34a; }
        .port-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .port-badge { background: #e0e7ff; color: #667eea; padding: 4px 12px; border-radius: 20px; font-family: monospace; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📸 Security Scan Report</h1>
        <p><strong>Target:</strong> ${target_ip}</p>
        <p><strong>Scan Date:</strong> ${new Date(scan_time).toLocaleString()}</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="label">Health Score</div>
          <div class="value" style="color: ${getHealthColor(global_health_score)};">${global_health_score}</div>
          <div class="label">/100</div>
        </div>
        <div class="stat-card">
          <div class="label">Risk Level</div>
          <div class="value" style="color: ${getRiskColor(global_risk_level)};">${global_risk_level}</div>
        </div>
        <div class="stat-card">
          <div class="label">Total Issues</div>
          <div class="value">${combined_vulnerabilities.length}</div>
        </div>
        <div class="stat-card">
          <div class="label">Open Ports</div>
          <div class="value">${(nmap?.open_ports?.length || 0)}</div>
        </div>
      </div>

      ${nmap ? `
      <div class="section">
        <h2>🌐 Network Scan Results (nmap)</h2>
        <p><strong>Status:</strong> ${nmap.status || 'OFFLINE'}</p>
        <p><strong>Open Ports:</strong> ${nmap.open_ports?.length || 0}</p>
        ${nmap.open_ports && nmap.open_ports.length > 0 ? `
          <div class="port-list">
            ${nmap.open_ports.slice(0, 20).map(port => `<div class="port-badge">${port}</div>`).join('')}
            ${nmap.open_ports.length > 20 ? `<div class="port-badge">+${nmap.open_ports.length - 20} more</div>` : ''}
          </div>
        ` : ''}
      </div>
      ` : ''}

      ${onvif ? `
      <div class="section">
        <h2>🔒 ONVIF Security Scan</h2>
        <p><strong>ONVIF Service Found:</strong> ${onvif.onvif_service_found ? '⚠️ YES' : '✓ NO'}</p>
        <p><strong>Health Score:</strong> ${onvif.health_score}/100</p>
        ${onvif.device_info ? `
          <p><strong>Device Model:</strong> ${onvif.device_info.model}</p>
        ` : ''}
      </div>
      ` : ''}

      <div class="section">
        <h2>⚠️ Combined Vulnerabilities</h2>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Name</th>
              <th>Description</th>
              <th>Risk</th>
              <th>CVE</th>
            </tr>
          </thead>
          <tbody>
            ${vulnerabilitiesHTML}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #999; font-size: 12px;">
        <p>Generated by Smart Camera Security Scanner</p>
        <p>${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getRiskColor(risk) {
  switch (risk?.toUpperCase()) {
    case 'CRITICAL':
      return '#dc2626';
    case 'HIGH':
      return '#ea580c';
    case 'MEDIUM':
      return '#eab308';
    case 'LOW':
      return '#16a34a';
    default:
      return '#666';
  }
}

function getHealthColor(score) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#ea580c';
  return '#dc2626';
}
