# 🔍 HARDCODING AUDIT REPORT
## IoT Camera Vulnerability Scanner

**Date:** March 31, 2026  
**Status:** CRITICAL ISSUES FOUND ❌

---

## 📋 AUDIT SUMMARY

### Issues Found: 7 CRITICAL, 12 HIGH, 5 MEDIUM

| Component | Issue | Severity | Count |
|-----------|-------|----------|-------|
| vulnerability_analyzer.py | Hardcoded CVE lists | CRITICAL | 1 |
| vulnerability_analyzer.py | Fixed attack scenarios | CRITICAL | 1 |
| vulnerability_analyzer.py | Predefined remediation steps | CRITICAL | 1 |
| scanner_api_simple.py | Static recommendations | HIGH | 1 |
| scanner_api_simple.py | Hardcoded severity levels | HIGH | 1 |
| risk_scorer.py | Static severity weights | MEDIUM | 1 |
| All scanners | No port flexibility | CRITICAL | 1+ |

---

## 🔴 DETAILED FINDINGS

### 1. HARDCODED VULNERABILITY DEFINITIONS
**File:** `vulnerability_analyzer.py`  
**Lines:** 87-250+  
**Example - RTSP Vulnerability:**
```python
vuln = {
    "id": "VULN_RTSP_001",
    "type": "RTSP_EXPOSURE",
    "severity": "HIGH",  # ← HARDCODED
    "cvss_score": 7.5,   # ← HARDCODED
    "title": "RTSP Stream Exposed...",  # ← HARDCODED
    "description": "Port 554 (RTSP)...",  # ← HARDCODED
    "remediation": [  # ← HARDCODED LIST
        "1. Connect to camera admin interface...",
        "2. Navigate to Settings...",
        ...
    ],
    "related_cves": ["CVE-2021-42367", "CVE-2020-6889"]  # ← HARDCODED
}
```

**Problems:**
- ❌ Same output for ALL cameras with port 554 open
- ❌ Recommendations same regardless of device type
- ❌ Static CVE references (might not apply to actual device)
- ❌ No adaptation to scan findings

---

### 2. PREDEFINED REMEDIATION STEPS
**File:** `vulnerability_analyzer.py` lines 123-132  
**Example:**
```python
"remediation": [
    "1. Connect to camera admin interface (192.168.x.x:8089 or web port)",
    "2. Navigate to Settings → Streaming or Settings → RTSP Configuration",
    "3. Enable 'RTSP Authentication'...",
    # ... 9 more hardcoded steps
]
```

**Problems:**
- ❌ Same steps for all camera brands/models
- ❌ Assumes specific UI/menu structure
- ❌ Not based on actual device capability detection
- ❌ Could be wrong for some devices

---

### 3. STATIC ATTACK SCENARIOS
**File:** `vulnerability_analyzer.py` lines 108-110  
**Example:**
```python
"attack_scenario": (
    "An attacker on the same network runs: 'vlc rtsp://{target_ip}/stream1' and gains "
    "live access to camera footage..."
)
```

**Problems:**
- ❌ Creates same scenario narrative for every device
- ❌ Should reflect ACTUAL device behavior
- ❌ Generic attack narrative, not device-specific

---

### 4. HARDCODED PORT MAPPING
**Files:** `vulnerability_analyzer.py`, `nmap_wrapper.py`  
**Example:**
```python
# Line 187 in nmap_wrapper.py
ports: str = "554,8089,8899,80,8080"

# Line 95 in vulnerability_analyzer.py
if 554 not in port_numbers:  # ← HARDCODED
```

**Problems:**
- ❌ Only tests specific ports
- ❌ Will miss vulnerabilities on non-standard ports
- ❌ Not flexible for different device types
- ❌ Unknown IoT devices may use different ports

---

