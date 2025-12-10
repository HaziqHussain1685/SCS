# SmartCam Shield - Test Cases

**Project:** SmartCam Shield - IoT Security Scanner  
**Version:** 1.0  
**Date:** December 11, 2025

---

## Table of Contents
1. [Backend API Test Cases](#backend-api-test-cases)
2. [Network Scanner Test Cases](#network-scanner-test-cases)
3. [Frontend Component Test Cases](#frontend-component-test-cases)
4. [Integration Test Cases](#integration-test-cases)
5. [Manual Camera Test Cases](#manual-camera-test-cases)
6. [Alert System Test Cases](#alert-system-test-cases)
7. [PDF Export Test Cases](#pdf-export-test-cases)
8. [Group Management Test Cases](#group-management-test-cases)

---

## 1. Backend API Test Cases

### TC-API-001: Health Check Endpoint
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-API-001 |
| **Description** | Verify API health check endpoint returns correct status |
| **Pre-conditions** | Backend API is running on port 5000 |
| **Test Steps** | 1. Send GET request to `/api/health`<br>2. Verify response status code<br>3. Check response JSON structure |
| **Expected Result** | Status 200, JSON with `success: true`, timestamp, features |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

**cURL Command:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "SmartCam Shield Scanner API is running",
  "timestamp": "2025-12-11T10:30:00.000Z",
  "features": {
    "alerts": true,
    "pdf_export": true
  }
}
```

---

### TC-API-002: Run Network Scan
**Priority:** CRITICAL  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-API-002 |
| **Description** | Verify full network scan executes and returns device data |
| **Pre-conditions** | 1. API running<br>2. Docker containers running |
| **Test Steps** | 1. Send POST to `/api/scan`<br>2. Wait for response<br>3. Verify device array returned<br>4. Check summary statistics |
| **Expected Result** | Status 200, devices array with 4 cameras, summary stats |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/scan
```

**Expected Response Structure:**
```json
{
  "success": true,
  "scan_time": "2025-12-11T10:35:00.000Z",
  "devices": [
    {
      "name": "Camera 1 - Vulnerable",
      "ip": "172.25.0.11",
      "health_score": 30,
      "risk_level": "CRITICAL",
      "status": "online",
      "open_ports": [...],
      "credentials": {...},
      "identified_risks": [...],
      "recommendations": [...]
    }
  ],
  "summary": {
    "total": 4,
    "online": 4,
    "offline": 0,
    "critical": 2,
    "high": 1,
    "medium": 0,
    "low": 1
  }
}
```

---

### TC-API-003: Get Current Devices
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-API-003 |
| **Description** | Retrieve cached device list from last scan |
| **Pre-conditions** | At least one scan has been completed |
| **Test Steps** | 1. Send GET to `/api/devices`<br>2. Verify response contains devices<br>3. Check device attributes |
| **Expected Result** | Status 200, devices array with complete data |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-API-004: Get Scan History
**Priority:** MEDIUM  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-API-004 |
| **Description** | Retrieve historical scan records |
| **Pre-conditions** | Multiple scans have been performed |
| **Test Steps** | 1. Send GET to `/api/history`<br>2. Verify history array<br>3. Check timestamp ordering |
| **Expected Result** | Status 200, history array with scan records |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-API-005: Get Device Details
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-API-005 |
| **Description** | Retrieve detailed information for specific device |
| **Pre-conditions** | Device exists in current scan results |
| **Test Steps** | 1. Send GET to `/api/device/Camera-1-Vulnerable`<br>2. Verify device object returned<br>3. Check all attributes present |
| **Expected Result** | Status 200, complete device object |
| **Test Data** | Device name: "Camera 1 - Vulnerable" |
| **Actual Result** | ✅ PASS |

---

### TC-API-006: Invalid Endpoint
**Priority:** MEDIUM  
**Test Type:** Negative

| Field | Details |
|-------|---------|
| **Test ID** | TC-API-006 |
| **Description** | Verify API handles invalid endpoints gracefully |
| **Pre-conditions** | API is running |
| **Test Steps** | 1. Send GET to `/api/invalid`<br>2. Check response status<br>3. Verify error message |
| **Expected Result** | Status 404, error message |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

## 2. Network Scanner Test Cases

### TC-SCAN-001: Port Detection
**Priority:** CRITICAL  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-SCAN-001 |
| **Description** | Verify scanner detects open ports correctly |
| **Pre-conditions** | Camera containers with multiple ports running |
| **Test Steps** | 1. Scan Camera 3 (multiple ports)<br>2. Verify all ports detected<br>3. Check port service identification |
| **Expected Result** | All ports detected with correct services (HTTP, FTP, Telnet, RTSP) |
| **Test Data** | Camera 3: ports 8083, 2121, 2323, 5543 |
| **Actual Result** | ✅ PASS |

---

### TC-SCAN-002: Credential Testing
**Priority:** CRITICAL  
**Test Type:** Security

| Field | Details |
|-------|---------|
| **Test ID** | TC-SCAN-002 |
| **Description** | Verify scanner detects weak credentials |
| **Pre-conditions** | Camera with default credentials |
| **Test Steps** | 1. Scan Camera 1<br>2. Check detected credentials<br>3. Verify strength assessment |
| **Expected Result** | Credentials detected: admin/admin, strength: weak |
| **Test Data** | Camera 1: admin/admin |
| **Actual Result** | ✅ PASS |

---

### TC-SCAN-003: Health Score Calculation
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-SCAN-003 |
| **Description** | Verify health score accuracy based on vulnerabilities |
| **Pre-conditions** | Multiple cameras with different security levels |
| **Test Steps** | 1. Scan all cameras<br>2. Compare health scores<br>3. Verify score ranges (0-100) |
| **Expected Result** | Camera 1: ~30, Camera 2: ~90, Camera 3: ~20, Camera 4: ~50 |
| **Test Data** | All 4 cameras |
| **Actual Result** | ✅ PASS |

**Validation:**
- Critical cameras: 0-39 points
- High risk: 40-59 points
- Medium risk: 60-79 points
- Low risk: 80-100 points

---

### TC-SCAN-004: Firmware Vulnerability Detection
**Priority:** HIGH  
**Test Type:** Security

| Field | Details |
|-------|---------|
| **Test ID** | TC-SCAN-004 |
| **Description** | Verify scanner identifies outdated/vulnerable firmware |
| **Pre-conditions** | Cameras with different firmware versions |
| **Test Steps** | 1. Scan Camera 1 (v0.9.4)<br>2. Check firmware status<br>3. Verify CVE detection |
| **Expected Result** | Status: vulnerable, CVEs: CVE-2023-1234, CVE-2023-5678 |
| **Test Data** | Camera 1: firmware v0.9.4 |
| **Actual Result** | ✅ PASS |

---

### TC-SCAN-005: Offline Device Handling
**Priority:** MEDIUM  
**Test Type:** Negative

| Field | Details |
|-------|---------|
| **Test ID** | TC-SCAN-005 |
| **Description** | Verify scanner handles offline devices correctly |
| **Pre-conditions** | One camera container stopped |
| **Test Steps** | 1. Stop Camera 4 container<br>2. Run scan<br>3. Check Camera 4 status |
| **Expected Result** | Status: offline, risk_level: OFFLINE, no vulnerabilities |
| **Test Data** | Camera 4 stopped |
| **Actual Result** | ✅ PASS |

---

### TC-SCAN-006: Recommendation Generation
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-SCAN-006 |
| **Description** | Verify actionable recommendations are generated |
| **Pre-conditions** | Vulnerable camera scanned |
| **Test Steps** | 1. Scan Camera 1<br>2. Check recommendations array<br>3. Verify priority levels and steps |
| **Expected Result** | 3+ recommendations with priorities and step-by-step actions |
| **Test Data** | Camera 1 |
| **Actual Result** | ✅ PASS |

---

## 3. Frontend Component Test Cases

### TC-UI-001: Dashboard Load
**Priority:** CRITICAL  
**Test Type:** UI

| Field | Details |
|-------|---------|
| **Test ID** | TC-UI-001 |
| **Description** | Verify dashboard loads and displays correctly |
| **Pre-conditions** | Frontend running on port 3000 |
| **Test Steps** | 1. Navigate to http://localhost:3000<br>2. Wait for page load<br>3. Verify components visible |
| **Expected Result** | Dashboard displays with sidebar, stats, device table, charts |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-UI-002: Scan Button Functionality
**Priority:** HIGH  
**Test Type:** UI/Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-UI-002 |
| **Description** | Verify scan button triggers network scan |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Click "Scan Network" button<br>2. Observe loading state<br>3. Wait for results<br>4. Verify device table updates |
| **Expected Result** | Loading spinner shows, devices populate, timestamp updates |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-UI-003: Device Modal Display
**Priority:** HIGH  
**Test Type:** UI

| Field | Details |
|-------|---------|
| **Test ID** | TC-UI-003 |
| **Description** | Verify clicking device opens detail modal |
| **Pre-conditions** | Devices visible in table |
| **Test Steps** | 1. Click on Camera 1 row<br>2. Verify modal opens<br>3. Check tabs (Overview, Vulnerabilities, Recommendations)<br>4. Switch between tabs |
| **Expected Result** | Modal opens with device info, all tabs functional |
| **Test Data** | Camera 1 |
| **Actual Result** | ✅ PASS |

---

### TC-UI-004: Attack Feed Animation
**Priority:** MEDIUM  
**Test Type:** UI/Performance

| Field | Details |
|-------|---------|
| **Test ID** | TC-UI-004 |
| **Description** | Verify attack feed generates events smoothly |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Observe right sidebar<br>2. Wait for attack events<br>3. Verify animations<br>4. Check pause/resume |
| **Expected Result** | Events appear every 5-10s, smooth animations, pause works |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-UI-005: Stats Bar Updates
**Priority:** MEDIUM  
**Test Type:** UI/Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-UI-005 |
| **Description** | Verify statistics update after scan |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Note initial stats<br>2. Run scan<br>3. Compare stats after scan<br>4. Verify counts match devices |
| **Expected Result** | Stats reflect actual device counts and risk levels |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-UI-006: Responsive Design
**Priority:** MEDIUM  
**Test Type:** UI

| Field | Details |
|-------|---------|
| **Test ID** | TC-UI-006 |
| **Description** | Verify UI adapts to different screen sizes |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Resize browser window<br>2. Test tablet size (768px)<br>3. Test mobile size (480px)<br>4. Check component layout |
| **Expected Result** | Layout adjusts, no overflow, elements remain accessible |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

## 4. Integration Test Cases

### TC-INT-001: Frontend-Backend Communication
**Priority:** CRITICAL  
**Test Type:** Integration

| Field | Details |
|-------|---------|
| **Test ID** | TC-INT-001 |
| **Description** | Verify frontend successfully calls backend APIs |
| **Pre-conditions** | Both services running, CORS enabled |
| **Test Steps** | 1. Open browser DevTools<br>2. Trigger scan from UI<br>3. Monitor Network tab<br>4. Verify API calls succeed |
| **Expected Result** | All API calls return 200, data populates UI |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-INT-002: Docker Container Communication
**Priority:** HIGH  
**Test Type:** Integration

| Field | Details |
|-------|---------|
| **Test ID** | TC-INT-002 |
| **Description** | Verify backend communicates with camera containers |
| **Pre-conditions** | All containers in same network |
| **Test Steps** | 1. Check container IPs<br>2. Run scan<br>3. Verify each camera responds<br>4. Check port mappings |
| **Expected Result** | All 4 cameras respond, ports accessible |
| **Test Data** | Camera IPs: 172.25.0.11-14 |
| **Actual Result** | ✅ PASS |

---

### TC-INT-003: Error Handling - API Down
**Priority:** HIGH  
**Test Type:** Negative/Integration

| Field | Details |
|-------|---------|
| **Test ID** | TC-INT-003 |
| **Description** | Verify frontend handles backend unavailability |
| **Pre-conditions** | Frontend running |
| **Test Steps** | 1. Stop backend API<br>2. Try to scan from UI<br>3. Verify error message<br>4. Check manual cameras still visible |
| **Expected Result** | Error message displayed, manual cameras remain |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

## 5. Manual Camera Test Cases

### TC-MANUAL-001: Add Manual Camera
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-MANUAL-001 |
| **Description** | Verify manual camera can be added successfully |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Click "Add Camera" button<br>2. Enter name: "Test Cam"<br>3. Enter IP: "192.168.1.100"<br>4. Click Add<br>5. Verify camera appears in list |
| **Expected Result** | Camera added, visible in table, stored in localStorage |
| **Test Data** | Name: "Test Cam", IP: "192.168.1.100" |
| **Actual Result** | ✅ PASS |

---

### TC-MANUAL-002: Form Validation
**Priority:** MEDIUM  
**Test Type:** Validation

| Field | Details |
|-------|---------|
| **Test ID** | TC-MANUAL-002 |
| **Description** | Verify form validates required fields |
| **Pre-conditions** | Add Camera modal open |
| **Test Steps** | 1. Leave name empty<br>2. Enter IP<br>3. Try to submit<br>4. Verify error message |
| **Expected Result** | Error: "Camera name is required" |
| **Test Data** | Name: empty, IP: "192.168.1.1" |
| **Actual Result** | ✅ PASS |

---

### TC-MANUAL-003: IP Format Validation
**Priority:** MEDIUM  
**Test Type:** Validation

| Field | Details |
|-------|---------|
| **Test ID** | TC-MANUAL-003 |
| **Description** | Verify IP address format is validated |
| **Pre-conditions** | Add Camera modal open |
| **Test Steps** | 1. Enter name: "Test"<br>2. Enter invalid IP: "999.999.999.999"<br>3. Try to submit |
| **Expected Result** | Error: "Invalid IP address format" |
| **Test Data** | Invalid IPs: "999.999", "abc.def", "192.168.1" |
| **Actual Result** | ✅ PASS |

---

### TC-MANUAL-004: Random Attribute Generation
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-MANUAL-004 |
| **Description** | Verify random attributes are generated correctly |
| **Pre-conditions** | Add Camera modal ready |
| **Test Steps** | 1. Add manual camera<br>2. Click on camera to view details<br>3. Verify all attributes present<br>4. Check realistic values |
| **Expected Result** | Model, firmware, credentials, health score all populated |
| **Test Data** | Name: "Test", IP: "192.168.1.1" |
| **Actual Result** | ✅ PASS |

---

### TC-MANUAL-005: Delete Manual Camera
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-MANUAL-005 |
| **Description** | Verify manual camera can be deleted |
| **Pre-conditions** | Manual camera exists |
| **Test Steps** | 1. Click on manual camera<br>2. Click delete button<br>3. Confirm deletion<br>4. Verify camera removed from list |
| **Expected Result** | Camera deleted from UI and localStorage |
| **Test Data** | Existing manual camera |
| **Actual Result** | ✅ PASS |

---

### TC-MANUAL-006: localStorage Persistence
**Priority:** CRITICAL  
**Test Type:** Data Persistence

| Field | Details |
|-------|---------|
| **Test ID** | TC-MANUAL-006 |
| **Description** | Verify manual cameras persist across sessions |
| **Pre-conditions** | Manual camera added |
| **Test Steps** | 1. Add manual camera<br>2. Note camera details<br>3. Refresh browser<br>4. Verify camera still present<br>5. Close and reopen browser<br>6. Verify persistence |
| **Expected Result** | Camera remains after refresh and browser restart |
| **Test Data** | Name: "Persistent Cam", IP: "192.168.1.99" |
| **Actual Result** | ✅ PASS |

---

### TC-MANUAL-007: Mixed Camera Display
**Priority:** HIGH  
**Test Type:** Integration

| Field | Details |
|-------|---------|
| **Test ID** | TC-MANUAL-007 |
| **Description** | Verify scanned and manual cameras display together |
| **Pre-conditions** | Scanned cameras and manual cameras exist |
| **Test Steps** | 1. Run network scan (4 cameras)<br>2. Add manual camera<br>3. Verify total count<br>4. Check both types in table |
| **Expected Result** | Total 5 cameras, both types visible and functional |
| **Test Data** | 4 scanned + 1 manual |
| **Actual Result** | ✅ PASS |

---

## 6. Alert System Test Cases

### TC-ALERT-001: Get Alert Settings
**Priority:** MEDIUM  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-ALERT-001 |
| **Description** | Verify alert settings can be retrieved |
| **Pre-conditions** | Alert system enabled |
| **Test Steps** | 1. Send GET to `/api/alerts/settings`<br>2. Verify response structure<br>3. Check default values |
| **Expected Result** | Status 200, settings object with email/SMS config |
| **Test Data** | N/A |
| **Actual Result** | ✅ PASS |

---

### TC-ALERT-002: Update Alert Settings
**Priority:** MEDIUM  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-ALERT-002 |
| **Description** | Verify alert settings can be updated |
| **Pre-conditions** | Alert system enabled |
| **Test Steps** | 1. POST settings to `/api/alerts/settings`<br>2. Verify save success<br>3. GET settings to confirm |
| **Expected Result** | Settings saved and persisted |
| **Test Data** | Email: test@example.com, threshold: 50 |
| **Actual Result** | ✅ PASS |

---

### TC-ALERT-003: Send Test Email
**Priority:** LOW  
**Test Type:** Integration

| Field | Details |
|-------|---------|
| **Test ID** | TC-ALERT-003 |
| **Description** | Verify test email can be sent |
| **Pre-conditions** | Email configured, SMTP accessible |
| **Test Steps** | 1. Configure email settings<br>2. Click "Test Email" button<br>3. Check email inbox |
| **Expected Result** | Test email received at configured address |
| **Test Data** | Valid email address |
| **Actual Result** | ⚠️ SKIP (Requires SMTP credentials) |

---

### TC-ALERT-004: Alert Settings UI
**Priority:** MEDIUM  
**Test Type:** UI

| Field | Details |
|-------|---------|
| **Test ID** | TC-ALERT-004 |
| **Description** | Verify alert settings modal works correctly |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Click alerts (🔔) button<br>2. Add email recipient<br>3. Adjust thresholds<br>4. Toggle triggers<br>5. Save settings |
| **Expected Result** | Modal functional, settings update, no errors |
| **Test Data** | test@test.com, threshold: 60 |
| **Actual Result** | ✅ PASS |

---

## 7. PDF Export Test Cases

### TC-PDF-001: Generate PDF Report
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-PDF-001 |
| **Description** | Verify PDF report generation works |
| **Pre-conditions** | Devices scanned, ReportLab installed |
| **Test Steps** | 1. POST to `/api/export/pdf`<br>2. Verify PDF file created<br>3. Check file size > 0<br>4. Open PDF to validate |
| **Expected Result** | PDF file created in reports/ directory, downloadable |
| **Test Data** | All current devices |
| **Actual Result** | ✅ PASS |

---

### TC-PDF-002: PDF Content Validation
**Priority:** HIGH  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-PDF-002 |
| **Description** | Verify PDF contains correct sections and data |
| **Pre-conditions** | PDF generated successfully |
| **Test Steps** | 1. Open generated PDF<br>2. Check executive summary<br>3. Verify statistics section<br>4. Check device details<br>5. Verify vulnerabilities<br>6. Check recommendations |
| **Expected Result** | All sections present with accurate data |
| **Test Data** | Generated PDF |
| **Actual Result** | ✅ PASS |

---

### TC-PDF-003: PDF Export UI
**Priority:** MEDIUM  
**Test Type:** UI

| Field | Details |
|-------|---------|
| **Test ID** | TC-PDF-003 |
| **Description** | Verify PDF export modal functionality |
| **Pre-conditions** | Dashboard with devices |
| **Test Steps** | 1. Click export (📄) button<br>2. Select devices<br>3. Toggle sections<br>4. Click Export<br>5. Verify download starts |
| **Expected Result** | Modal works, PDF downloads with selected options |
| **Test Data** | Selected devices: Camera 1, 3 |
| **Actual Result** | ✅ PASS |

---

### TC-PDF-004: PDF Error Handling
**Priority:** MEDIUM  
**Test Type:** Negative

| Field | Details |
|-------|---------|
| **Test ID** | TC-PDF-004 |
| **Description** | Verify PDF generation handles errors gracefully |
| **Pre-conditions** | No devices to export |
| **Test Steps** | 1. Try to export with no devices<br>2. Verify error message |
| **Expected Result** | Error message: "No devices to export" |
| **Test Data** | Empty device list |
| **Actual Result** | ✅ PASS |

---

## 8. Group Management Test Cases

### TC-GROUP-001: Create Camera Group
**Priority:** MEDIUM  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-GROUP-001 |
| **Description** | Verify camera group can be created |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. POST to `/api/groups`<br>2. Provide name, color<br>3. Verify group created |
| **Expected Result** | Status 200, group object returned with ID |
| **Test Data** | Name: "Office", Color: "#3b82f6" |
| **Actual Result** | ✅ PASS |

---

### TC-GROUP-002: Assign Cameras to Group
**Priority:** MEDIUM  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-GROUP-002 |
| **Description** | Verify cameras can be added to groups |
| **Pre-conditions** | Group exists, cameras available |
| **Test Steps** | 1. POST to `/api/groups/{id}/cameras`<br>2. Send camera IDs<br>3. Verify assignment |
| **Expected Result** | Cameras added to group |
| **Test Data** | Group: "Office", Cameras: Camera 1, 2 |
| **Actual Result** | ✅ PASS |

---

### TC-GROUP-003: Group Management UI
**Priority:** MEDIUM  
**Test Type:** UI

| Field | Details |
|-------|---------|
| **Test ID** | TC-GROUP-003 |
| **Description** | Verify group management modal works |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Click groups (📁) button<br>2. Create new group<br>3. Select color<br>4. Assign cameras<br>5. Save |
| **Expected Result** | Group created, cameras assigned, persisted |
| **Test Data** | Group: "Warehouse", Color: green |
| **Actual Result** | ✅ PASS |

---

### TC-GROUP-004: Delete Camera Group
**Priority:** MEDIUM  
**Test Type:** Functional

| Field | Details |
|-------|---------|
| **Test ID** | TC-GROUP-004 |
| **Description** | Verify group can be deleted |
| **Pre-conditions** | Group exists |
| **Test Steps** | 1. DELETE `/api/groups/{id}`<br>2. Verify deletion<br>3. Check cameras remain |
| **Expected Result** | Group deleted, cameras unaffected |
| **Test Data** | Existing group ID |
| **Actual Result** | ✅ PASS |

---

## Test Execution Summary

| Category | Total | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| Backend API | 6 | 6 | 0 | 0 |
| Network Scanner | 6 | 6 | 0 | 0 |
| Frontend UI | 6 | 6 | 0 | 0 |
| Integration | 3 | 3 | 0 | 0 |
| Manual Cameras | 7 | 7 | 0 | 0 |
| Alert System | 4 | 3 | 0 | 1 |
| PDF Export | 4 | 4 | 0 | 0 |
| Group Management | 4 | 4 | 0 | 0 |
| **TOTAL** | **40** | **39** | **0** | **1** |

**Pass Rate:** 97.5% (39/40)

---

**Document Version:** 1.0  
**Last Updated:** December 11, 2025  
**Test Execution Date:** December 11, 2025
