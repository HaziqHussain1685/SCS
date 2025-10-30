# SmartCam Shield - Frontend

A modern, cybersecurity-themed React dashboard for monitoring and managing camera security.

## 🚀 Features

- **Real-time Device Monitoring** - Live health scores and vulnerability tracking
- **Interactive Dashboard** - Comprehensive visualization of security metrics
- **Vulnerability Analysis** - Timeline and distribution charts
- **Device Details Modal** - In-depth device information and recommendations
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Cybersecurity Theme** - Futuristic design with neon accents and animations

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Chart visualization
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **date-fns** - Date formatting

## 📦 Installation

1. **Navigate to frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the backend API first** (in another terminal):
   ```powershell
   cd ..\scanner
   python scanner_api.py
   ```

2. **Start the frontend dev server:**
   ```powershell
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Production Build

```powershell
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── ui/         # Reusable UI components
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── layout/     # Layout components
│   │   │   └── Sidebar.jsx
│   │   └── dashboard/  # Dashboard-specific components
│   │       ├── StatsBar.jsx
│   │       ├── HealthScoreGrid.jsx
│   │       ├── DeviceTable.jsx
│   │       ├── VulnerabilityTimeline.jsx
│   │       ├── VulnerabilityChart.jsx
│   │       └── DeviceModal.jsx
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── services/
│   │   └── api.js      # API service layer
│   ├── utils/
│   │   └── helpers.js  # Utility functions
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Design System

### Colors
- **Primary Background:** `#0A0E27` (Deep Navy)
- **Accent Color:** `#00BFFF` (Neon Cyan)
- **Success:** `#10B981` (Emerald)
- **Warning:** `#F59E0B` (Amber)
- **Error:** `#EF4444` (Red)

### Typography
- **Headings:** Orbitron (futuristic tech font)
- **Body:** Inter (clean, readable)
- **Code:** Roboto Mono (monospace)

### Key Features
- Cyber grid background pattern
- Glowing effects on interactive elements
- Smooth animations and transitions
- Dark theme optimized for security monitoring

## 🔌 API Integration

The frontend connects to the Python backend API running on `http://localhost:5000`.

### API Endpoints Used:
- `POST /api/scan` - Run a new network scan
- `GET /api/devices` - Fetch current device data
- `GET /api/history` - Get scan history
- `GET /api/device/<name>` - Get specific device details
- `GET /api/health` - API health check

## 📊 Components Overview

### Dashboard Components

1. **StatsBar** - Overview statistics (total devices, critical issues, avg health, last scan)
2. **HealthScoreGrid** - Visual health meters for each device
3. **DeviceTable** - Sortable table with device details and expandable rows
4. **VulnerabilityTimeline** - Chronological vulnerability feed
5. **VulnerabilityChart** - Pie chart showing vulnerability distribution
6. **DeviceModal** - Detailed device information with tabs

### UI Components

1. **Badge** - Status indicators (CRITICAL, HIGH, MEDIUM, LOW)
2. **Button** - Multiple variants (primary, ghost, danger, success)
3. **Card** - Reusable card container with hover effects
4. **LoadingSpinner** - Animated loading indicator

### Layout Components

1. **Sidebar** - Navigation menu with stats and scan progress

## 🎯 Key Features Implemented

✅ Real-time device health monitoring
✅ Vulnerability detection and visualization
✅ Interactive device details modal
✅ Sortable and expandable device table
✅ Responsive design for all screen sizes
✅ Smooth animations and transitions
✅ Cybersecurity-themed UI
✅ Auto-refresh capability
✅ Network scan triggering
✅ Error handling and loading states

## 🔧 Configuration

### Vite Proxy Configuration
The Vite dev server is configured to proxy API requests to the backend:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Tailwind Configuration
Custom theme with cybersecurity colors, animations, and utilities.

## 📝 Usage Guide

1. **Run a Scan:**
   - Click "Run Scan" button in the header
   - Wait for the scan to complete
   - Dashboard updates with device information

2. **View Device Details:**
   - Click on any device card or table row
   - Modal opens with tabs: Overview, Vulnerabilities, Recommendations
   - Click "Rescan Device" to refresh data

3. **Monitor Vulnerabilities:**
   - Check the Vulnerability Timeline for critical issues
   - Review the pie chart for vulnerability distribution
   - Click on vulnerabilities for more details

4. **Navigation:**
   - Use sidebar to switch between views
   - Quick stats show critical issues at a glance
   - Scan progress displayed when scanning

## 🚨 Troubleshooting

### API Connection Issues
- Ensure the backend API is running on port 5000
- Check console for CORS errors
- Verify proxy configuration in `vite.config.js`

### Build Errors
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `npm run dev -- --force`

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that all PostCSS plugins are installed

## 🤝 Contributing

This frontend is designed to work seamlessly with the SmartCam Shield scanner backend. 

## 📄 License

Part of the SmartCam Shield project.

---

**Built with ❤️ for cybersecurity monitoring**
