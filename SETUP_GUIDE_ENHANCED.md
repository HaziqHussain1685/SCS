# 🚀 IoT Camera Vulnerability Scanner - Enhanced Edition

## Quick Start Guide

### 📋 Prerequisites

- **Windows or Linux OS**
- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **Nmap** installed and accessible from command line
- **pip** for Python dependencies
- **npm** for frontend dependencies

#### Install Nmap

**Windows:**
```powershell
# Using Chocolatey
choco install nmap

# Or download from: https://nmap.org/download.html
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install nmap
```

**Verify Installation:**
```bash
nmap -V
```

---

## 🔧 Backend Setup

### Step 1: Install Dependencies

Navigate to the scanner directory and install Python dependencies:

```bash
cd scanner
pip install -r requirements.txt
```

The required packages are:
- `Flask>=3.0.0` - REST API framework
- `Flask-CORS>=4.0.0` - Cross-origin requests
- `requests>=2.31.0` - HTTP client
- `python-dotenv>=1.0.0` - Environment variables
- `zeroconf>=0.115.0` - mDNS/Bonjour

### Step 2: Verify Nmap is in PATH

```bash
# Windows
where nmap
# or
nmap -V

# Linux/Mac
which nmap
# or
nmap -V
```

If nmap command not found, add it to your system PATH.

### Step 3: Start the Backend API

```bash
python api.py
```

Expected output:
```
======================================================================
🚀 STARTING SMART CAMERA SCANNER API v2.0
======================================================================
✓ Backend: nmap-based network scanning
✓ Port: 5000
✓ CORS: Enabled for localhost:3000

📍 Available endpoints:
  GET  /api/health         - Health check
  GET  /api/health/status  - API status
  POST /api/ping           - Check device reachability (single IP)
  POST /api/ping/batch     - Check multiple IPs reachability
  POST /api/scan           - Run scan
  POST /api/scan/nmap      - Run nmap scan
  GET  /api/scan/history   - Get all scans
  GET  /api/scan/latest    - Get latest scan
  DELETE /api/scan/clear   - Clear history

📝 Example requests:
  # Ping single device
  curl -X POST http://localhost:5000/api/ping \
    -H "Content-Type: application/json" \
    -d '{"ip": "192.168.18.234"}'

  # Run scan
  curl -X POST http://localhost:5000/api/scan \
    -H "Content-Type: application/json" \
    -d '{"target": "192.168.18.234"}'
======================================================================
```

**The API is now running at:** `http://localhost:5000`

---

## 🎨 Frontend Setup

### Step 1: Install Dependencies

Navigate to the frontend directory and install Node dependencies:

```bash
cd frontend
npm install
```

### Step 2: Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
**`http://localhost:5173`** (Vite default port)

Expected output:
```
VITE v5.3.4 running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🌐 API Endpoints Reference

### Health Check

**Endpoint:** `GET /api/health`

**Example:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "online",
  "message": "✓ Smart Camera Scanner API is running",
  "timestamp": "2026-03-31T10:30:00"
}
```

---

### 🔍 Ping Device (Check Reachability)

**NEW FEATURE**: Real-time device status checking before scanning

**Endpoint:** `POST /api/ping`

**Request:**
```json
{
  "ip": "192.168.18.234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "ip": "192.168.18.234",
    "reachable": true,
    "latency_ms": 25.5,
    "timestamp": "2026-03-31T10:30:00"
  }
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/ping \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.18.234"}'
```

**Example (Python):**
```python
import requests

response = requests.post(
    'http://localhost:5000/api/ping',
    json={'ip': '192.168.18.234'}
)
print(response.json())
```

---

### 🎯 Comprehensive Scan

**Endpoint:** `POST /api/scan/comprehensive` (or `/api/scan`)

**Request:**
```json
{
  "target": "192.168.18.234",
  "full_scan": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "target_ip": "192.168.18.234",
    "timestamp": "2026-03-31T10:30:00",
    "overall_risk_score": 7.5,
    "overall_risk_level": "HIGH",
    "device_profile": {
      "is_camera": true,
      "camera_type": "IP Camera with RTSP + ONVIF Management",
      "confidence": 85,
      "status": "online",
      "services_detected": 4,
      "open_ports": [
        {
          "port": 554,
          "protocol": "tcp",
          "service": "rtsp",
          "version": ""
        },
        {
          "port": 8089,
          "protocol": "tcp",
          "service": "http",
          "version": ""
        }
      ]
    },
    "summary": {
      "vulnerabilities_found": 3,
      "critical_issues": 0,
      "high_issues": 2,
      "medium_issues": 1,
      "low_issues": 0
    },
    "all_findings": [
      {
        "id": "VULN_001",
        "type": "RTSP_EXPOSED",
        "severity": "MEDIUM",
        "title": "RTSP Video Stream Exposed",
        "description": "Real-Time Streaming Protocol (RTSP) is accessible from network on port 554",
        "affected_port": 554,
        "remediation": [
          "1. Access camera admin panel (ONVIF or web interface)",
          "2. Find 'RTSP Settings' or 'Streaming' configuration"
        ]
      }
    ],
    "scan_duration_seconds": 45.2,
    "scan_mode": "QUICK"
  }
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"target": "192.168.18.234"}'
```

