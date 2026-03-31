#!/usr/bin/env python3
"""
Smart Camera Scanner API - IMPROVED ORCHESTRATOR
Provides REST endpoints for nmap port scanning with enhanced camera detection and vulnerability analysis
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from scanner_main import ScannerOrchestrator
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

# Store scan history
HISTORY_FILE = "scan_history.json"

def load_history():
    """Load scan history from file"""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_history(history):
    """Save scan history to file"""
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def load_onvif_history():
    """Load ONVIF scan history from file"""
    if os.path.exists(ONVIF_HISTORY_FILE):
        try:
            with open(ONVIF_HISTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_onvif_history(history):
    """Save ONVIF scan history to file"""
    with open(ONVIF_HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def load_discovery_history():
    """Load WS-Discovery history from file"""
    if os.path.exists(DISCOVERY_HISTORY_FILE):
        try:
            with open(DISCOVERY_HISTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_discovery_history(history):
    """Save WS-Discovery history to file"""
    with open(DISCOVERY_HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

# ============== API ENDPOINTS ==============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "message": "Smart Camera Scanner API is running",
        "timestamp": datetime.now().isoformat()
    })

# ============== COMPREHENSIVE NMAP-BASED PROFESSIONAL AUDIT ==============

@app.route('/api/scan/comprehensive', methods=['POST'])
def comprehensive_scan():
    """
    Run complete IoT device security audit with all 8 scanners.
    Includes: nmap, ONVIF, iotnet, telnetshell, netflows, chipsec, ffind, picocom
    Returns: Complete report with all findings, professional recommendations, and risk assessment
    """
    try:
        data = request.get_json()
        target_ip = data.get('target', '192.168.18.234')
        
        print(f"\n{'='*80}")
        print(f">>> COMPREHENSIVE SECURITY AUDIT STARTED: {target_ip}")
        print(f"{'='*80}")
        print("Running 8 security scanners in sequence...")
        
        start_time = datetime.now()
        audit_results = {
            "target_ip": target_ip,
            "timestamp": datetime.now().isoformat(),
            "scan_type": "COMPREHENSIVE_IOT_SECURITY_AUDIT",
            "status": "IN_PROGRESS",
            "scanners": {},
            "summary": {
                "total_scanners": 8,
                "scanners_completed": 0,
                "vulnerabilities_found": 0,
                "critical_issues": 0,
                "high_issues": 0,
                "medium_issues": 0
            },
            "overall_risk_score": 0,
            "overall_risk_level": "UNKNOWN",
            "all_findings": [],
            "recommendations": [],
            "device_profile": {}
        }
        
        # ===== SCANNER 1: NMAP (Port Scanning) =====
        print("\n[1/8] Running NMAP port scanner...")
        try:
            nmap_scanner = NmapScanner()
            nmap_results = nmap_scanner.scan(target_ip)
            audit_results["scanners"]["nmap"] = {
                "status": "completed",
                "data": nmap_results,
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ NMAP scan complete")
        except Exception as e:
            audit_results["scanners"]["nmap"] = {"status": "failed", "error": str(e)}
            print(f"✗ NMAP scan failed: {str(e)}")
        
        # ===== SCANNER 2: ONVIF (Camera Protocol) =====
        print("\n[2/8] Running ONVIF security scanner...")
        try:
            onvif_scanner = ONVIFScanner()
            onvif_results = onvif_scanner.scan(target_ip)
            audit_results["scanners"]["onvif"] = {
                "status": "completed",
                "data": onvif_results,
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ ONVIF scan complete")
        except Exception as e:
            audit_results["scanners"]["onvif"] = {"status": "failed", "error": str(e)}
            print(f"✗ ONVIF scan failed: {str(e)}")
        
        # ===== SCANNER 3: IoTNet (Network Traffic Analysis) =====
        print("\n[3/8] Running IoT network traffic analyzer...")
        try:
            iotnet_result = iotnet_scanner.analyze_traffic(target_ip)
            audit_results["scanners"]["iotnet"] = {
                "status": "completed",
                "data": iotnet_result.get("data", {}),
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ IoTNet scan complete")
        except Exception as e:
            audit_results["scanners"]["iotnet"] = {"status": "failed", "error": str(e)}
            print(f"✗ IoTNet scan failed: {str(e)}")
        
        # ===== SCANNER 4: TelnetShell (Telnet Enumeration) =====
        print("\n[4/8] Running telnet shell enumeration...")
        try:
            telnet_result = telnetshell_scanner.scan_telnet(target_ip)
            audit_results["scanners"]["telnetshell"] = {
                "status": "completed",
                "data": telnet_result.get("data", {}),
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ Telnetshell scan complete")
        except Exception as e:
            audit_results["scanners"]["telnetshell"] = {"status": "failed", "error": str(e)}
            print(f"✗ Telnetshell scan failed: {str(e)}")
        
        # ===== SCANNER 5: NetFlows (Network Flow Analysis) =====
        print("\n[5/8] Running network flow analyzer...")
        try:
            netflows_result = netflows_scanner.analyze_flows(target_ip)
            audit_results["scanners"]["netflows"] = {
                "status": "completed",
                "data": netflows_result.get("data", {}),
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ Netflows scan complete")
        except Exception as e:
            audit_results["scanners"]["netflows"] = {"status": "failed", "error": str(e)}
            print(f"✗ Netflows scan failed: {str(e)}")
        
        # ===== SCANNER 6: ChipSec (Firmware Security) =====
        print("\n[6/8] Running UEFI/BIOS firmware analyzer...")
        try:
            chipsec_result = chipsec_scanner.analyze_firmware(target_ip)
            audit_results["scanners"]["chipsec"] = {
                "status": "completed",
                "data": chipsec_result.get("data", {}),
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ ChipSec scan complete")
        except Exception as e:
            audit_results["scanners"]["chipsec"] = {"status": "failed", "error": str(e)}
            print(f"✗ ChipSec scan failed: {str(e)}")
        
        # ===== SCANNER 7: FFind (Firmware Extraction) =====
        print("\n[7/8] Running firmware extraction analyzer...")
        try:
            ffind_result = ffind_scanner.extract_firmware(target_ip)
            audit_results["scanners"]["ffind"] = {
                "status": "completed",
                "data": ffind_result.get("data", {}),
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ FFind scan complete")
        except Exception as e:
            audit_results["scanners"]["ffind"] = {"status": "failed", "error": str(e)}
            print(f"✗ FFind scan failed: {str(e)}")
        
        # ===== SCANNER 8: PicoCom (Serial Console) =====
        print("\n[8/8] Running UART serial console analyzer...")
        try:
            picocom_result = picocom_scanner.scan_serial_access(target_ip)
            audit_results["scanners"]["picocom"] = {
                "status": "completed",
                "data": picocom_result.get("data", {}),
                "timestamp": datetime.now().isoformat()
            }
            audit_results["summary"]["scanners_completed"] += 1
            print("✓ PicoCom scan complete")
        except Exception as e:
            audit_results["scanners"]["picocom"] = {"status": "failed", "error": str(e)}
            print(f"✗ PicoCom scan failed: {str(e)}")
        
        # ===== AGGREGATE FINDINGS AND GENERATE PROFESSIONAL RECOMMENDATIONS =====
        print("\n" + "="*80)
        print("Aggregating results and generating recommendations...")
        print("="*80)
        
        all_findings = _aggregate_all_findings(audit_results)
        audit_results["all_findings"] = all_findings
        audit_results["summary"]["vulnerabilities_found"] = len(all_findings)
        
        # Count severity levels
        for finding in all_findings:
            severity = finding.get("severity", "MEDIUM")
            if severity == "CRITICAL":
                audit_results["summary"]["critical_issues"] += 1
            elif severity == "HIGH":
                audit_results["summary"]["high_issues"] += 1
            elif severity == "MEDIUM":
                audit_results["summary"]["medium_issues"] += 1
        
        # Generate intelligent recommendations
        recommendations = _generate_professional_recommendations(all_findings, audit_results)
        audit_results["recommendations"] = recommendations
        
        # Calculate overall risk score
        risk_score = _calculate_overall_risk(audit_results)
        audit_results["overall_risk_score"] = risk_score
        audit_results["overall_risk_level"] = _get_risk_level(risk_score)
        
        # Set device profile from nmap data
        if "nmap" in audit_results["scanners"] and audit_results["scanners"]["nmap"].get("data"):
            nmap_data = audit_results["scanners"]["nmap"]["data"]
            audit_results["device_profile"] = {
                "target_ip": target_ip,
                "status": nmap_data.get("status", "unknown"),
                "open_ports": nmap_data.get("open_ports", []),
                "services_detected": len(nmap_data.get("open_ports", [])),
                "scan_time": nmap_data.get("scan_time")
            }
        
        # Mark as complete
        audit_results["status"] = "COMPLETED"
        scan_duration = (datetime.now() - start_time).total_seconds()
        audit_results["scan_duration_seconds"] = scan_duration
        
        print(f"\n{'='*80}")
        print(f"AUDIT COMPLETE in {scan_duration:.2f} seconds")
        print(f"Risk Level: {audit_results['overall_risk_level']} ({audit_results['overall_risk_score']:.1f}/10)")
        print(f"Issues Found: {audit_results['summary']['vulnerabilities_found']}")
        print(f"  - Critical: {audit_results['summary']['critical_issues']}")
        print(f"  - High: {audit_results['summary']['high_issues']}")
        print(f"  - Medium: {audit_results['summary']['medium_issues']}")
        print(f"{'='*80}\n")
        
        # Save to history
        history = load_history()
        history.append(audit_results)
        save_history(history)
        
        return jsonify({
            "success": True,
            "data": audit_results
        })
        
    except Exception as e:
        print(f"✗ COMPREHENSIVE SCAN FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500


def _aggregate_all_findings(audit_results):
    """Extract and aggregate all findings from all 8 scanners"""
    all_findings = []
    
    for scanner_name, scanner_data in audit_results["scanners"].items():
        if scanner_data.get("status") != "completed":
            continue
        
        data = scanner_data.get("data", {})
        
        # Extract findings based on scanner type
        if scanner_name == "nmap":
            # Extract open ports as findings
            for port in data.get("open_ports", []):
                all_findings.append({
                    "scanner": "NMAP",
                    "type": "OPEN_PORT",
                    "severity": "MEDIUM",
                    "description": f"Open port detected: {port}",
                    "details": port,
                    "recommendation": "Review service running on port and apply security patches"
                })
        
        elif scanner_name == "telnetshell":
            if data.get("open_shell"):
                all_findings.append({
                    "scanner": "TELNETSHELL",
                    "type": "WEAK_CREDENTIALS",
                    "severity": "CRITICAL",
                    "description": "Telnet service with weak/default credentials found",
                    "details": data.get("weak_credentials", []),
                    "recommendation": "IMMEDIATE: Disable Telnet or enforce SSH with complex passwords"
                })
            if data.get("telnet_accessible"):
                all_findings.append({
                    "scanner": "TELNETSHELL",
                    "type": "INSECURE_PROTOCOL",
                    "severity": "HIGH",
                    "description": "Telnet service running (unencrypted)",
                    "details": "Telnet protocol transmits credentials in plaintext",
                    "recommendation": "Replace Telnet with SSH (port 22) for secure remote access"
                })
        
        elif scanner_name == "picocom":
            if data.get("uart_accessible"):
                all_findings.append({
                    "scanner": "PICOCOM",
                    "type": "SERIAL_ACCESS",
                    "severity": "CRITICAL",
                    "description": "Unauthenticated UART/Serial console access",
                    "details": data.get("serial_ports_found", []),
                    "recommendation": "CRITICAL: Disable or password-protect serial console access immediately"
                })
        
        elif scanner_name == "chipsec":
            for vuln in data.get("vulnerabilities", []):
                all_findings.append({
                    "scanner": "CHIPSEC",
                    "type": "FIRMWARE_CVE",
                    "severity": vuln.get("severity", "MEDIUM"),
                    "cve_id": vuln.get("cve_id"),
                    "description": vuln.get("title"),
                    "details": vuln.get("description"),
                    "recommendation": vuln.get("remediation", "Check vendor security bulletins")
                })
        
        elif scanner_name == "ffind":
            for vuln in data.get("vulnerabilities", []):
                all_findings.append({
                    "scanner": "FFIND",
                    "type": "FIRMWARE_ISSUE",
                    "severity": vuln.get("severity", "MEDIUM"),
                    "description": vuln.get("type"),
                    "details": vuln.get("details"),
                    "location": vuln.get("location"),
                    "recommendation": vuln.get("remediation", "Review and patch firmware")
                })
        
        elif scanner_name == "iotnet":
            for anomaly in data.get("anomalies", []):
                severity = "HIGH" if anomaly.get("severity") == "HIGH" else "MEDIUM"
                all_findings.append({
                    "scanner": "IOTNET",
                    "type": "NETWORK_ANOMALY",
                    "severity": severity,
                    "description": anomaly.get("description"),
                    "details": anomaly.get("type"),
                    "recommendation": "Monitor traffic patterns and investigate suspicious connections"
                })
    
    return all_findings


def _generate_professional_recommendations(findings, audit_results):
    """Generate intelligent, professional recommendations based on findings"""
    recommendations = []
    
    if audit_results["summary"]["critical_issues"] > 0:
        recommendations.append({
            "priority": "CRITICAL",
            "title": "IMMEDIATE ACTION REQUIRED",
            "description": f"Found {audit_results['summary']['critical_issues']} critical security issues that require immediate attention",
            "actions": [
                "Review all CRITICAL findings below",
                "Disable or isolate affected device if production impact acceptable",
                "Apply security patches from vendor",
                "Re-scan after remediation"
            ]
        })
    
    # Telnet recommendations
    telnet_findings = [f for f in findings if f.get("scanner") == "TELNETSHELL"]
    if telnet_findings:
        recommendations.append({
            "priority": "CRITICAL",
            "category": "Remote Access Security",
            "title": "Unsecured Telnet Access Detected",
            "findings_count": len(telnet_findings),
            "description": "Device is accessible via Telnet with weak or default credentials",
            "technical_details": {
                "protocol": "Telnet (Port 23)",
                "security_level": "None",
                "threat": "Attacker can gain unauthorized shell access with full device control"
            },
            "remediation_steps": [
                "1. Immediately generate complex password (16+ chars, mixed case, numbers, symbols)",
                "2. Change admin password to generated password",
                "3. Disable Telnet service entirely",
                "4. Enable SSH (port 22) with key-based authentication",
                "5. Configure firewall to block port 23 (Telnet)",
                "6. Update all documentation with new SSH access method"
            ],
            "verification": "nmap -sV -p 23 <target_ip> (should show 'closed' or 'filtered')",
            "estimated_effort": "15-30 minutes"
        })
    
    # Serial access recommendations
    serial_findings = [f for f in findings if f.get("scanner") == "PICOCOM"]
    if serial_findings:
        recommendations.append({
            "priority": "CRITICAL",
            "category": "Physical Security",
            "title": "Unauthenticated Serial Console Access",
            "findings_count": len(serial_findings),
            "description": "Device has unprotected UART/Serial console accessible to anyone with physical access",
            "technical_details": {
                "interface": "UART/Serial",
                "authentication": "None",
                "privilege_level": "Root/Administrative",
                "threat": "Physical attacker can modify firmware, install rootkits, steal credentials"
            },
            "remediation_steps": [
                "Option A (Disable):",
                "  1. Boot device into bootloader mode",
                "  2. Disable serial console: setenv bootargs ... console=none",
                "  3. Apply changes and reboot",
                "",
                "Option B (Protect):",
                "  1. Implement bootloader password protection",
                "  2. Require PIN code for serial access",
                "  3. Monitor serial port for accesses",
                "",
                "Option C (Physical):",
                "  1. Remove/disable UART pins on PCB",
                "  2. Lock device in tamper-evident case",
                "  3. Add physical monitoring"
            ],
            "estimated_effort": "30 minutes to 2 hours (depending on option)"
        })
    
    # Firmware CVE recommendations
    firmware_findings = [f for f in findings if f.get("scanner") == "CHIPSEC" and f.get("type") == "FIRMWARE_CVE"]
    if firmware_findings:
        for finding in firmware_findings[:3]:  # Top 3 CVEs
            recommendations.append({
                "priority": finding.get("severity", "HIGH"),
                "category": "Firmware Security",
                "title": f"Firmware Vulnerability ({finding.get('cve_id', 'Unknown')})",
                "description": finding.get("description"),
                "cve_id": finding.get("cve_id"),
                "threat": finding.get("details"),
                "remediation": finding.get("recommendation"),
                "source": "NIST CVE Database",
                "estimated_effort": "1-3 hours (involves BIOS update)"
            })
    
    # Network anomaly recommendations
    network_findings = [f for f in findings if f.get("scanner") == "IOTNET"]
    if network_findings:
        recommendations.append({
            "priority": "HIGH",
            "category": "Network Security",
            "title": "Suspicious Network Behavior Detected",
            "findings_count": len(network_findings),
            "description": "Device communication patterns show anomalies or potential data exfiltration",
            "investigation_steps": [
                "1. Enable network flow logging on gateway/firewall",
                "2. Monitor destination IPs and domains for 24 hours",
                "3. Use DNS sinkhole to block suspicious domains",
                "4. Analyze data transfer patterns (size, frequency, timing)",
                "5. Correlate with business requirements (expected traffic)"
            ],
            "preventive_measures": [
                "Whitelist only required external IPs/domains",
                "Implement network segmentation (VLAN)",
                "Enable DLP (Data Loss Prevention) rules",
                "Monitor with IDS/IPS for suspicious patterns"
            ]
        })
    
    # Add general security hardening recommendations
    if audit_results["overall_risk_level"] in ["CRITICAL", "HIGH"]:
        recommendations.append({
            "priority": "HIGH",
            "category": "Security Hardening",
            "title": "General Security Hardening Recommendations",
            "description": "Apply these best practices to improve overall device security",
            "actions": [
                "1. Regular Security Updates: Enable automatic firmware updates",
                "2. Access Control: Implement principle of least privilege",
                "3. Monitoring: Enable audit logging for all administrative actions",
                "4. Network Segmentation: Isolate camera on separate VLAN",
                "5. Encryption: Use HTTPS/TLS for all communications",
                "6. Authentication: Enforce strong passwords (16+ characters)",
                "7. Firewall Rules: Restrict access to necessary ports only",
                "8. Regular Scans: Re-run security audit monthly"
            ]
        })
    
    return recommendations


def _calculate_overall_risk(audit_results):
    """Calculate overall risk score (0-10)"""
    score = 0
    
    # Critical issues: +3 points each
    score += min(audit_results["summary"]["critical_issues"] * 3, 6)
    
    # High issues: +1.5 points each
    score += min(audit_results["summary"]["high_issues"] * 1.5, 2)
    
    # Medium issues: +0.5 points each
    score += min(audit_results["summary"]["medium_issues"] * 0.5, 1)
    
    # Scanner failures: +0.5 per failure
    scanner_failures = sum(1 for s in audit_results["scanners"].values() if s.get("status") == "failed")
    score += min(scanner_failures * 0.5, 1)
    
    return min(score, 10)


def _get_risk_level(score):
    """Convert numeric risk score to risk level"""
    if score >= 9:
        return "CRITICAL"
    elif score >= 7:
        return "HIGH"
    elif score >= 4:
        return "MEDIUM"
    elif score >= 1:
        return "LOW"
    else:
        return "MINIMAL"

@app.route('/api/scan/nmap', methods=['POST'])
def scan_camera():
    """Run improved nmap scan on target camera with full analysis"""
    try:
        # Get target IP from request
        data = request.get_json()
        target_ip = data.get('target', '192.168.18.234')
        full_scan = data.get('full_scan', False)  # Optional: enable extended scanning
        
        print(f"\n{'='*60}")
        print(f">>> Starting scan on {target_ip}")
        print(f">>> Full Scan: {full_scan}")
        print(f"{'='*60}")
        
        # Run improved scan using ScannerOrchestrator
        orchestrator = ScannerOrchestrator(target_ip)
        results = orchestrator.scan(full_scan=full_scan)
        
        if results is None or 'error' in results:
            error_msg = results.get('error', 'Unknown scan error') if results else 'Scan failed'
            print(f"❌ Scan failed: {error_msg}")
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Print summary
        print(f"\n✓ Scan completed successfully")
        print(f"  • Open ports: {results.get('open_ports_count', 0)}")
        print(f"  • Vulnerabilities: {results.get('vulnerabilities_count', 0)}")
        print(f"  • Risk level: {results.get('risk_level', 'UNKNOWN')}")
        print(f"  • Risk score: {results.get('risk_score', 0):.1f}/10")
        print(f"  • Duration: {results.get('scan_duration', 0):.1f}s")
        
        # Save to history
        history = load_history()
        history.append(results)
        save_history(history)
        
        return jsonify({
            "success": True,
            "data": results
        })
        
    except Exception as e:
        print(f"❌ API Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/history', methods=['GET'])
def get_history():
    """Get scan history"""
    try:
        history = load_history()
        return jsonify({
            "success": True,
            "scans": history,
            "total": len(history)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/latest', methods=['GET'])
def get_latest_scan():
    """Get most recent scan"""
    try:
        history = load_history()
        if history:
            return jsonify({
                "success": True,
                "data": history[-1]
            })
        else:
            return jsonify({
                "success": False,
                "error": "No previous scans found"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/clear', methods=['DELETE'])
def clear_history():
    """Clear scan history"""
    try:
        save_history([])
        return jsonify({
            "success": True,
            "message": "Scan history cleared"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== ONVIF SCANNING ENDPOINTS ==============

@app.route('/api/scan/onvif', methods=['POST'])
def scan_onvif():
    """Run ONVIF security scan on target camera"""
    try:
        # Get target IP from request
        data = request.get_json()
        target_ip = data.get('target', '192.168.18.234')
        
        print(f"\n--- Starting ONVIF scan on {target_ip} ---")
        
        # Run ONVIF scan
        scanner = ONVIFScanner(target_ip)
        results = scanner.scan()
        
        print(f"ONVIF Scan completed successfully")
        print(f"ONVIF Service Found: {results.get('onvif_service_found')}")
        print(f"Vulnerabilities: {len(results.get('vulnerabilities', []))}")
        print(f"Health Score: {results.get('health_score', 0)}/100")
        
        # Save to ONVIF history
        onvif_history = load_onvif_history()
        onvif_history.append(results)
        save_onvif_history(onvif_history)
        
        return jsonify({
            "success": True,
            "data": results
        })
        
    except Exception as e:
        print(f"ONVIF API Error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/onvif/latest', methods=['GET'])
def get_latest_onvif_scan():
    """Get most recent ONVIF scan"""
    try:
        onvif_history = load_onvif_history()
        if onvif_history:
            return jsonify({
                "success": True,
                "data": onvif_history[-1]
            })
        else:
            return jsonify({
                "success": False,
                "error": "No previous ONVIF scans found"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/onvif/history', methods=['GET'])
def get_onvif_history():
    """Get ONVIF scan history"""
    try:
        onvif_history = load_onvif_history()
        return jsonify({
            "success": True,
            "scans": onvif_history,
            "total": len(onvif_history)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== ALERT SETTINGS ENDPOINTS ==============

@app.route('/api/alert-settings', methods=['GET'])
def get_alert_settings():
    """Get saved alert settings"""
    try:
        settings_file = 'alert_settings.json'
        if os.path.exists(settings_file):
            with open(settings_file, 'r') as f:
                settings = json.load(f)
                return jsonify({
                    "success": True,
                    "data": settings
                })
        else:
            # Return default settings
            default_settings = {
                "emailAlerts": False,
                "emailAddress": "",
                "alertOnCritical": True,
                "alertOnHigh": True,
                "alertOnMedium": False,
                "smsAlerts": False,
                "phoneNumber": "",
                "slackWebhook": "",
                "slackAlerts": False
            }
            return jsonify({
                "success": True,
                "data": default_settings
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/alert-settings', methods=['POST'])
def save_alert_settings():
    """Save alert settings"""
    try:
        data = request.get_json()
        settings_file = 'alert_settings.json'
        
        with open(settings_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Alert settings saved"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== CAMERA GROUPS ENDPOINTS ==============

@app.route('/api/groups', methods=['GET'])
def get_groups():
    """Get all camera groups"""
    try:
        groups_file = 'camera_groups.json'
        if os.path.exists(groups_file):
            with open(groups_file, 'r') as f:
                groups = json.load(f)
                return jsonify({
                    "success": True,
                    "data": groups
                })
        else:
            return jsonify({
                "success": True,
                "data": []
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/groups', methods=['POST'])
def create_group():
    """Create a new camera group"""
    try:
        data = request.get_json()
        groups_file = 'camera_groups.json'
        
        if os.path.exists(groups_file):
            with open(groups_file, 'r') as f:
                groups = json.load(f)
        else:
            groups = []
        
        # Add new group
        new_group = {
            "id": data.get('id', f"group-{len(groups) + 1}"),
            "name": data.get('name', 'New Group'),
            "description": data.get('description', ''),
            "cameras": data.get('cameras', []),
            "created_at": datetime.now().isoformat()
        }
        groups.append(new_group)
        
        with open(groups_file, 'w') as f:
            json.dump(groups, f, indent=2)
        
        return jsonify({
            "success": True,
            "data": new_group,
            "message": "Group created successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/groups/<group_id>', methods=['PUT'])
def update_group(group_id):
    """Update a camera group"""
    try:
        data = request.get_json()
        groups_file = 'camera_groups.json'
        
        if os.path.exists(groups_file):
            with open(groups_file, 'r') as f:
                groups = json.load(f)
        else:
            groups = []
        
        # Find and update group
        for group in groups:
            if group.get('id') == group_id:
                group.update(data)
                group['updated_at'] = datetime.now().isoformat()
                break
        
        with open(groups_file, 'w') as f:
            json.dump(groups, f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Group updated successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/groups/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    """Delete a camera group"""
    try:
        groups_file = 'camera_groups.json'
        
        if os.path.exists(groups_file):
            with open(groups_file, 'r') as f:
                groups = json.load(f)
        else:
            groups = []
        
        # Remove group
        groups = [g for g in groups if g.get('id') != group_id]
        
        with open(groups_file, 'w') as f:
            json.dump(groups, f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Group deleted successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== PDF EXPORT ENDPOINT ==============

@app.route('/api/export/pdf', methods=['POST'])
def export_pdf():
    """Generate and export PDF report"""
    try:
        from io import BytesIO
        
        data = request.get_json()
        
        # For now, return a simple text-based response
        # In production, you would use reportlab or similar
        report_content = f"""
