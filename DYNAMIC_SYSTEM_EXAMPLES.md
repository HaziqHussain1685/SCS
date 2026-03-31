# 📊 REAL-WORLD BEFORE/AFTER EXAMPLES

## How Dynamic System Fixes Hardcoding

---

## EXAMPLE 1: IP Camera with Open RTSP Port

### Scenario
- **Device:** Hikvision IP Camera
- **Target IP:** 192.168.1.100  
- **Open Ports:** 554 (RTSP), 80 (HTTP web interface), 22 (SSH)

### BEFORE (Hardcoded System)

```json
{
  "vulnerabilities": [
    {
      "id": "VULN_RTSP_001",
      "type": "RTSP_EXPOSURE",
      "severity": "HIGH",
      "severity_weight": 6,
      "cvss_score": 7.5,
      "title": "RTSP Stream Exposed Without Authentication",
      "description": "Port 554 (RTSP) is open and likely allows unauthenticated access to video streams. Real-Time Streaming Protocol is designed for media streaming and is commonly used by IP cameras. Without authentication, any attacker on the network can connect and view live video.",
      
      "remediation": [
        "1. Connect to camera admin interface (192.168.x.x:8089 or web port)",
        "2. Navigate to Settings → Streaming or Settings → RTSP Configuration",
        "3. Enable 'RTSP Authentication' or 'Require Login for RTSP'",
        "4. Set a strong password (min 12 chars: uppercase, lowercase, numbers, symbols)",
        "5. Configure firewall rules: restrict port 554 to trusted IPs only",
        "6. Consider disabling RTSP if not needed; use ONVIF/HTTP instead for control",
        "7. Enable encryption: RTSPS (RTSP over TLS) if supported",
        "8. Verify: Test with 'nc -zv {target_ip} 554' (should close connection)",
        "9. Document change and restart camera to apply settings"
      ],
      
      "related_cves": ["CVE-2021-42367", "CVE-2020-6889"],
      "attack_scenario": "An attacker on the same network runs: 'vlc rtsp://{target_ip}/stream1' and gains live access to camera footage..."
    },
    
    {
      "id": "VULN_HTTP_WEB_001", 
      "type": "HTTP_EXPOSURE",
      "severity": "HIGH",
      "title": "Unencrypted HTTP Web Panel",
      "description": "The web interface is served over HTTP (not HTTPS)...",
      "remediation": [
        "1. Connect to camera admin interface...",
        "2. Navigate to Settings → Security...",
        "3. Enable HTTPS..."
      ]
    }
  ]
}
```

### Problems ❌

1. **Same output for ALL cameras** - Regardless of model (Hikvision, Dahua, Axis)
2. **Generic recommendations** - "Navigate to Settings →..." assumes specific UI
3. **Hardcoded CVEs** - May not apply to this specific device model
4. **No severity escalation** - Both RTSP and HTTP at HIGH, but combo is CRITICAL
5. **Evidence-agnostic** - Doesn't show what was ACTUALLY found
6. **Not contextual** - Same text for cameras with/without SSH access

### AFTER (Dynamic System)

