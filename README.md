# SmartCam Shield - IoT Camera Vulnerability Scanner

> Professional network-based security scanner for IP cameras using NMAP and advanced vulnerability analysis.
> **Final Year Project (FYP) - Production Ready**

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (Backend)
- **Node.js 18+** (Frontend)
- **nmap 7.98+** (Network scanning engine)
- **Git** (Version control)

### Installation

```bash
# Clone repository
git clone https://github.com/HaziqHussain1685/SCS.git
cd SCS

# Backend setup
cd scanner
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### Start the Application

**Terminal 1 - Backend API (Port 5000):**
```bash
cd scanner
python api.py
```

**Terminal 2 - Frontend Dashboard (Port 3000):**
```bash
cd frontend
npm run dev
```

**Access Dashboard:**
- Browser: `http://localhost:3000`
- API: `http://localhost:5000`

## 📊 Features

- ✅ **NMAP-Based Network Scanning** - Real device detection
- ✅ **Intelligent Camera Detection** - Identifies IP cameras by ports/services
- ✅ **Vulnerability Analysis** - RTSP, ONVIF, web panel exposure detection
- ✅ **Risk Scoring Engine** - 0-10 scale with severity levels
- ✅ **Professional Dashboard** - React UI with real-time updates
- ✅ **Scan History** - Persistent storage of all scans
- ✅ **Detailed Remediation** - Step-by-step security fixes
- ✅ **Non-Technical Language** - User-friendly security reports

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│  React Dashboard (Port 3000)                           │
│  - Real-time scan results                              │
│  - Risk visualization                                  │
│  - Vulnerability details                               │
│  - Remediation guidance                                │
└──────────────────┬─────────────────────────────────────┘
                   │ REST API
                   ▼
┌────────────────────────────────────────────────────────┐
│  Flask Backend (Port 5000)                             │
│  ├─ api.py (REST endpoints)                            │
│  ├─ scanner_main.py (IoTCameraScanner orchestrator)   │
│  ├─ nmap_wrapper.py (NMAP integration)                │
│  ├─ camera_detector.py (Device identification)        │
│  ├─ vulnerability_analyzer.py (Risk detection)        │
│  └─ risk_scorer.py (Risk calculation)                 │
└──────────────────┬─────────────────────────────────────┘
                   │ Network Scanning
                   ▼
┌────────────────────────────────────────────────────────┐
│  NMAP Scanner                                          │
│  - Port scanning (TCP/UDP)                             │
│  - Service version detection                           │
│  - RTSP enumeration                                    │
│  - Vulnerability pattern matching                      │
└────────────────────────────────────────────────────────┘
                   │
                   ▼
            Real Network Devices
            (IP Cameras, IoT devices)
```

## 📁 Project Structure

```
SCS/
├── scanner/                          # Python Backend - NMAP-Only Scanner
│   ├── api.py                        # Flask REST API (main entry point)
│   ├── scanner_main.py               # IoTCameraScanner orchestrator
│   ├── nmap_wrapper.py               # NMAP integration & output parsing
│   ├── camera_detector.py            # IP camera identification
│   ├── vulnerability_analyzer.py     # Security vulnerability detection
│   ├── risk_scorer.py                # Risk calculation (0-10 scale)
│   ├── requirements.txt              # Python dependencies
│   ├── scan_history.json             # Persistent scan storage
│   └── reports/                      # Scan result archives
│
├── frontend/                         # React Dashboard (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/            # Main dashboard views
│   │   │   │   ├── DeviceTable.jsx
│   │   │   │   ├── HealthScoreGrid.jsx
│   │   │   │   ├── ComprehensiveScanResults.jsx
│   │   │   │   └── ... (other dashboard components)
│   │   │   ├── layout/               # Navigation & layout
│   │   │   └── ui/                   # Reusable UI elements
│   │   ├── pages/
│   │   │   └── Dashboard.jsx         # Main page
│   │   ├── services/
│   │   │   └── api.js                # API client with response transformation
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx      # Theme management
│   │   └── utils/                    # Helper functions
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── results/                          # Archived scan results
├── README.md                         # This file
└── .gitignore
```

## 🎯 API Endpoints

### Scanner API (Flask - Port 5000)

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/scan` | POST | Run comprehensive NMAP scan | `{ "target_ip": "192.168.x.x" }` |
| `/api/scan/comprehensive` | POST | Run full scan with analysis | `{ "target_ip": "192.168.x.x" }` |
| `/api/scan/history` | GET | Get all historical scans | - |
| `/api/scan/latest` | GET | Get most recent scan result | - |
| `/api/scan/clear` | DELETE | Clear scan history | - |
| `/api/health` | GET | API health/status check | - |