SMART CAMERA SECURITY REPORT
==============================

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Target: {data.get('target_ip', 'N/A')}
Health Score: {data.get('health_score', 0)}/100
Risk Level: {data.get('risk_level', 'UNKNOWN')}

VULNERABILITIES:
{chr(10).join([f"- {v.get('name', 'Unknown')}: {v.get('risk', 'Unknown')} severity" for v in data.get('vulnerabilities', [])])}

RECOMMENDATIONS:
{chr(10).join(data.get('recommendations', ['No recommendations available']))}

Generated by Smart Camera Scanner
"""
        
        # Return as file download
        return {
            "success": True,
            "data": report_content,
            "filename": f"security_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        }
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== WS-DISCOVERY NETWORK SCANNING ==============

@app.route('/api/discovery/scan', methods=['POST'])
def discover_devices():
    """Discover ONVIF devices on local network using WS-Discovery"""
    try:
        print("\n>>> WS-DISCOVERY SCAN INITIATED")
        
        # Run WS-Discovery scan
        scanner = WSDiscoveryScanner(timeout=10)
        results = scanner.scan()
        
        # Save to discovery history
        history = load_discovery_history()
        history.append(results)
        save_discovery_history(history)
        
        print(f"Discovery complete: Found {results['device_count']} devices")
        
        return jsonify({
            "success": True,
            "data": results
        })
        
    except Exception as e:
        print(f"WS-Discovery error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/discovery/history', methods=['GET'])
def discovery_history():
    """Get WS-Discovery scan history"""
    try:
        history = load_discovery_history()
        return jsonify({
            "success": True,
            "data": history
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/discovery/latest', methods=['GET'])
def discovery_latest():
    """Get the latest WS-Discovery results"""
    try:
        history = load_discovery_history()
        if history:
            latest = history[-1]
            return jsonify({
                "success": True,
                "data": latest
            })
        else:
            return jsonify({
                "success": False,
                "data": None,
                "message": "No discovery scans performed yet"
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== HEALTH CHECK (PING) ENDPOINTS ==============

@app.route('/api/health/check', methods=['POST'])
def trigger_health_check():
    """Manually trigger a health check (ping) of all monitored devices"""
    try:
        health_checker.check_devices()
        
        return jsonify({
            "success": True,
            "data": health_checker.get_all_status(),
            "message": "Health check completed"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health/status', methods=['GET'])
def get_health_status():
    """Get current health status of all monitored devices"""
    try:
        status = health_checker.get_all_status()
        
        return jsonify({
            "success": True,
            "data": status,
            "device_count": len(status),
            "online_count": sum(1 for s in status.values() if s['status'] == 'online'),
            "offline_count": sum(1 for s in status.values() if s['status'] == 'offline')
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health/status/<ip_address>', methods=['GET'])
def get_device_health_status(ip_address):
    """Get health status of a specific device"""
    try:
        status = health_checker.get_device_status(ip_address)
        
        if status:
            return jsonify({
                "success": True,
                "data": status
            })
        else:
            return jsonify({
                "success": False,
                "error": "Device not found in health monitoring"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health/add/<ip_address>', methods=['POST'])
def add_device_to_health_check(ip_address):
    """Add a device to health monitoring"""
    try:
        health_checker.add_device(ip_address)
        
        return jsonify({
            "success": True,
            "message": f"Device {ip_address} added to health monitoring"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health/remove/<ip_address>', methods=['POST'])
def remove_device_from_health_check(ip_address):
    """Remove a device from health monitoring"""
    try:
        health_checker.remove_device(ip_address)
        
        return jsonify({
            "success": True,
            "message": f"Device {ip_address} removed from health monitoring"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health/start', methods=['POST'])
def start_health_monitor():
    """Start the background health check monitor"""
    try:
        start_health_check()
        
        return jsonify({
            "success": True,
            "message": "Health monitor started (5 minute check interval)"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health/stop', methods=['POST'])
def stop_health_monitor():
    """Stop the background health check monitor"""
    try:
        stop_health_check()
        
        return jsonify({
            "success": True,
            "message": "Health monitor stopped"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== PHASE 1 ENDPOINTS: IoT Network Analysis =====

@app.route('/api/scan/iotnet/<target_ip>', methods=['POST'])
def scan_iotnet(target_ip):
    """Analyze IoT network traffic patterns"""
    try:
        result = iotnet_scanner.analyze_traffic(target_ip)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/telnetshell/<target_ip>', methods=['POST'])
def scan_telnetshell(target_ip):
    """Enumerate telnet services and test weak credentials"""
    try:
        result = telnetshell_scanner.scan_telnet(target_ip)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/netflows/<target_ip>', methods=['POST'])
def scan_netflows(target_ip):
    """Analyze network flows and DNS resolutions"""
    try:
        result = netflows_scanner.analyze_flows(target_ip)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== PHASE 2 ENDPOINTS: Firmware & Hardware Analysis =====

@app.route('/api/scan/chipsec/<target_ip>', methods=['POST'])
def scan_chipsec(target_ip):
    """Analyze UEFI/BIOS firmware security"""
    try:
        result = chipsec_scanner.analyze_firmware(target_ip)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/ffind/<target_ip>', methods=['POST'])
def scan_ffind(target_ip):
    """Extract and analyze firmware filesystem"""
    try:
        result = ffind_scanner.extract_firmware(target_ip)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/picocom/<target_ip>', methods=['POST'])
def scan_picocom(target_ip):
    """Test UART/Serial console access"""
    try:
        result = picocom_scanner.scan_serial_access(target_ip)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== COMPREHENSIVE IoT SECURITY SCAN =====

@app.route('/api/scan/iot-security/<target_ip>', methods=['POST'])
def comprehensive_iot_security_scan(target_ip):
    """Run all IoT security scanners on target device"""
    try:
        results = {
            "target_ip": target_ip,
            "timestamp": datetime.now().isoformat(),
            "scan_duration": 0,
            "scanners_completed": 0,
            "scans": {
                "iotnet": {},
                "telnetshell": {},
                "netflows": {},
                "chipsec": {},
                "ffind": {},
                "picocom": {}
            },
            "overall_risk": "MEDIUM",
            "summary": ""
        }
        
        start_time = datetime.now()
        
        # Run all scanners
        results["scans"]["iotnet"] = iotnet_scanner.analyze_traffic(target_ip).get("data", {})
        results["scanners_completed"] += 1
        
        results["scans"]["telnetshell"] = telnetshell_scanner.scan_telnet(target_ip).get("data", {})
        results["scanners_completed"] += 1
        
        results["scans"]["netflows"] = netflows_scanner.analyze_flows(target_ip).get("data", {})
        results["scanners_completed"] += 1
        
        results["scans"]["chipsec"] = chipsec_scanner.analyze_firmware(target_ip).get("data", {})
        results["scanners_completed"] += 1
        
        results["scans"]["ffind"] = ffind_scanner.extract_firmware(target_ip).get("data", {})
        results["scanners_completed"] += 1
        
        results["scans"]["picocom"] = picocom_scanner.scan_serial_access(target_ip).get("data", {})
        results["scanners_completed"] += 1
        
        # Calculate overall risk
        risk_levels = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
        risks = [risk_levels.get(s.get("risk_level", "MEDIUM"), 2) for s in results["scans"].values()]
        avg_risk = sum(risks) / len(risks) if risks else 2
        
        if avg_risk >= 3.5:
            results["overall_risk"] = "CRITICAL"
        elif avg_risk >= 2.5:
            results["overall_risk"] = "HIGH"
        elif avg_risk >= 1.5:
            results["overall_risk"] = "MEDIUM"
        else:
            results["overall_risk"] = "LOW"
        
        results["scan_duration"] = (datetime.now() - start_time).total_seconds()
        results["summary"] = f"Comprehensive IoT security scan complete. {results['scanners_completed']} scanners executed. Overall Risk: {results['overall_risk']}"
        
        return jsonify({
            "success": True,
            "data": results
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Start health check monitoring on API startup
    start_health_check()
    
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True
    )
