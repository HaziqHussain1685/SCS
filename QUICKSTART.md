# 🚀 QUICK START - Complete System Running in 5 Minutes

## Prerequisites Check (30 seconds)

### 1. Verify Python 3.8+
```bash
python --version
# Should show Python 3.8 or higher
```

### 2. Verify Node.js 16+
```bash
node --version
npm --version
# Should show versions
```

### 3. Verify Nmap
```bash
nmap -V
# Should show nmap version info
```

If any are missing:
- **Python:** https://www.python.org/downloads/
- **Node.js:** https://nodejs.org/
- **Nmap:** `choco install nmap` (Windows) or `sudo apt install nmap` (Linux)

---

## ⚡ FAST SETUP

### Terminal 1: Start Backend (1 minute)

```bash
# Navigate to scanner directory
cd scanner

# Install dependencies (first time only - ~30 seconds)
pip install -r requirements.txt

# Start API server
python api.py
```

**Expected output:**
```
🚀 STARTING SMART CAMERA SCANNER API v2.0
✓ Backend: nmap-based network scanning
✓ Port: 5000
✓ CORS: Enabled for localhost:3000
```

✅ **Backend is now running at:** `http://localhost:5000`

---

### Terminal 2: Start Frontend (1 minute)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only - ~30 seconds)
npm install

# Start dev server
npm run dev
```

**Expected output:**
```
VITE v5.3.4 running at:
  ➜  Local:   http://localhost:5173/
```

✅ **Frontend is now running at:** `http://localhost:5173`

---

## 🎯 Using the Scanner (2 minutes)

### Step 1: Open Browser
```
http://localhost:5173
```

### Step 2: See Modern Interface
You should see a beautiful dark-themed scanner with:
- IP input field
- Ping button
- Scan Now button
- Device status indicator (🟢/🔴)

### Step 3: Enter IP Address
```
Default: 192.168.18.234
(Change to your target IP)
```

### Step 4: Click "Ping"
- Button shows device status
- 🟢 Green = Device Online
- 🔴 Red = Device Offline

### Step 5: Click "Scan Now"
- Animation shows scanning progress
- Backend runs comprehensive analysis
- Takes ~2-5 minutes

### Step 6: View Results
When complete, you'll see:
- **Glowing Risk Score** (0-10 scale)
- **Device Profile** (type, confidence, ports)
- **Open Ports** (with services)
- **Vulnerabilities** (with severity levels)
- **Scan Info** (duration, mode)

---

## 🧪 Testing the API Directly

### Test Ping Endpoint

**Terminal 3:**
```bash
curl -X POST http://localhost:5000/api/ping \
  -H "Content-Type: application/json" \
  -d '{"ip": "127.0.0.1"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "ip": "127.0.0.1",
    "reachable": true,
    "latency_ms": 0.5,
    "timestamp": "2026-03-31T10:30:00"
  }
}
```

### Test Scan Endpoint

```bash
curl -X POST http://localhost:5000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"target": "192.168.18.234"}'
```

**Response: Large JSON with complete scan results** (~3000+ lines)

---

## 📊 What You Should See

### Frontend Modern Interface
```
┌─────────────────────────────────────────────┐
│  🎯 IoT Camera Scanner                      │
│  Advanced vulnerability detection           │
│                                             │
│  Target IP Address:                         │
│  [192.168.18.234          ]                │
│                                             │
│  Status: 🟢 Online (25.5ms)                 │
│                                             │
│  [Ping]  [Scan Now]                        │
│                                             │
│  ⏳ Scanning in progress...                 │
│  [████████████████████] 100%                │
└─────────────────────────────────────────────┘
```

