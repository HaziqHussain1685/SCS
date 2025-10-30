# SmartCam Shield - Frontend Quick Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```powershell
cd frontend
npm install
```

### Step 2: Start Backend API
Open a **new terminal** and run:
```powershell
cd scanner
python scanner_api.py
```

The API should start on `http://localhost:5000`

### Step 3: Start Frontend
In your **first terminal** (in the `frontend` directory):
```powershell
npm run dev
```

The dashboard will open at `http://localhost:3000`

---

## 📋 What You'll See

1. **Initial State**: "No Devices Found" screen
2. **Click "Run Scan"**: Scans network for cameras
3. **Dashboard Loads**: Shows all devices with health scores
4. **Click Any Device**: Opens detailed modal

---

## 🎯 Demo Flow

1. Click **"Run Scan"** button
2. Wait 5-10 seconds for scan to complete
3. View 4 cameras with different risk levels:
   - **Camera 1**: Vulnerable (Low score)
   - **Camera 2**: Secure (High score)
   - **Camera 3**: Critical (Very low score)
   - **Camera 4**: Moderate risk
4. Click on **Camera 3** (Critical) to see vulnerabilities
5. Review recommendations in the modal

---

## 🛠️ Troubleshooting

### Issue: "Failed to fetch devices"
**Solution**: Make sure the backend API is running on port 5000
```powershell
cd scanner
python scanner_api.py
```

### Issue: npm install fails
**Solution**: Delete node_modules and try again
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Port 3000 already in use
**Solution**: Kill the process or use a different port
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or change port in vite.config.js
```

---

## 📦 Project Files Created

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── layout/
│   │   │   └── Sidebar.jsx        # Navigation sidebar
│   │   └── dashboard/
│   │       ├── StatsBar.jsx       # Top stats cards
│   │       ├── HealthScoreGrid.jsx # Device health meters
│   │       ├── DeviceTable.jsx    # Main device table
│   │       ├── VulnerabilityTimeline.jsx
│   │       ├── VulnerabilityChart.jsx
│   │       └── DeviceModal.jsx    # Device details popup
│   ├── pages/
│   │   └── Dashboard.jsx          # Main dashboard page
│   ├── services/
│   │   └── api.js                 # API integration
│   ├── utils/
│   │   └── helpers.js             # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                  # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🎨 Features Implemented

✅ **Dashboard Overview**
- 4 stat cards (Total Devices, Critical Issues, Avg Health, Last Scan)
- Real-time health score visualization
- Color-coded risk levels

✅ **Device Monitoring**
- Circular health meters for each device
- Interactive device table with sorting
- Expandable rows for port details

✅ **Vulnerability Analysis**
- Timeline view of all vulnerabilities
- Pie chart distribution
- Severity badges (CRITICAL, HIGH, MEDIUM, LOW)

✅ **Device Details Modal**
- Overview tab (device info, ports)
- Vulnerabilities tab (risks, CVEs)
- Recommendations tab (step-by-step fixes)

✅ **Design System**
- Cybersecurity-themed dark UI
- Neon cyan accents
- Smooth animations
- Responsive layout

---

## 🔌 API Endpoints Used

- `POST /api/scan` - Run network scan
- `GET /api/devices` - Get device list
- `GET /api/device/<name>` - Get device details
- `GET /api/history` - Get scan history
- `GET /api/health` - Health check

---

## 🎯 Next Steps

1. **Customize Colors**: Edit `tailwind.config.js`
2. **Add Features**: Create new components in `src/components/`
3. **Modify Layout**: Edit `Dashboard.jsx`
4. **Update Styling**: Modify `index.css`

---

## 💡 Tips

- **Auto-refresh**: The "Refresh" button refetches data without rescanning
- **Rescan**: The "Run Scan" button triggers a new network scan
- **Sorting**: Click table headers to sort devices
- **Details**: Click any device card or table row to see full details

---

**Enjoy your SmartCam Shield dashboard! 🛡️**
