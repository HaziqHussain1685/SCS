# 🚀 Quick Start - RTSP Streaming & Snapshots

## ⚡ 30-Second Setup

### Prerequisites
```bash
# Ensure FFmpeg is installed
ffmpeg -version

# If not installed:
# Windows (PowerShell admin): choco install ffmpeg
# Linux: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
```

### Start Servers
```bash
# Terminal 1 - Backend
cd scanner
python api.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access Dashboard
```
http://localhost:3000
```

---

## 🎬 Test Live Stream

### Test 1: Known Working RTSP
```
IP: 192.168.18.234
Stream: rtsp://192.168.18.234/live
```

1. Enter IP in scanner
2. Click "Start Security Scan"
3. Wait for scan (30-60 seconds)
4. Click **"RTSP-Proof"** tab
5. Wait for critical alert (if stream accessible)
6. Click **"Show"** in "Live Camera Feed" section
7. See real-time camera footage ✅

### Test 2: Capture Snapshot
1. In RTSP-Proof tab, click **"Capture New"** button
2. Wait 5-10 seconds
3. New snapshot appears in gallery ✅
4. File size and timestamp shown

### Test 3: Recent Snapshots
1. View gallery below live stream
2. Click snapshot to view full-size
3. Download snapshot if needed

---

## 🔍 API Testing

### Test Live Stream (cURL)
```bash
curl -o stream.mjpeg \
  "http://localhost:5000/live-stream?rtsp_url=rtsp%3A%2F%2F192.168.18.234%2Flive"
```

### Test Snapshot Capture (cURL)
```bash
curl -X POST http://localhost:5000/api/snapshot/capture \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url":"rtsp://192.168.18.234/live",
    "camera_id":"test"
  }' | jq
```

### Test List Snapshots (cURL)
```bash
curl http://localhost:5000/api/snapshots | jq
```

### Test RTSP Validation (cURL)
```bash
curl -X POST http://localhost:5000/api/rtsp/validate \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url":"rtsp://192.168.18.234/live"}' | jq
```

---

## 🖼️ File Storage

### Snapshots Location
```
c:\Users\haziq\OneDrive\Desktop\SCS\scanner\snapshots\
```

### List All Snapshots
```bash
dir scanner\snapshots\
```

### Clean Old Snapshots
```bash
# Keep only last 5 snapshots
ls -t scanner/snapshots/*.jpg | tail -n +6 | xargs rm
```

---

## ✅ Verification Checklist

| Feature | Command | Expected |
|---------|---------|----------|
| **Backend Health** | `curl http://localhost:5000/api/health` | `{"status": "Backend running..."}` |
| **Frontend Load** | Open `http://localhost:3000` | Page loads, scanner input visible |
| **Snapshot Endpoint** | `curl http://localhost:5000/api/snapshots` | `{"success": true, "snapshots": [...]}` |
| **RTSP Validate** | POST to `/rtsp/validate` | `{"accessible": true/false, "latency_ms": X}` |
| **Live Stream** | GET `/live-stream?rtsp_url=...` | MJPEG stream or error message |
| **Dashboard Tab** | Click "RTSP-Proof" | Tab content loads without errors |

---

## 🎯 What's New

### Files Added
- ✅ `scanner/rtsp_streams.py` (400+ lines) - Live streaming and snapshot management
- ✅ 5 new API endpoints in `api.py`
- ✅ Enhanced `AdvancedCybersecurityDashboard.jsx` with live feed support

### Features Added
- ✅ Real-time MJPEG stream from RTSP cameras
- ✅ On-demand snapshot capture
- ✅ Snapshot gallery with file info
- ✅ Stream validation and healthcheck
- ✅ Security impact explanation

### Backend Endpoints
```
GET  /live-stream?rtsp_url=...          # MJPEG stream
POST /api/snapshot/capture              # Capture new snapshot
GET  /api/snapshot/<filename>           # Download snapshot
GET  /api/snapshots                     # List snapshots
POST /api/rtsp/validate                 # Check stream accessibility
```

---

## 🐛 Common Issues & Fixes

### **Issue**: Stream shows but doesn't update
**Fix**: Restart frontend with `npm run dev`

### **Issue**: Snapshot capture fails
**Fix**: Ensure FFmpeg installed: `ffmpeg -version`

### **Issue**: "Stream unavailable" error
**Fix**: Check camera is online and RTSP URL is correct

### **Issue**: Snapshots directory missing
**Fix**: Backend creates it automatically on first capture

### **Issue**: Port 5000/3000 already in use
**Fix**: Kill existing processes or change port numbers

---

## 📊 Performance Tips

### Faster Stream Updates
Edit `rtsp_streams.py`:
```python
'-r', '10',  # Increase from 5 to 10 fps
```

### Better Image Quality
```python
'-q:v', '2',  # Decrease from 5 to 2 (1-31 scale)
```

### Lower Bandwidth
```python
'-vf', 'scale=640:480',  # Reduce from 800:600
```

### Increase Snapshot Timeout
```python
timeout=15  # Increase from 10 seconds
```

---

## 🎓 Demo Talking Points

### "Proof of Vulnerability"
- Real frames captured from *actual* camera
- Not simulated, not synthetic
- Proves unauthorized RTSP access possible
- Anyone on network can see live feed

### "Security Impact"
- No authentication required
- Real-time surveillance data exposed
- Can be recorded and archived
- Privacy violation

### "Technical Achievement"
- FFmpeg integration for format conversion
- MJPEG streaming to web browsers
- Automatic snapshot storage and retrieval
- RESTful API for programmatic access

### "Enterprise Features"
- Stream validation before display
- Error handling and fallbacks
- Gallery management
- Real-time performance monitoring

---

## 🎬 Pro Demonstration

1. **Start Scan**
   - Show scanner interface
   - Enter camera IP
   - Click "Start Security Scan"

2. **View Results (30-60 seconds)**
   - Show device detection
   - Show open ports
   - Show vulnerability list

3. **Demonstrate Proof**
   - Click "RTSP-Proof" tab
   - Show critical alert
   - Show actual camera frame (if accessible)
   - Explain security risk

4. **Show Live Stream**
   - Click "Show" on live feed
   - Real-time video displays
   - Explain MJPEG conversion

5. **Capture New Snapshot**
   - Click "Capture New" button
   - Wait 5-10 seconds
   - New image appears in gallery
   - Explain on-demand testing

6. **Show Attack Path**
   - Switch to "Attack-Scenario" tab
   - Explain 6-step exploitation
   - Walk through realistic attack

7. **Show Recommendations**
   - Switch to "Recommendations" tab
   - Show professional remediation steps
   - Explain step-by-step fixes

---

## 🔗 Useful Links

- **FFmpeg Docs**: https://ffmpeg.org/
- **RTSP Wiki**: https://en.wikipedia.org/wiki/Real_Time_Streaming_Protocol
- **Flask API**: https://flask.palletsprojects.com/
- **React Docs**: https://react.dev/

---

## 📞 Support

If you encounter issues:

1. **Check terminal output** for error messages
2. **Verify FFmpeg** is installed correctly
3. **Check network** - camera must be reachable
4. **Review logs** - backend prints detailed status
5. **Read RTSP_STREAMING_GUIDE.md** for detailed troubleshooting

---

**Ready to demo! 🚀**

Start with the 30-second setup above and follow the test procedures.

Good luck with your viva presentation! 💪