```json
{
  "vulnerabilities": [
    {
      "id": "VULN_RTSP_EXPOSURE_0",
      "rule_id": "VULN_RTSP_EXPOSURE",
      "severity": "CRITICAL",
      "severity_weight": 10,
      "cvss_score": 9.1,
      "title": "RTSP Stream Exposed on Port 554 (Unauthorized Video Access)",
      "description": "Port 554 (Real-Time Streaming Protocol) is open and accessible on device 192.168.1.100. This means video streams may be accessible without authentication. Any attacker on the network can potentially view live camera feeds in real-time.",
      
      "evidence": {
        "source": "nmap",
        "detected_ports": [554, 80, 22],
        "services": ["rtsp", "http", "ssh"],
        "scripts": {}
      },
      
      "ports": [554],
      "services": ["rtsp"],
      "detected_at": "192.168.1.100",
      "cves": [
        {"id": "CVE-2021-42367", "description": "RTSP authentication bypass"},
        {"id": "CVE-2020-6889", "description": "RTSP stream access vulnerability"}
      ],
      
      "related_cves": ["CVE-2021-42367", "CVE-2020-6889"]
    },
    
    {
      "id": "VULN_HTTP_WEB_PANEL_0",
      "rule_id": "VULN_HTTP_WEB_PANEL",
      "severity": "CRITICAL",
      "severity_weight": 10,
      "cvss_score": 8.8,
      "title": "Unencrypted HTTP Web Interface on Port 80",
      "description": "HTTP web interface detected on port 80. This is an unencrypted channel that transmits all data in plaintext, including credentials. Any attacker on the network can eavesdrop on communications and potentially steal credentials.",
      
      "evidence": {
        "detected_ports": [80],
        "services": ["http"]
      },
      
      "ports": [80],
      "services": ["http"],
      
      "NOTE": "Severity escalated to CRITICAL because port 554 (RTSP) is also exposed. Combined exposure allows full device compromise."
    }
  ],
  
  "recommendations": [
    {
      "type": "vulnerability_fix",
      "vulnerability_id": "VULN_RTSP_EXPOSURE_0",
      "title": "Fix RTSP Stream Exposure",
      "severity": "CRITICAL",
      "priority": "IMMEDIATE",
      "estimated_total_time": "1 hour",
      
      "quick_fix": {
        "description": "Get this done NOW (2 minutes)",
        "steps": [
          "Block port 554 to non-trusted IPs at firewall"
        ]
      },
      
      "immediate_actions": {
        "description": "Complete today (30 minutes)",
        "steps": [
          {
            "step": 1,
            "action": "FIREWALL BLOCK (Immediate, 2 mins)",
            "description": "Block port 554 to non-trusted IPs at firewall",
            "command": "firewall-cmd --add-rich-rule='rule family=ipv4 port protocol=tcp port=554 reject'",
            "benefit": "Prevents immediate exploitation"
          },
          {
            "step": 2,
            "action": "ACCESS CAMERA (15 mins)",
            "description": "Connect to camera web interface to configure RTSP authentication",
            "options": [
              "Try: https://192.168.1.100:8089 (common admin port)",
              "Try: http://192.168.1.100:80 (standard HTTP)",
              "Check camera model manual for default admin URL",
              "Default: admin/admin"
            ],
            "benefit": "Gain access to security settings"
          }
        ]
      },
      
      "short_term_remediation": {
        "steps": [
          {
            "step": 3,
            "action": "ENABLE RTSP AUTH (5 mins)",
            "options": [
              "Settings → Streaming → RTSP Authentication: Enable",
              "Settings → RTSP Configuration → Require Username/Password",
              "Network → RTSP → Authentication: ON",
              "Security → Stream Protection → Enable"
            ]
          }
        ]
      },
      
      "verification": [
        "Try: vlc rtsp://192.168.1.100/stream1",
        "Should prompt for username/password",
        "Should deny access with wrong credentials"
      ]
    }
  ]
}
```

### Advantages ✅

1. **Device-specific** - Includes actual IP address, specific ports
2. **Context-aware** - Shows what was found, escalates severity for combos
3. **Evidence-linked** - Every vulnerability tied to actual scan results
4. **Actionable** - Steps are specific and device-oriented
5. **Intelligent escalation** - RTSP + HTTP = CRITICAL (not just HIGH)
6. **Different for different devices** - Recommendations adapt
7. **Time estimates** - Tells user how long each step takes
8. **Verification** - Shows how to confirm fix worked

---

## EXAMPLE 2: Same Device, Different Configuration

### Scenario A: RTSP Only
```
Port 554: RTSP open
Port 80: Closed
Port 22: Closed
```

### BEFORE (Hardcoded)
```
Title: "RTSP Stream Exposed Without Authentication"
Severity: HIGH
Same output regardless of what else is open
```

### AFTER (Dynamic)
```
Title: "RTSP Stream Exposed on Port 554 (Unauthorized Video Access)"
Severity: HIGH  ← Context: only RTSP, no web panel
Evidence: {port 554 open, no HTTP service}
Recommendations: Focus on RTSP auth only
```

### Scenario B: Same Device, HTTP Also Added
```
Port 554: RTSP open
Port 80: HTTP open
Port 22: Closed
```

### BEFORE (Hardcoded)
```
Title: "RTSP Stream Exposed Without Authentication"
Severity: HIGH
Title: "Unencrypted HTTP Web Panel"
Severity: HIGH
= Same output as Scenario A (WRONG!)
```

### AFTER (Dynamic)
```
Title: "RTSP Stream Exposed on Port 554..."
Severity: CRITICAL  ← Escalated! (HTTP combo detected)
Title: "Unencrypted HTTP Web Interface on Port 80"
Severity: CRITICAL  ← Escalated! (RTSP combo detected)
Evidence: {port 554 + 80 detected}
Recommendations: Both RTSP auth AND HTTPS urgently required
```

