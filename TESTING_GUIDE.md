# ✅ VERIFICATION & TESTING CHECKLIST

## Pre-Flight Verification (5 minutes)

### 1. Dependencies Installed
- [ ] FFmpeg: `ffmpeg -version` shows output
- [ ] Python 3.8+: `python --version`
- [ ] Node 16+: `node --version`
- [ ] pip packages: `pip list | grep flask`

### 2. File Structure
```
✓ scanner/
  ├── api.py (UPDATED with 5 new endpoints)
  ├── rtsp_streams.py (NEW - 400+ lines)
  ├── rtsp_proof_of_concept.py
  ├── scanner_main.py
  ├── snapshots/ (auto-created on first capture)
  └── requirements.txt

✓ frontend/
  ├── src/components/dashboard/
  │   └── AdvancedCybersecurityDashboard.jsx (UPDATED RTSPProofTab)
  ├── package.json
  └── vite.config.js
```

### 3. Code Quality
- [ ] No Python syntax errors: `python -m py_compile scanner/rtsp_streams.py`
- [ ] No TypeScript/JS errors in frontend build
- [ ] api.py imports check: Look for `from rtsp_streams import RTSPStreamManager`
- [ ] AdvancedCybersecurityDashboard.jsx renders without console errors

---

## Backend Testing (10 minutes)

### Start Backend
```bash
cd scanner
python api.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: off
```

### Test Each Endpoint

#### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
**Expected:** `{"status": "Backend running successfully..."}`

#### 2. RTSP Validation
```bash
curl -X POST http://localhost:5000/api/rtsp/validate \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url":"rtsp://192.168.18.234/live"}'
```
**Expected:** JSON with `accessible` and `latency_ms` fields

#### 3. List Snapshots (Empty Initially)
```bash
curl http://localhost:5000/api/snapshots
```
**Expected:** `{"success": true, "count": 0, "snapshots": []}`

#### 4. Snapshot Capture
```bash
curl -X POST http://localhost:5000/api/snapshot/capture \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url":"rtsp://192.168.18.234/live","camera_id":"test"}'
```
**Expected:** 
- Success: JSON with filename and URL
- Failure: JSON with error message (acceptable if camera offline)

#### 5. List Snapshots (After Capture)
```bash
curl http://localhost:5000/api/snapshots
```
**Expected:** Snapshot appears in list (if capture succeeded)

#### 6. Live Stream (Visual Check)
```bash
# Downloads 1-10 MB MJPEG stream for 5 seconds
curl --max-time 5 \
  "http://localhost:5000/live-stream?rtsp_url=rtsp%3A%2F%2F192.168.18.234%2Flive" \
  -o test_stream.mjpeg

# Check file size
ls -lh test_stream.mjpeg
```
**Expected:** File > 100 KB (if stream accessible)

---

## Frontend Testing (10 minutes)

### Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x ready in X ms

  ➜  Local:   http://127.0.0.1:3000/
  ➜  press h + enter to show help
```

### Test Scanner Interface
1. [ ] Open http://localhost:3000
2. [ ] See scanner input page
3. [ ] IP input field visible
4. [ ] "Start Security Scan" button clickable

### Run Scan
1. [ ] Enter: `192.168.18.234`
2. [ ] Click "Start Security Scan"
3. [ ] Progress bar animates
4. [ ] Backend logs show stages (Stage 0-7)
5. [ ] Dashboard appears after 30-60 seconds

### Test RTSP-Proof Tab
1. [ ] Click "RTSP-Proof" tab
2. [ ] If RTSP accessible:
   - [ ] Red alert displays
   - [ ] "Live Camera Feed" section visible
   - [ ] "Show" button clickable
3. [ ] If RTSP not accessible:
   - [ ] Green "Properly Secured" message displays

### Test Live Stream Display
1. [ ] Click "Show" button in Live Camera Feed
2. [ ] Wait 2-5 seconds
3. [ ] Either:
   - [ ] **SUCCESS**: MJPEG stream displays
   - [ ] **ERROR**: "Failed to load stream" message (acceptable)

### Test Snapshot Capture
1. [ ] Click "Capture New" button
2. [ ] Button shows "Capturing..." text
3. [ ] Wait 5-10 seconds
4. [ ] Button returns to normal
5. [ ] New snapshot appears in gallery (if capture succeeded)

### Test Other Tabs
- [ ] **Overview** tab: Summary cards display
- [ ] **Vulnerabilities** tab: Expandable cards show details
- [ ] **Attack-Scenario** tab: 6-step timeline visible
- [ ] **Recommendations** tab: Remediation steps display

---

## Browser Console Checks

### Open Browser DevTools
```
Press F12 or Ctrl+Shift+I
```

### Check for Errors
- [ ] No red error messages in Console tab
- [ ] No 404 errors in Network tab
- [ ] No CORS warnings

### Check Network Requests
1. Click "RTSP-Proof" tab
2. Open DevTools Network tab
3. Look for requests to:
   - [ ] `/api/snapshots` - GET (should return 200)
   - [ ] `/live-stream` - GET (should return 206 or 200)
   - [ ] `/api/snapshot/`... - GET (if snapshots exist, should return 200)

---

## File System Verification

### Check Snapshots Directory
```bash
# Should exist and be accessible
ls -la scanner/snapshots/

# Should contain .jpg files after capture attempt
ls -lh scanner/snapshots/*.jpg
```

**Expected:**
```
total 180K
snapshot_test_20260331_143022.jpg (45K)
snapshot_default_20260331_140215.jpg (52K)
```

### Check Permissions
```bash
# Snapshots readable
cat scanner/snapshots/snapshot_*.jpg > /dev/null && echo "OK"

# Can list directory
ls scanner/snapshots/ | wc -l
```

---

## Performance Benchmarks

| Metric | Expected | Actual |
|--------|----------|--------|
| Backend startup | < 2 seconds | ___ |
| API health check | < 100 ms | ___ |
| RTSP validation | < 5 seconds | ___ |
| Snapshot capture | 5-15 seconds | ___ |
| Live stream load | < 3 seconds | ___ |
| Dashboard render | < 1 second | ___ |
| Gallery load | < 500 ms | ___ |

---

## End-to-End Workflow Test

### Complete Flow (5 minutes)
```
1. Clear old snapshots
   rm scanner/snapshots/*.jpg

2. Start backend
   cd scanner && python api.py

3. Start frontend
   cd frontend && npm run dev

4. Open http://localhost:3000

5. Enter IP: 192.168.18.234

6. Click "Start Security Scan"

7. Wait for results

8. Click "RTSP-Proof" tab

9. Click "Show" on Live Feed
   ↓ Wait for stream to load

10. Click "Capture New"
    ↓ Wait 5-10 seconds

11. View new snapshot in gallery

12. Refresh page
    ↓ Snapshots still visible

13. Check backend logs
    ✓ No errors
    ✓ Stream messages visible
    ✓ Snapshot capture logged
```

**Checklist:**
- [ ] All steps completed without errors
- [ ] Stream displayed (or appropriate error)
- [ ] Snapshot saved and displayed
- [ ] No console errors
- [ ] No network errors (404, 500)

---

## Ready for Demo/Viva? 🎉
If all tests pass, system is ready. When you can check these boxes:

- [ ] Pre-flight verification complete
- [ ] Backend testing complete  
- [ ] Frontend testing complete
- [ ] Browser console clean
- [ ] File system verified
- [ ] End-to-end workflow successful

**System Status**: ✅ **PRODUCTION READY**

Good luck with your presentation! 🚀