**Example (JavaScript/Fetch):**
```javascript
const response = await fetch('http://localhost:5000/api/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ target: '192.168.18.234' })
});

const data = await response.json();
console.log(data);
```

---

### 📜 Scan History

**Endpoint:** `GET /api/scan/history`

**Example:**
```bash
curl http://localhost:5000/api/scan/history
```

**Response:**
```json
{
  "success": true,
  "scans": [
    { /* scan result 1 */ },
    { /* scan result 2 */ }
  ],
  "count": 2
}
```

---

### 🔄 Latest Scan

**Endpoint:** `GET /api/scan/latest`

**Example:**
```bash
curl http://localhost:5000/api/scan/latest
```

---

## 🎯 Frontend Features

### Modern Scanner Interface

The new **ModernScanInterface** provides:

#### 1. **Live Device Status** 🟢🔴
- Before scanning, the system **pings** the target IP
- Shows green indicator (🟢) if device is online
- Shows red indicator (🔴) if device is offline
- Real-time status updates

#### 2. **Smooth Animations**
- Animated scan progress indicator
- Loading spinner during scan
- Fade-in transitions for results
- Hover effects on cards

#### 3. **Beautiful Results Display**
- **Glowing Risk Score** indicator with gradient background
- Risk level with color coding:
  - 🔴 **CRITICAL** (Red)
  - 🟠 **HIGH** (Orange)
  - 🟡 **MEDIUM** (Yellow)
  - 🔵 **LOW** (Blue)
  - 🟢 **MINIMAL** (Green)

#### 4. **Device Profile Card**
- Device type detection
- Camera type classification
- Detection confidence percentage
- Open ports count

#### 5. **Open Ports Display**
- List of all open ports with services
- Click to copy port info
- Service names and versions

#### 6. **Vulnerability Details**
- Comprehensive vulnerability list
- Severity badges with color coding
- Description, port, and remediation steps
- Shows top 10 vulnerabilities with "more" indicator

#### 7. **Scan Metadata**
- Target IP address
- Scan duration
- Scan mode (QUICK / FULL)
- Timestamp information

---

## 🔐 Security Features Implemented

### Backend Enhancements

1. **Ping Endpoint** - Real-time device reachability checking
   - Single device ping: `/api/ping`
   - Batch ping: `/api/ping/batch`
   - Includes latency measurement
   - Cross-platform (Windows/Linux)

2. **Enhanced Nmap Scripts**
   - RTSP enumeration and endpoint discovery
   - Web panel discovery (HTTP/HTTPS)
   - ONVIF device detection
   - Default credential checks
   - Weak security configuration detection
   - SSL/TLS weakness scanning

3. **Advanced Vulnerability Analysis**
   - Structured vulnerability findings
   - RTSP exposure detection
   - ONVIF detection
   - Web interface vulnerabilities
   - Default credentials warnings
   - Weak encryption detection

4. **Improved Risk Scoring** (0-10 Scale)
   - CRITICAL ≥ 9
   - HIGH ≥ 7
   - MEDIUM ≥ 4
   - LOW ≥ 2
   - MINIMAL < 2

### Frontend Enhancements

1. **Modern Dark Theme**
   - Gradient backgrounds
   - Dark slate color scheme
   - Transparent cards with backdrop blur
   - Glowing elements

2. **Real-time Status Updates**
   - Device status before scan
   - Live progress indication
   - Instant result display

3. **Interactive Components**
   - Copyable port information
   - Hoverable vulnerability cards
   - Responsive grid layout
   - Mobile-friendly design

---

## 📊 Example Workflow

### Step 1: User Enters IP Address

```
┌─────────────────────────────┐
│  Target IP Address          │
│  [192.168.18.234        ]   │
│                             │
│  [Ping]  [Scan Now]        │
└─────────────────────────────┘
```

### Step 2: System Pings Device

```
Backend: PING 192.168.18.234
Response: 
  - status: "online"
  - latency: 25.5ms

Frontend: Shows 🟢 Online
```

### Step 3: User Clicks "Scan Now"

```
Backend:
  1. Quick Port Scan (8 ports)      - 30s
  2. RTSP Enumeration              - 20s
  3. Web Panel Discovery           - 15s
  4. ONVIF Detection               - 15s
  5. Credential Checks             - 30s
  6. Weak Security Scan            - 30s
  7. Vulnerability Analysis        - 5s
  8. Risk Scoring                  - 5s
  
Total: ~150 seconds
```

### Step 4: Results Displayed in Frontend