---

## EXAMPLE 3: Device with Unknown Open Port

### Scenario
```
Device: Unknown IoT device
Port 9999: Unknown service
```

### BEFORE (Hardcoded)
```
Would ignore this port entirely
No vulnerability generated
Results: "No vulnerabilities found"
```

### AFTER (Dynamic)
```json
{
  "vulnerabilities": [
    {
      "id": "VULN_UNKNOWN_SERVICE",
      "rule_id": "VULN_PORT_EXPOSURE",
      "severity": "MEDIUM",
      "title": "Unknown Service Exposed on Port 9999",
      "description": "An unknown service is listening on port 9999. This could be a custom application, legacy service, or proprietary protocol.",
      "evidence": {
        "port": 9999,
        "service": "unknown"
      },
      "recommendation": [
        "1. Determine what service runs on port 9999",
        "2. Verify it's required for device function",
        "3. If not needed, disable the service",
        "4. If needed, identify the protocol and assess risk",
        "5. Implement firewall rules to limit access"
      ]
    }
  ]
}
```

**Key Difference:** Dynamic system finds vulnerabilities in UNKNOWN services, not just predefined ones. ✅

---

## EXAMPLE 4: Device with Many Open Ports

### Scenario
```
Ports: 21, 22, 23, 25, 53, 80, 110, 143, 161, 443, 445, 554, 631, 8080
Services: FTP, SSH, Telnet, SMTP, DNS, HTTP, POP3, IMAP, SNMP, HTTPS, SMB, RTSP, IPP, HTTP-alt
```

### BEFORE (Hardcoded)
```
Would generate specific vulnerability for each port
Result: 14 separate vulnerabilities
No meta-vulnerability for "excessive ports"
```

### AFTER (Dynamic)
```json
{
  "vulnerabilities": [
    {
      "id": "VULN_TELNET",
      "severity": "CRITICAL",
      "title": "Telnet Service Exposed"
    },
    {
      "id": "VULN_EXCESSIVE_PORTS_0",
      "rule_id": "VULN_EXCESSIVE_PORTS",
      "severity": "HIGH",
      "title": "Large Attack Surface (14 open ports)",
      "description": "Device has 14 open ports with services: ftp, ssh, telnet, smtp, dns, http, pop3, imap, snmp, https, smb, rtsp, ipp, http-alt. This large attack surface increases the likelihood of vulnerabilities and lateral movement opportunities.",
      "evidence": {
        "open_ports": [21, 22, 23, 25, 53, 80, 110, 143, 161, 443, 445, 554, 631, 8080],
        "services_found": 14
      },
      "recommendation": [
        "1. Audit services - list what's actually needed",
        "2. Disable FTP (use SSH instead)",
        "3. Disable Telnet (use SSH instead)",
        "4. Disable SMTP if not used",
        "5. Restrict DNS access to admin network",
        ...
      ]
    }
  ],
  
  "recommendations": [
    {
      "title": "Reduce Attack Surface",
      "priority": "URGENT",
      "approach": "Turn off unnecessary services",
      "recommended_keep": ["22 (SSH)", "443 (HTTPS)", "80 (HTTP redirect only)"],
      "recommended_remove": ["21 (FTP)", "23 (Telnet)", "25 (SMTP)", ...]
    }
  ]
}
```

**Key Difference:** Dynamic system identifies attack surface meta-issue that hardcoded rules miss. ✅

---

## EXAMPLE 5: Device with No Vulnerabilities

### Scenario
```
Ports closed: 23, 21, 80
Ports requiring auth: 22 (SSH), 443 (HTTPS)
```

### BEFORE (Hardcoded)
```
Report: "No vulnerabilities found"
(But doesn't explain what was checked or what's secure)
```

### AFTER (Dynamic)
```json
{
  "vulnerabilities": [],
  
  "status_message": "No Critical Vulnerabilities Detected",
  
  "security_posture": {
    "positive_findings": [
      "✅ SSH (port 22) is enabled - use for remote access instead of Telnet",
      "✅ HTTPS (port 443) is enabled - web interface encrypted",
      "✅ Telnet (port 23) is NOT exposed",
      "✅ FTP (port 21) is NOT exposed",
      "✅ HTTP (port 80) is NOT exposed"
    ],
    "ports_scanned": [21, 22, 23, 25, 53, 80, 110, 143, 161, 443, 445, 554],
    "ports_open": [22, 443],
    "ports_closed": ["21", "23", "25", "53", "80", "110", "143", "161", "445", "554"]
  },
  
  "recommendations": [
    "Continue monitoring device for future vulnerabilities",
    "Maintain regular security scans (monthly recommended)",
    "Keep firmware updated with latest security patches"
  ]
}
```

