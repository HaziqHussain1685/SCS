# ⚡ QUICK TEST GUIDE - Verify System is Working

## 🟢 STEP 1: Check Backend (Port 5000)

Open terminal and run:

```bash
curl http://localhost:5000/api/health
```

**Expected Output:**
```json
{"status": "Backend running successfully", "version": "1.0"}
```

If this fails: Backend is not running, start it with:
```bash
cd scanner
python api.py
```

---

## 🟢 STEP 2: Check Frontend (Port 3000)

Open your browser to:
```
http://localhost:3000
```

**You should see:**
- Dark gray/slate background
- Shield + Zap icons in header
- "IoT Camera Security Scanner" title with gradient text
- IP input field with "192.168.1.100" placeholder
- Quick preset buttons below input
- "Full Port Scan" checkbox
- Large cyan/purple "Start Security Scan" button

If this fails: Frontend is not running, start it with:
```bash
cd frontend
npm run dev
```

---

## 🟢 STEP 3: Test Scan with Test IP

1. In the scanner interface, enter: **192.168.18.234** (or use a preset)
2. Check "Full Port Scan" if available
3. Click **"Start Security Scan"** button
4. Watch the progress bar animate

**Watch backend terminal for output:**
```
[Stage 0/7] Checking device accessibility...
[Stage 1/7] Scanning top 1000 ports...
[Stage 2/7] Detecting device type...
[Stage 3/7] Testing RTSP streams...
[Stage 4/7] Testing ONVIF discovery...
[Stage 5/7] Testing web interfaces...
[Stage 6/7] Testing known credentials...
[Stage 7/7] Analyzing vulnerabilities...
```

---

## 🟢 STEP 4: Verify Results Display

After scan completes, you should see:

### **Dashboard Header** (with 4 cards):
- 🟢 **Device Status**: Shows "ONLINE" or "OFFLINE" with detection method
- 🎥 **Camera Type**: Shows detected device type 
- 🔓 **Open Ports**: Shows number and list of open ports
- ⚡ **Risk Score**: Animated bar 0-10 with severity (CRITICAL/HIGH/MEDIUM/LOW)

### **Tab Navigation** (5 tabs):
Click through each:

1. **Overview** - Summary of vulnerabilities by severity
2. **Vulnerabilities** - Click to expand each card for details
3. **RTSP Proof** 🎬 - Shows snapshot if camera accessible
4. **Attack Scenario** - 6-step attack timeline
5. **Recommendations** - Step-by-step fixes

---

## 🔍 DETAILED VERIFICATION

### Check Tab 1: Overview
- See vulnerability breakdown
- See top critical issues
- See device info summary

### Check Tab 2: Vulnerabilities  
- Click on any vulnerability card
- Should expand to show:
  - Description (what & why)
  - Attack scenario (how attackers exploit)
  - Remediation (step-by-step fix)
  - CVSS score
  - Proof of concept (if applicable)

### Check Tab 3: RTSP Proof ⭐
**If RTSP Accessible:**
- Red alert: "CRITICAL: UNAUTHORIZED RTSP STREAM ACCESS CONFIRMED"
- Snapshot images displayed
- File information (URL, credentials, file size)
- Attack scenario for this vulnerability

**If RTSP Not Accessible:**
- Green success: "RTSP Streams Properly Secured"
- No images shown
- Port 554 may be closed

### Check Tab 4: Attack Scenario
- Should show 6 steps:
  1. Reconnaissance
  2. Service Enumeration  
  3. Credential Testing
  4. Stream Access
  5. Exploitation
  6. Persistence
- Each step shows tools and description

### Check Tab 5: Recommendations
- Should show fixes grouped by severity
- Each with step-by-step remediation
- Priority and effort level

---

## 🐛 TROUBLESHOOTING

### Issue: "Connection Refused" on Backend
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000

# If something else is using it, kill it or change port
```

### Issue: Frontend won't load
```bash
# Kill old Node processes
taskkill /F /IM node.exe

# Restart frontend
cd frontend
npm run dev
```

### Issue: Images not showing in RTSP Proof tab
- FFmpeg might not be installed
- Or RTSP stream is not accessible (normal if camera offline)
- Check backend terminal for FFmpeg errors

### Issue: Scan takes very long
- Full scan (65535 ports) takes longer than quick scan
- Normal operation is 30-60 seconds
- Check backend terminal for progress

---

## ✅ SUCCESS INDICATORS

You'll know everything is working when:

✅ Frontend loads without errors  
✅ Backend API responds to requests  
✅ Scan starts when button clicked  
✅ Progress bar animates  
✅ Results page displays with data  
✅ Risk score shows with color gradient  
✅ Device status shows ONLINE or OFFLINE  
✅ Vulnerability cards are clickable/expandable  
✅ Attack scenario shows 6 steps  
✅ RTSP snapshots appear if camera accessible  
✅ Recommendations show fixes  

---

## 🎨 VISUAL CHECKS

### Color Scheme Should Be:
- Background: Dark slate (almost black)
- Primary: Cyan/blue accents (#00d9ff, #0ea5e9)
- Secondary: Purple accents (#a855f7)
- Severity: 
  - Red for CRITICAL (#ef4444)
  - Orange for HIGH (#f97316)
  - Yellow for MEDIUM (#eab308)
  - Blue for LOW (#3b82f6)
- Success: Green (#10b981)

### Animations Should Show:
- Title text gradients
- Pulsing green dot on ONLINE status
- Bouncing Zap icon
- Smooth card hover effects
- Animated progress bars
- Icon rotations in loading state

---

## 🎯 DEMO MODE

If actual camera not available, test with:
- **Local IP scan**: 192.168.1.1 (router)
- **Test RTSP server** (if available on network)
- **Manually enter results** (for viva if needed)

---

## 📊 TEST DATA SAMPLE

If scan completes but shows no results, backend might be failing. Check:

1. **Backend terminal** - Look for error messages
2. **Network connection** - Can you ping the target IP?
3. **FFmpeg installed** - Run `ffmpeg -version` in terminal
4. **Python packages** - Run `pip list` to verify all installed

---

## 🚀 READY TO DEMO?

Once all checks pass, you're ready to:
1. Open dashboard for presentation
2. Run live scan during demo
3. Show captured snapshots as proof
4. Walk through attack scenario
5. Share remediation recommendations

**You now have a professional, working security assessment tool! 🎉**