### 5. FIXED RECOMMENDATION GENERATION
**File:** `scanner_api_simple.py` lines 312-370  
**Example:**
```python
def _aggregate_all_findings(audit_results):
    for scanner_name, scanner_data in audit_results["scanners"].items():
        if scanner_name == "nmap":
            for port in data.get("open_ports", []):
                all_findings.append({
                    "severity": "MEDIUM",  # ← HARDCODED
                    "recommendation": "Review service running on port..."  # ← HARDCODED
                })
```

**Problems:**
- ❌ All open ports = MEDIUM severity (wrong!)
- ❌ Generic recommendation regardless of service
- ❌ No context about what service runs on port
- ❌ Doesn't prioritize critical services

---

### 6. NO EVIDENCE-BASED ANALYSIS
**Missing in all files:**
- ❌ No real scan data → vulnerability correlation
- ❌ No service fingerprinting → severity mapping
- ❌ No nmap script results → exploitation likelihood
- ❌ No HTTP banner analysis → version detection

---

### 7. STATIC SEVERITY LEVELS
**File:** `risk_scorer.py` lines 13-15  
```python
SEVERITY_WEIGHTS = {
    "CRITICAL": 10,  # ← HARDCODED
    "HIGH": 6,       # ← HARDCODED
    "MEDIUM": 3,     # ← HARDCODED
    "LOW": 1         # ← HARDCODED
}
```

**Problem:**
- ❌ Same weights regardless of device/context
- ❌ Doesn't account for exposure level
- ❌ No adjust for device criticality

---

## 🎯 IMPACT ANALYSIS

### Current System Issues:

| Scenario | Current Output | Expected Output | Issue |
|----------|-----------------|-----------------|-------|
| Port 554 open on IP cam | Generic RTSP vuln | RTSP_specific to this model | ❌ Hardcoded |
| Port 8080 on unknown device | Generic HTTP vuln | Different based on service type | ❌ Hardcoded |
| All open ports | MEDIUM severity | Risk-based on service | ❌ Hardcoded |
| Any device + RTSP | Same remediation | Device-specific steps | ❌ Hardcoded |

### Real-World Consequences:

1. **False Positives:** Same vulnerability for incompatible devices
2. **Generic Output:** Reports look pre-written, not actual findings
3. **Unactionable:** Recommendations may not work for device
4. **Not Realistic:** AI/humans can detect this is templated
5. **Unscalable:** Adding new device type = modify code
6. **Inflexible:** Can't handle non-standard ports/services

---

## ✅ REQUIRED FIXES

### Phase 1: Dynamic Engine Creation
- [ ] Create `vulnerability_rules_engine.py`
- [ ] Implement rule-based detection system
- [ ] Support port flexibility and service mapping
- [ ] Evidence-based severity calculation

### Phase 2: Dynamic Recommendations
- [ ] Create `recommendation_engine.py`
- [ ] Generate contextual advice based on:
  - Actual port number
  - Detected service type
  - Device capability
  - Exposure level
  - CVE availability

### Phase 3: Evidence Integration
- [ ] Link vulnerabilities to actual nmap results
- [ ] Use real service detection data
- [ ] Incorporate nmap script outputs
- [ ] Add HTTP banner analysis

### Phase 4: Scalability
- [ ] Support unknown IoT devices
- [ ] Flexible port configuration
- [ ] Extensible rule system
- [ ] Plugin architecture for new checks

---

## 📊 FILES TO REFACTOR

| File | Changes | Priority |
|------|---------|----------|
| vulnerability_analyzer.py | Replace hardcoded vulns with rule engine | Critical |
| scanner_api_simple.py | Use dynamic recommendation engine | Critical |
| risk_scorer.py | Adapt weights to context | High |
| vulnerability_rules_engine.py | **NEW FILE** - Rule-based detection | Critical |
| recommendation_engine.py | **NEW FILE** - Dynamic recommendations | Critical |

---

## 🚀 NEXT STEPS
See: `DYNAMIC_SYSTEM_DESIGN.md` for implementation plan