### Results Display
```
┌─────────────────────────────────────────────┐
│                                             │
│  OVERALL RISK LEVEL: HIGH                  │
│                                             │
│           [Glowing Red Sphere]              │
│                7.5 / 10                     │
│                                             │
│  Critical: 0  |  High: 2  |  Medium: 1     │
│  Low: 0                                     │
│                                             │
│  📹 Device Profile                          │
│    • Type: IP Camera with RTSP + ONVIF     │
│    • Confidence: 85%                        │
│    • Open Ports: 4                          │
│                                             │
│  🔓 Open Ports (4)                          │
│    554/tcp   RTSP                           │
│    8089/tcp  HTTP-MJPEG                     │
│    8899/tcp  ONVIF                          │
│    80/tcp    HTTP                           │
│                                             │
│  ⚠️  Vulnerabilities (3)                     │
│    • RTSP Video Stream Exposed   [MEDIUM]   │
│    • Unencrypted Web Interface   [HIGH]     │
│    • Default Credentials Possible [HIGH]    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔍 Key Features to Try

### 1. Live Device Status
- Enters IP → Click Ping → See 🟢 or 🔴 instantly

### 2. Click Port to Copy
- Hover over any port number
- Click to copy `IP:PORT` to clipboard

### 3. Inspect Vulnerabilities
- Each vulnerability shows:
  - Title (what's wrong)
  - Severity (Red/Orange/Yellow/Blue/Green)
  - Description (why it matters)
  - Port (where it is)

### 4. Glowing Risk Indicator
- Risk score displayed with animated gradient glow
- Color changes based on severity

---

## ⚠️ Common Issues

### "Nmap not found"
```bash
# Windows
where nmap
# If not found, install: choco install nmap

# Linux
which nmap
# If not found, install: sudo apt install nmap
```

### Port 5000 already in use
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux: Find and kill process
lsof -i :5000
kill -9 <PID>
```

### Port 5173 already in use
```bash
# Just use a different port
npm run dev -- --port 5174
```

### CORS Errors
- Verify backend is running on `http://localhost:5000`
- Verify frontend is on `http://localhost:5173` or `http://localhost:5174`
- CORS is enabled in backend

### Timeout on Scan
- Network connectivity issue
- Nmap takes time on first run
- Try simpler target first (e.g., localhost)

---

## 🎓 Example Scan Workflow

### Scanning Your Home Network

```bash
# Terminal 1: Start backend
cd scanner && python api.py

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: http://localhost:5173
# 1. Enter IP: 192.168.1.100 (your camera)
# 2. Click Ping → See status
# 3. Click Scan Now → Wait 2-5 minutes
# 4. View results

# Results show:
# - Is it a camera? Yes/No
# - How confident? XX%
# - What ports open? List
# - How risky? Score 0-10
# - What needs fixing? Recommendations
```

---

## 📈 Performance Tips

### Faster Scans
- Use QUICK scan (default) not FULL
- Scan devices on LAN, not internet
- Common ports: 8 (default)
- Full scan: all 65535 ports (~3-5 min)

### Batch Scanning
```bash
# Ping multiple IPs at once
curl -X POST http://localhost:5000/api/ping/batch \
  -d '{"ips": ["192.168.1.1", "192.168.1.2", "192.168.1.3"]}'
```

---

## 🔐 Security Notes

### What This Tool Does
✅ Scans YOUR OWN network/devices
✅ Uses Nmap (standard security tool)
✅ Identifies vulnerabilities
✅ Suggests fixes

### What This Tool Does NOT Do
❌ Hack or exploit devices
❌ Install anything on target
❌ Take control of devices
❌ Send data anywhere

### Legal Notice
- Only scan devices YOU OWN or have PERMISSION to scan
- Unauthorized network scanning may be illegal
- Use responsibly!

---

## 📞 Troubleshooting Command Reference

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check if frontend is accessible
curl http://localhost:5173

# Test ping endpoint
curl -X POST http://localhost:5000/api/ping \
  -d '{"ip": "127.0.0.1"}'

# View backend logs
# Check Terminal 1 (where python api.py runs)

# View frontend errors
# Open browser DevTools: F12 → Console tab

# Kill processes cleanly
# Windows: taskkill /PID <PID> /F
# Linux: kill <PID>
```

---

## 🎉 You're Ready!

If you see:
1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Beautiful dark-themed scanner interface
4. ✅ Device ping working (🟢/🔴)
5. ✅ Scan completes with results

**👉 Then you're all set! Start scanning! 🛡️**

---

## 📚 Next Steps

- Read **SETUP_GUIDE_ENHANCED.md** for detailed API reference
- Read **ENHANCEMENT_SUMMARY.md** for feature overview
- Try scanning different devices
- Review vulnerability results
- Follow remediation recommendations

---

**Happy Scanning! 🚀🎯**
