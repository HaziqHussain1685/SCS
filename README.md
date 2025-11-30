# SmartCam Shield - Camera Security Monitoring System

> A comprehensive security solution for protecting smart cameras in home environments

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (for camera simulators)
- Python 3.8+ (for scanner backend)
- Node.js 18+ (for React dashboard)

### Start the Application

**Terminal 1 - Backend API:**
```powershell
cd scanner
python scanner_api.py
```
Runs on: `http://127.0.0.1:5000`

**Terminal 2 - Frontend Dashboard:**
```powershell
cd frontend
npm install  # First time only
npm run dev
```
Runs on: `http://localhost:3000`

**Terminal 3 - Docker Cameras (Optional):**
```powershell
docker-compose up -d
```

## 📊 Features

- ✅ **Real-time Device Monitoring** - Tracks camera online/offline status
- ✅ **Vulnerability Detection** - Identifies weak passwords, outdated firmware, insecure services
- ✅ **Health Score System** - Quantifies security (0-100 scale)
- ✅ **Risk Categorization** - CRITICAL, HIGH, MEDIUM, LOW levels
- ✅ **Interactive Dashboard** - Modern React UI with animations
- ✅ **Scan History** - Tracks security trends over time
- ✅ **Remediation Guidance** - Step-by-step security fixes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Dashboard (Port 3000)                            │
│  - Health Score Visualization                           │
│  - Device Table                                         │
│  - Vulnerability Timeline                               │
│  - Scan History                                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP API
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Flask Scanner API (Port 5000)                          │
│  - Network Scanning                                     │
│  - Port Detection                                       │
│  - Credential Testing                                   │
│  - Health Score Calculation                             │
└────────────────────┬────────────────────────────────────┘
                     │ TCP/IP
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Docker Camera Simulators (Ports 8081-8084)            │
│  - 4 Cameras with Different Security Profiles          │
│  - Realistic HTTP/RTSP/Telnet/FTP Services            │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
SmartCam-Shield/
├── frontend/                    # React Dashboard
│   ├── src/
│   │   ├── components/         # UI Components
│   │   ├── pages/              # Dashboard, History views
│   │   ├── services/           # API integration
│   │   └── utils/              # Helper functions
│   └── package.json
├── scanner/                    # Python Backend
│   ├── scanner_api.py         # Flask REST API
│   ├── network_scanner.py     # Vulnerability scanner
│   ├── password_demo.py       # Remediation demo
│   └── requirements.txt
├── camera-simulator/          # Docker camera simulator
│   ├── app.py
│   └── Dockerfile
├── docs/                      # PlantUML diagrams
│   ├── architecture_diagram.puml
│   ├── data_model_diagram.puml
│   ├── sequence_diagram.puml
│   ├── component_diagram.puml
│   └── deployment_diagram.puml
├── readme/                    # Documentation
│   ├── DEMO_GUIDE.md
│   ├── QUICK_START.md
│   ├── DESIGN_SYSTEM.md
│   └── DASHBOARD_LAYOUT.md
├── docker-compose.yml
├── .gitignore
└── README.md                  # This file
```

## 🎯 API Endpoints

### Scanner API (Flask - Port 5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scan` | POST | Trigger new network scan |
| `/api/devices` | GET | Get current device status |
| `/api/history` | GET | Get scan history |
| `/api/device/<name>` | GET | Get specific device details |
| `/api/health` | GET | API health check |

## 🎨 Dashboard Components

1. **Stats Bar** - Total devices, critical issues, average health, last scan
2. **Health Score Grid** - Circular meters for each device
3. **Device Table** - Sortable, expandable table with port details
4. **Vulnerability Timeline** - Chronological security issues
5. **Vulnerability Chart** - Pie chart distribution
6. **Device Modal** - Detailed device information with 3 tabs
7. **Scan History** - Historical scans with trend analysis

## 🔧 Development

### Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev     # Development server
npm run build   # Production build
```

### Backend (Flask)
```powershell
cd scanner
pip install -r requirements.txt
python scanner_api.py
```

### Docker Cameras
```powershell
docker-compose up -d    # Start
docker-compose ps       # Check status
docker-compose down     # Stop
```

## 📚 Documentation

- **[QUICK_START.md](readme/QUICK_START.md)** - 5-minute quick start guide
- **[DEMO_GUIDE.md](readme/DEMO_GUIDE.md)** - Complete demonstration script
- **[DESIGN_SYSTEM.md](readme/DESIGN_SYSTEM.md)** - UI/UX design specifications
- **[DASHBOARD_LAYOUT.md](readme/DASHBOARD_LAYOUT.md)** - Component specifications
- **[docs/README.md](docs/README.md)** - PlantUML diagrams guide

## 🎓 Academic Context

**Project:** SmartCam Shield - IoT Camera Security Platform  
**Institution:** FAST National University  
**Course:** Final Year Project (FYP) - Semester 7  
**Year:** 2024-2025

## 🛡️ Security Features

- **Weak Password Detection** - Tests against common credential database
- **Firmware Vulnerability Analysis** - CVE database integration
- **Insecure Service Detection** - Identifies Telnet, FTP, unencrypted protocols
- **Internet Exposure Check** - Flags publicly accessible devices
- **Health Score Calculation** - Quantitative security metric (0-100)
- **Automated Remediation** - Step-by-step security improvement guides

## 🚀 Demo Flow

1. Start Docker cameras: `docker-compose up -d`
2. Start backend API: `python scanner/scanner_api.py`
3. Start frontend: `npm run dev` in `frontend/`
4. Open browser: `http://localhost:3000`
5. Click "Run Scan" to see vulnerabilities
6. Explore device details and remediation steps

## 🎨 Tech Stack

### Frontend
- React 18.3.1
- Tailwind CSS 3.4.4
- Framer Motion 11.3.0 (animations)
- Recharts 2.12.7 (charts)
- Axios 1.7.2 (API client)
- Vite 5.3.4 (build tool)

### Backend
- Python 3.11
- Flask 3.0.0 (REST API)
- Flask-CORS (cross-origin support)
- Requests (HTTP client)

### Infrastructure
- Docker 24.x
- Docker Compose
- Custom bridge network

## 🐛 Troubleshooting

### Frontend won't start
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Backend API errors
```powershell
cd scanner
pip install --upgrade -r requirements.txt
python scanner_api.py
```

### Docker issues
```powershell
docker-compose down
docker system prune -f
docker-compose up -d --build
```

## 📈 Future Enhancements

- [ ] Mobile responsive design improvements
- [ ] Real-time WebSocket updates
- [ ] Email/SMS alert notifications
- [ ] Multi-network scanning
- [ ] User authentication system
- [ ] Export reports (PDF/CSV)
- [ ] Advanced analytics charts
- [ ] Machine learning anomaly detection

## 📞 Support

For issues or questions:
1. Check [Documentation](readme/)
2. Review [Troubleshooting](#troubleshooting)
3. Check git issues

---

**Status:** ✅ Production Ready  
**Last Updated:** November 30, 2025  
**Demo Ready:** YES 🎉

## License

Educational project for FAST National University FYP.
