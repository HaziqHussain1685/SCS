# PDF Export Test Script

## Quick Test to Verify PDF Export is Working

Open a new PowerShell terminal and run these commands:

### 1. Test with Empty Data (Should get "No devices" error)
```powershell
curl -X POST http://localhost:5000/api/export/pdf `
  -H "Content-Type: application/json" `
  -d '{"devices":[],"options":{}}' `
  -o test_empty.pdf
```

### 2. Test with Sample Device Data
```powershell
$sampleData = @'
{
  "devices": [{
    "device_name": "Test Camera",
    "ip_address": "192.168.1.100",
    "health_score": 75,
    "status": "online",
    "risk_level": "MEDIUM",
    "scan_time": "2025-12-11T10:00:00",
    "device_info": {
      "model": "Test Model v2.0",
      "manufacturer": "TestCorp",
      "serial": "TEST123456"
    },
    "firmware_info": {
      "version": "1.5.1",
      "status": "outdated",
      "release_date": "2024-01-15"
    },
    "identified_risks": [
      {
        "issue": "Outdated Firmware",
        "severity": "MEDIUM",
        "impact": "May contain unpatched vulnerabilities"
      }
    ],
    "recommendations": [
      {
        "action": "Update Firmware",
        "priority": "HIGH",
        "steps": ["Check manufacturer website", "Download latest firmware", "Apply update"]
      }
    ]
  }],
  "options": {
    "include_summary": true,
    "include_stats": true,
    "include_device_details": true,
    "include_vulnerabilities": true,
    "include_recommendations": true
  }
}
'@

curl -X POST http://localhost:5000/api/export/pdf `
  -H "Content-Type: application/json" `
  -d $sampleData `
  -o test_report.pdf
```

### 3. Check if PDF was created
```powershell
Get-Item test_report.pdf
```

### 4. Open the PDF
```powershell
Invoke-Item test_report.pdf
```

## Expected Results

- **Empty data test:** Should return JSON error: `{"success": false, "message": "No devices to export"}`
- **Sample data test:** Should download a PDF file named `test_report.pdf`
- **PDF content:** Should contain device information, tables, and recommendations

## If It Works

✅ PDF export is functioning correctly!
✅ The "reportlab" library is properly installed
✅ The backend API is working

## If It Fails

### Error: "PDF generation not available"
```powershell
# Reinstall reportlab
pip install --upgrade reportlab
```

### Error: "No devices to export"
This is normal if you haven't run a scan yet. Use the sample data test above instead.

### Error: Connection refused
```powershell
# Make sure backend is running
curl http://localhost:5000/api/health
```

## Using the Dashboard

Once the curl test works, you can use the dashboard:

1. Open dashboard: http://localhost:3000
2. Make sure you have devices (run a scan or add manual cameras)
3. Click the **Export** (📄) button
4. Select devices
5. Click **Generate PDF**
6. PDF will download automatically

## Troubleshooting

### Check API Health
```powershell
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "features": {
    "alerts": true,
    "pdf_export": true
  }
}
```

If `"pdf_export": false`, then reportlab didn't import correctly.

### Check Backend Logs
Look at the terminal running `python scanner_api.py` for any error messages.

### Verify reportlab Installation
```powershell
pip show reportlab
python -c "import reportlab; print('ReportLab version:', reportlab.Version)"
```

Should show version 4.x.x