```
┌────────────────────────────────────────────┐
│  OVERALL RISK LEVEL: HIGH (7.5/10)        │
│  
│  Status: ✓ Camera Detected (85% confidence)
│  
│  ⚠️  3 Vulnerabilities Found:
│    • RTSP Video Stream Exposed       [MEDIUM]
│    • Unencrypted Web Interface       [HIGH]
│    • Default Credentials Possible    [HIGH]
│
│  📖 Recommendations:
│    1. Enable RTSP authentication
│    2. Use HTTPS for web interface
│    3. Change default credentials
└────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Ping Endpoint

```bash
# Test local ping
curl -X POST http://localhost:5000/api/ping \
  -H "Content-Type: application/json" \
  -d '{"ip": "127.0.0.1"}'

# Expected: online with low latency
```

### Test Batch Ping

```bash
curl -X POST http://localhost:5000/api/ping/batch \
  -H "Content-Type: application/json" \
  -d '{"ips": ["192.168.18.234", "192.168.18.235", "192.168.18.236"]}'
```

### Test Full Scan

```bash
curl -X POST http://localhost:5000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "target": "192.168.18.234",
    "full_scan": false
  }'
```

---

## ⚠️ Troubleshooting

### Issue: "Nmap not found"
```bash
# Windows: Add nmap to PATH or install via Chocolatey
choco install nmap

# Linux: Install via package manager
sudo apt-get install nmap
```

### Issue: Port 5000 already in use
```bash
# Windows: Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or modify api.py to use different port:
# Change: app.run(host='127.0.0.1', port=5000, debug=True)
# To:     app.run(host='127.0.0.1', port=5001, debug=True)
```

### Issue: CORS errors in frontend
- Ensure backend is running on `localhost:5000`
- Check that frontend points to correct API URL in `services/api.js`
- Backend has CORS enabled with `Flask-CORS`

### Issue: Scans timing out
- Check network connectivity to target
- Ensure nmap has permission to run
- Try with `--quick` flag instead of full scan

---

## 📁 Project Structure

```
SCS/
├── scanner/                    # Backend
│   ├── api.py                 # Flask REST API with ping endpoints
│   ├── scanner_main.py        # Main scanning orchestrator
│   ├── nmap_wrapper.py        # Nmap execution & parsing
│   ├── camera_detector.py     # Device identification
│   ├── vulnerability_analyzer.py  # Vulnerability detection
│   ├── risk_scorer.py         # Risk calculation
│   ├── requirements.txt       # Python dependencies
│   └── scan_history.json      # Historical scan data
│
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx            # Main app with UI switcher
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Tailwind CSS
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── ModernScanInterface.jsx  # NEW: Modern scanner UI
│   │   │       └── ...
│   │   ├── services/
│   │   │   └── api.js         # API client with ping methods
│   │   └── pages/
│   │       └── Dashboard.jsx
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── vite.config.js         # Vite configuration
│
└── README.md                  # This file
```

---

## 🚀 Performance Metrics

- **Ping Response:** ~100ms
- **Quick Port Scan:** ~30 seconds
- **Full Scan (all ports):** ~2-3 minutes  
- **Full Analysis:** ~2-5 minutes
- **Frontend Load:** <500ms

---

## 📝 Example Complete Workflow (Python)

```python
import requests
import time

API_BASE = 'http://localhost:5000/api'

def scan_camera(ip_address):
    print(f"\n🔍 Scanning {ip_address}...")
    
    # Step 1: Check reachability
    print("1️⃣  Checking device reachability...")
    ping_response = requests.post(
        f'{API_BASE}/ping',
        json={'ip': ip_address}
    )
    
    if ping_response.json()['data']['status'] == 'offline':
        print("❌ Device is offline!")
        return
    
    print(f"✅ Device is online (latency: {ping_response.json()['data']['latency_ms']}ms)")
    
    # Step 2: Run full scan
    print("2️⃣  Running comprehensive scan...")
    print("   This may take 2-5 minutes...")
    
    scan_response = requests.post(
        f'{API_BASE}/scan',
        json={'target': ip_address}
    )
    
    results = scan_response.json()['data']
    
    # Step 3: Display results
    print("\n" + "="*50)
    print(f"✅ SCAN COMPLETE")
    print("="*50)
    print(f"\n📹 Device: {results['device_profile']['camera_type']}")
    print(f"🎯 Risk Level: {results['overall_risk_level']} ({results['overall_risk_score']}/10)")
    print(f"⚠️  Vulnerabilities: {results['summary']['vulnerabilities_found']}")
    print(f"📊 Breakdown:")
    print(f"   🔴 Critical: {results['summary']['critical_issues']}")
    print(f"   🟠 High:     {results['summary']['high_issues']}")
    print(f"   🟡 Medium:   {results['summary']['medium_issues']}")
    print(f"   🔵 Low:      {results['summary']['low_issues']}")
    print(f"⏱️  Scan Time: {results['scan_duration_seconds']:.1f}s")
    
    return results

# Run it
if __name__ == '__main__':
    scan_camera('192.168.18.234')
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify nmap installation
3. Check backend is running on port 5000
4. Verify frontend can access the API
5. Review scan history for past results

---

**Happy scanning! 🛡️**