### Response Format (Comprehensive Scan)

```json
{
  "target_ip": "192.168.18.234",
  "timestamp": "2025-03-31T14:23:45.123456",
  "scan_type": "comprehensive",
  "device_profile": {
    "is_camera": true,
    "confidence": 0.95,
    "status": "Device identified as IP Camera",
    "open_ports": [554, 8089, 8899],
    "services_detected": ["RTSP (554)", "HTTP (8089)", "ONVIF (8899)"]
  },
  "summary": {
    "vulnerabilities_found": 5,
    "critical_issues": 1,
    "high_issues": 2,
    "medium_issues": 2,
    "low_issues": 0
  },
  "overall_risk_score": 9.0,
  "overall_risk_level": "CRITICAL",
  "all_findings": [
    {
      "id": "weakness_001",
      "type": "Weak Default Credentials",
      "severity": "CRITICAL",
      "description": "Device uses default or weak authentication",
      "ports_affected": [8089, 8899],
      "remediation_steps": [...]
    }
  ],
  "recommendations": [
    "Change all default credentials immediately",
    "Enable HTTPS/TLS encryption",
    "Restrict RTSP access to internal network",
    "Disable ONVIF if not required"
  ],
  "scanners": {
    "nmap": {
      "command": "nmap -sV -sC 192.168.18.234",
      "open_ports": {...},
      "services": {...}
    }
  },
  "scan_duration_seconds": 82.6
}
```

## 🔧 Development

### Backend Setup (Flask on Port 5000)
```powershell
cd scanner
pip install -r requirements.txt
python api.py
```

### Frontend Setup (React + Vite on Port 3000)
```powershell
cd frontend
npm install
npm run dev     # Development server
npm run build   # Production build
```

### Testing
```powershell
# Scan a real device
curl -X POST http://localhost:5000/api/scan/comprehensive `
  -ContentType "application/json" `
  -Body '{"target_ip": "192.168.18.234"}'

# Get scan history
curl http://localhost:5000/api/scan/history

# Health check
curl http://localhost:5000/api/health
```

## 📚 Documentation

Key reference files:
- `scanner/requirements.txt` - Python dependencies (Flask, requests, nmap integration)
- `frontend/README.md` - Frontend-specific setup guide
- `scanner/nmap_wrapper.py` - NMAP integration documentation
- `README.md` - This file

## 🎓 Academic Context

**Project:** SmartCam Shield - IoT Camera Security Platform  
**Institution:** FAST National University  
**Course:** Final Year Project (FYP) - Semester 7  
**Year:** 2024-2025

## 🛡️ Security Analysis Capabilities

Our NMAP-based scanner detects:

- **Exposed RTSP Streams** - RTSP port (554) exposure without authentication
- **ONVIF Interface Exposure** - ONVIF port (8899) accessible without restriction
- **Weak Web Panel Security** - HTTP port (8089) without HTTPS/TLS
- **Default Credentials** - Identifies likely default auth usage
- **Unnecessary Services** - Detects Telnet, FTP, or other insecure protocols
- **Service Version Detection** - Identifies vulnerable software versions
- **Risk Quantification** - 0-10 scale with severity mapping (CRITICAL/HIGH/MEDIUM/LOW)

## 🎨 Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Tailwind CSS 3.4.4** - Styling
- **Framer Motion 11.3.0** - Animations
- **Recharts 2.12.7** - Data visualization
- **Vite 5.3.4** - Build tool & dev server