**Key Difference:** Dynamic system explains WHY there are no vulns (what was tested, what passed). ✅

---

## EXAMPLE 6: Telnet Port Open

### Scenario
```
Port 23: Telnet (CRITICAL)
Port 22: SSH
```

### BEFORE (Hardcoded)
```
Generic warning about Telnet
Same text for all devices
Generic remediation steps
```

### AFTER (Dynamic - More Contextual)
```json
{
  "vulnerability": {
    "severity": "CRITICAL",
    "title": "Telnet Service Exposed (Unencrypted Remote Access)",
    "priority": "IMMEDIATE",
    
    "quick_fix": {
      "description": "DO THIS RIGHT NOW (5 minutes)",
      "steps": [
        "BLOCK port 23 at firewall immediately",
        "This is full device control exposure"
      ]
    },
    
    "recommendation": {
      "title": "SSH is already available (good!)",
      "description": "SSH on port 22 is already running, so you can:",
      "instructions": [
        "1. Disable Telnet in device settings",
        "2. Use SSH for future remote access",
        "3. Note: Telnet allows credential interception - was it used?"
      ]
    },
    
    "forensics": {
      "question": "Was the Telnet port exposed to the network previously?",
      "if_yes": [
        "Assume attacker captured credentials over plaintext Telnet",
        "Change ALL device passwords immediately",
        "Review device logs for unauthorized access",
        "Check network for lateral movement signs"
      ],
      "if_no": [
        "Good - vulnerability contained",
        "Disable immediately and verify SSH access works"
      ]
    }
  }
}
```

**Key Difference:** Dynamic system leverages knowledge of SSH being available to provide smarter recommendations. ✅

---

## EXAMPLE 7: Different Device Types, Same Open Port

### Scenario A: IP Camera with Port 8080
```
Device: Hikvision Camera
Port 8080: HTTP-alt
Service: Web interface mirror
```

**Dynamic Recommendation:**
```bash
"For this camera, port 8080 typically mirrors the web interface.
Enable HTTPS on the primary web interface and disable port 8080.
Steps for Hikvision: Settings → Network → Port configuration → Disable 8080"
```

### Scenario B: NAS with Port 8080  
```
Device: Synology NAS
Port 8080: Alternate web interface
Service: DSM web panel
```

**Dynamic Recommendation:**
```bash
"For Synology NAS, port 8080 is DSM web interface.
You can optionally keep it for HTTP, but recommend using HTTPS.
Steps: Control Panel → Network → DSM HTTP/HTTPS settings"
```

### Scenario C: Unknown IoT with Port 8080
```
Device: Unknown brand IoT
Port 8080: Unknown HTTP service
Service: ?
```

**Dynamic Recommendation:**
```bash
"Unknown service on port 8080. 
Determine purpose first, then secure appropriately.
Generic steps: Check device documentation or connect to investigate"
```

**Key Difference:** Same port generates DIFFERENT recommendations based on device context. ✅

---

## Summary Table

| Aspect | BEFORE (Hardcoded) | AFTER (Dynamic) |
|--------|-------------------|-----------------|
| **Output Variation** | Same for all devices | Different per device |
| **Severity** | Fixed per vulnerability | Contextual based on combinations |
| **Evidence** | Generic text | Linked to actual scan data |
| **Recommendations** | Template-based | Contextually generated |
| **Unknown Services** | Ignored | Investigated |
| **Port Combinations** | No interaction | Intelligent escalation |
| **Device Type Awareness** | None | Adapted to context |
| **Actionability** | Medium (generic) | High (specific) |
| **Scalability** | Poor (code changes needed) | Excellent (rules-based) |
| **AI-Detection** | Easy to spot as fake | Hard to distinguish from real |

---

## Conclusion

The **dynamic system produces outputs that:**

✅ Look like they came from a real security tool
✅ Vary based on actual device configuration
✅ Provide evidence-based findings
✅ Scale to any device type
✅ Don't require code changes for new scenarios
✅ Adapt recommendations based on context
✅ Handle unknown ports and services
✅ Make intelligent severity decisions

**This is what a REAL vulnerability scanner does.** 🎯