### Backend
- **Python 3.8+** - Runtime
- **Flask 3.0.0** - REST API framework
- **Flask-CORS** - Cross-origin support
- **NMAP 7.98+** - Network scanning engine

### Core Scanning Stack
- **NMAP** - Port scanning, service detection, OS fingerprinting
- **XML Parsing** - NMAP output processing
- **Pattern Matching** - Vulnerability signature detection

### Data Storage
- **JSON (scan_history.json)** - Persistent scan archive

## 🐛 Troubleshooting

### NMAP Not Found
```powershell
# Install NMAP (Windows)
# Download from: https://nmap.org/download.html
# Or use Chocolatey:
choco install nmap

# Verify installation
nmap --version
```

### Backend Connection Error
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill existing process (replace PID with actual value)
taskkill /PID <PID> /F

# Restart backend
cd scanner
python api.py
```

### Frontend Dependencies Issue
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Scan Timeout
```powershell
# For large networks, increase NMAP timeout
# Edit nmap_wrapper.py and increase timeout parameter
# Default quick scan: 30 seconds
# Default full scan: 300 seconds
```

### Cannot Connect to Devices
```powershell
# Verify target device is reachable
ping 192.168.x.x

# Check if NMAP can reach device
nmap -p- 192.168.x.x

# Make sure you have network access to target
ipconfig /all
```

## 📈 Future Enhancements

- [ ] **WebSocket Real-Time Updates** - Live scan progress streaming
- [ ] **Mobile Responsive Design** - Mobile app interface improvements
- [ ] **Email Alerts** - Notification system for vulnerabilities
- [ ] **Export Reports** - PDF/CSV export functionality
- [ ] **Advanced Analytics** - Machine learning for threat patterns
- [ ] **Multi-Network Support** - Scan multiple network ranges
- [ ] **User Authentication** - Login system with scan history per user
- [ ] **Automated Remediation** - Scripts to apply fixes automatically
- [ ] **CVE Integration** - Real-time CVE database updates
- [ ] **Performance Optimization** - Parallel scanning for multiple devices

## ✨ Example Scan Results

### Real Device (192.168.18.234 - V380 Camera)

```
Target: 192.168.18.234
Scan Duration: 82.6 seconds
Device Identified: IP Camera (95% confidence)

Open Ports:
  - 554/tcp   RTSP (Real Time Streaming Protocol)
  - 8089/tcp  HTTP Web Panel
  - 8899/tcp  ONVIF Device Management

Vulnerabilities Found: 5

🔴 CRITICAL (1):
  - Default Credentials in use
  - Impact: Complete device compromise possible
  - Remediation: Change admin password immediately

🟠 HIGH (2):
  - ONVIF Interface Exposed
  - RTSP Stream Without Authentication
  - Impact: Unauthorized access to camera feeds
  - Remediation: Restrict access to internal network only

🟡 MEDIUM (2):
  - HTTP Web Panel Not Using HTTPS
  - Unknown Firmware Version
  - Impact: Credentials could be intercepted
  - Remediation: Enable HTTPS and update firmware

Overall Risk Score: 9/10 (CRITICAL)
Recommendations: 4 critical actions required
```

## 📞 Support & Issues

For questions or issues:
1. Review [Troubleshooting](#troubleshooting) section
2. Check NMAP documentation: https://nmap.org/book/man.html
3. Verify network connectivity to target devices
4. Ensure all requirements are installed

---

## 📝 Project Status

- **Status:** ✅ **Production Ready**
- **Version:** 1.0.0
- **Last Updated:** March 31, 2025
- **Scanner Type:** NMAP-Based Network Analysis
- **Real Device Testing:** ✅ Verified with V380 Camera (192.168.18.234)
- **Platform:** Windows 10/11 (cross-platform compatible)

### What's Included
- ✅ NMAP network scanner integration
- ✅ Real-time vulnerability detection
- ✅ Risk scoring (0-10 scale)
- ✅ Professional React dashboard
- ✅ Scan history persistence
- ✅ Step-by-step remediation guides
- ✅ Ready for FYP demonstration

---

## License

Educational project for FAST National University - Final Year Project (FYP)  
© 2024-2025 Haziq Hussain
