#!/usr/bin/env python3
"""
DYNAMIC RECOMMENDATION ENGINE
Context-aware, real-time remediation guidance

This module generates recommendations based on:
- Actual vulnerabilities detected
- Device type and capabilities
- Network context
- Severity and exposure level
- Available remediation paths

PRINCIPLE: Recommendations are GENERATED from scan data, not PREDEFINED.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum


class RemediationPriority(Enum):
    """Remediation action priority levels"""
    IMMEDIATE = 1        # Fix right now, device is critically exposed
    URGENT = 2           # Fix within hours
    HIGH = 3             # Fix within days
    MEDIUM = 4           # Fix within week
    LOW = 5              # Fix within month


@dataclass
class RemediationPath:
    """A potential remediation path with steps and effort"""
    path_name: str
    priority: RemediationPriority
    effort_level: str  # "LOW", "MEDIUM", "HIGH"
    estimated_time: str  # "5 mins", "30 mins", "2 hours"
    steps: List[str]
    requires_downtime: bool = False
    risk_level: str = "LOW"


class DynamicRecommendationEngine:
    """
    Generates context-specific remediation recommendations
    """
    
    def __init__(self):
        self.recommendations = []
        self.remediation_paths = {}
    
    def generate_recommendations(self, vulnerabilities: List[Dict[str, Any]],
                                scan_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate context-specific recommendations for all vulnerabilities
        
        Args:
            vulnerabilities: List of detected vulnerabilities
            scan_context: Context about the device and network
            
        Returns:
            List of recommendation objects with priority and steps
        """
        self.recommendations = []
        
        if not vulnerabilities:
            return [self._generate_no_vuln_recommendation(scan_context)]
        
        # Priority 1: Fix CRITICAL vulnerabilities
        critical = [v for v in vulnerabilities if v.get("severity") == "CRITICAL"]
        high = [v for v in vulnerabilities if v.get("severity") == "HIGH"]
        medium = [v for v in vulnerabilities if v.get("severity") == "MEDIUM"]
        
        # Generate recommendations for each tier
        for vuln in critical:
            self.recommendations.extend(self._generate_recommendation(vuln, scan_context))
        
        for vuln in high:
            self.recommendations.extend(self._generate_recommendation(vuln, scan_context))
        
        for vuln in medium:
            self.recommendations.extend(self._generate_recommendation(vuln, scan_context))
        
        # Add strategic recommendations
        self.recommendations.append(
            self._generate_strategic_recommendation(vulnerabilities, scan_context)
        )
        
        return self.recommendations
    
    def _generate_no_vuln_recommendation(self, scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate recommendation when no vulnerabilities found"""
        return {
            "type": "status",
            "priority": "LOW",
            "title": "No Critical Vulnerabilities Detected",
            "description": f"Device {scan_context['target_ip']} appears to have reasonable security posture.",
            "recommendations": [
                "Continue monitoring device for future vulnerabilities",
                "Maintain regular security scans (monthly recommended)",
                "Keep firmware updated with latest security patches",
            ],
            "effort": "MINIMAL",
        }
    
    def _generate_recommendation(self, vuln: Dict[str, Any],
                                scan_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate specific recommendation for a vulnerability"""
        rule_id = vuln.get("rule_id", "UNKNOWN")
        severity = vuln.get("severity", "MEDIUM")
        
        # Route to specific recommendation generator
        if rule_id == "VULN_RTSP_EXPOSURE":
            return [self._recommend_rtsp_fix(vuln, scan_context)]
        
        elif rule_id == "VULN_ONVIF_EXPOSURE":
            return [self._recommend_onvif_fix(vuln, scan_context)]
        
        elif rule_id == "VULN_HTTP_WEB_PANEL":
            return [self._recommend_http_fix(vuln, scan_context)]
        
        elif rule_id == "VULN_TELNET":
            return [self._recommend_telnet_fix(vuln, scan_context)]
        
        elif rule_id == "VULN_SNMP_EXPOSURE":
            return [self._recommend_snmp_fix(vuln, scan_context)]
        
        elif rule_id == "VULN_FTP_EXPOSURE":
            return [self._recommend_ftp_fix(vuln, scan_context)]
        
        elif rule_id == "VULN_EXCESSIVE_PORTS":
            return [self._recommend_excessive_ports_fix(vuln, scan_context)]
        
        else:
            return [self._generate_generic_recommendation(vuln, scan_context)]
    
    # ===== SPECIFIC RECOMMENDATION GENERATORS =====
    
    def _recommend_rtsp_fix(self, vuln: Dict[str, Any],
                           scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate RTSP exposure fix recommendation"""
        
        immediate_steps = [
            {
                "step": 1,
                "action": "FIREWALL BLOCK (Immediate, 2 mins)",
                "description": f"Block port 554 to non-trusted IPs at firewall",
                "command": f"firewall-cmd --add-rich-rule='rule family=ipv4 port protocol=tcp port=554 reject'",
                "benefit": "Prevents immediate exploitation"
            },
        ]
        
        short_term_steps = [
            {
                "step": 2,
                "action": "ACCESS CAMERA (15 mins)",
                "description": "Connect to camera web interface to configure RTSP authentication",
                "options": [
                    f"Try: https://{scan_context['target_ip']}:8089 (common admin port)",
                    f"Try: http://{scan_context['target_ip']}:80 (standard HTTP)",
                    "Check camera model manual for default admin URL",
                    "Default credentials: admin/admin or admin/12345 (depending on brand)"
                ],
                "benefit": "Gain access to security settings"
            },
            {
                "step": 3,
                "action": "ENABLE RTSP AUTH (5 mins)",
                "description": "Enable RTSP authentication in camera settings",
                "options": [
                    "Settings → Streaming → RTSP Authentication: Enable",
                    "Settings → RTSP Configuration → Require Username/Password",
                    "Network → RTSP → Authentication: ON",
                    "Security → Stream Protection → Enable"
                ],
                "benefit": "Prevents unauthenticated stream access"
            },
            {
                "step": 4,
                "action": "SET STRONG PASSWORD (5 mins)",
                "description": "Change RTSP auth password to strong, unique value",
                "requirements": [
                    "Minimum 12 characters",
                    "Mix of uppercase, lowercase, numbers, symbols",
                    "Avoid common patterns",
                    "Different from admin password"
                ],
                "example": "RtSp$tr34m#P@ss2024",
                "benefit": "Makes brute force attacks infeasible"
            },
        ]
        
        hardening_steps = [
            {
                "step": 5,
                "action": "NETWORK ISOLATION (30 mins)",
                "description": "Place camera on isolated VLAN if possible",
                "setup": [
                    "Create separate VLAN for cameras (e.g., VLAN 40)",
                    "Configure firewall rules between VLANs",
                    "Allow only required ports (554 to admin subnet only)",
                    "Block direct access from guest networks"
                ],
                "benefit": "Limits lateral movement in case of compromise"
            },
            {
                "step": 6,
                "action": "OPTIONAL: ENCRYPTION (45 mins)",
                "description": "Enable RTSPS (RTSP over TLS) if supported",
                "setup": [
                    "Check camera support for RTSPS on port 322",
                    "If available: Security → RTSPS: Enable",
                    "Generate or upload TLS certificate",
                    "Test: vlc rtsps://camera-ip/stream (should work)"
                ],
                "benefit": "Encrypts stream in transit"
            },
        ]
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": "Fix RTSP Stream Exposure",
            "severity": vuln.get("severity", "HIGH"),
            "priority": "IMMEDIATE" if vuln.get("severity") == "CRITICAL" else "URGENT",
            "estimated_total_time": "1 hour",
            
            "quick_fix": {
                "description": "Get this done NOW (2 minutes)",
                "steps": [
                    f"Block port 554 at firewall for non-trusted IPs",
                ]
            },
            
            "immediate_actions": {
                "description": "Complete today (30 minutes)",
                "steps": immediate_steps
            },
            
            "short_term_remediation": {
                "description": "Complete within 24 hours",
                "steps": short_term_steps,
                "verification": [
                    f"Try: vlc rtsp://{scan_context['target_ip']}/stream1",
                    "Should prompt for username/password",
                    "Should deny access with wrong credentials"
                ]
            },
            
            "hardening": {
                "description": "Complete within 1 week (advanced security)",
                "steps": hardening_steps
            },
            
            "monitoring": [
                "Enable camera audit logs for RTSP access",
                "Monitor failed authentication attempts",
                "Alert on access from unexpected IPs",
                "Review stream access logs monthly"
            ],
            
            "affected_ports": vuln.get("ports", [554]),
            "cves": vuln.get("cves", []),
        }
    
    def _recommend_onvif_fix(self, vuln: Dict[str, Any],
                            scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate ONVIF exposure fix recommendation"""
        
        port = vuln.get("ports", [8899])[0]
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": "Fix ONVIF Device Management Exposure",
            "severity": "CRITICAL",
            "priority": "IMMEDIATE",
            "estimated_total_time": "30 minutes",
            
            "quick_fix": {
                "description": "DO THIS RIGHT NOW (5 minutes)",
                "steps": [
                    f"BLOCK port {port} at firewall immediately",
                    "This is full device control exposure"
                ]
            },
            
            "immediate_actions": {
                "description": "Complete today (15 minutes)",
                "steps": [
                    {
                        "step": 1,
                        "action": f"FIREWALL RULE: Block {port}",
                        "command": f"firewall-cmd --add-rich-rule='rule family=ipv4 port {port} reject'",
                        "impact": "Prevents attacker from managing device"
                    },
                    {
                        "step": 2,
                        "action": "CHECK FIRMWARE",
                        "description": "Assume possible compromise - check for backdoors",
                        "command": "Check for unauthorized users/scheduled tasks"
                    }
                ]
            },
            
            "short_term": {
                "description": "Complete within 24 hours",
                "steps": [
                    {
                        "action": "Disable ONVIF if not needed",
                        "description": f"Access camera admin → Security → ONVIF: Disable"
                    },
                    {
                        "action": "Force password reset",
                        "description": "Assume attacker may have changed credentials"
                    }
                ]
            },
            
            "long_term": {
                "description": "Complete within 1 week",
                "steps": [
                    "Implement network segmentation (VLAN)",
                    "Enable strict firewall rules",
                    "Monitor ONVIF access attempts",
                    "Update firmware to latest version"
                ]
            },
            
            "affected_ports": [port],
            "cves": vuln.get("cves", []),
        }
    
    def _recommend_http_fix(self, vuln: Dict[str, Any],
                           scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate HTTP exposure fix recommendation"""
        
        http_ports = vuln.get("ports", [80, 8080])
        port = http_ports[0] if http_ports else 80
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": "Fix Unencrypted HTTP Web Interface",
            "severity": vuln.get("severity", "HIGH"),
            "priority": "URGENT",
            "estimated_total_time": "1 hour",
            
            "quick_fix": {
                "description": "Immediate action (5 minutes)",
                "steps": [
                    f"Restrict HTTP {port} access to trusted networks only",
                    "Change default admin credentials"
                ]
            },
            
            "short_term": {
                "description": "Complete today",
                "steps": [
                    {
                        "step": 1,
                        "action": "Change Admin Credentials",
                        "description": f"Connect to http://{scan_context['target_ip']}:{port}",
                        "options": [
                            "Default: admin/admin",
                            "Default: admin/12345",
                            "Device manual for default credentials"
                        ]
                    },
                    {
                        "step": 2,
                        "action": "Check for HTTPS Support",
                        "description": f"Test: https://{scan_context['target_ip']}:443",
                        "note": "Many cameras support HTTPS on port 443"
                    }
                ]
            },
            
            "medium_term": {
                "description": "Complete within 48 hours",
                "steps": [
                    {
                        "action": "Enable HTTPS",
                        "options": [
                            "Camera Settings → Security → HTTPS: Enable",
                            "May require certificate installation",
                            "Self-signed certificate acceptable for local use"
                        ]
                    },
                    {
                        "action": "Redirect HTTP to HTTPS",
                        "description": "Force all traffic to encrypted channel"
                    }
                ]
            },
            
            "long_term": {
                "description": "Complete within 1 week",
                "steps": [
                    "Restrict HTTP port to trusted IPs only via firewall",
                    "Monitor and log all access attempts",
                    "Implement VPN for remote access instead of exposing HTTP",
                    "Use HTTPS exclusively in all configs"
                ]
            },
            
            "verification": [
                f"Test: curl http://{scan_context['target_ip']}:{port} (should deny or redirect)",
                f"Test: curl https://{scan_context['target_ip']}:443 (should work)",
                "Verify HTTP redirects to HTTPS"
            ],
            
            "affected_ports": http_ports,
        }
    
    def _recommend_telnet_fix(self, vuln: Dict[str, Any],
                             scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Telnet exposure fix recommendation"""
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": "Fix Telnet Remote Access (CRITICAL)",
            "severity": "CRITICAL",
            "priority": "IMMEDIATE",
            "estimated_total_time": "30 minutes",
            
            "URGENT": "This is CRITICALLY SEVERE - Telnet sends passwords in plaintext",
            
            "quick_fix": {
                "description": "DO THIS IMMEDIATELY (5 minutes)",
                "steps": [
                    "Block port 23 at firewall NOW",
                    "This allows remote credential theft"
                ]
            },
            
            "immediate_actions": {
                "description": "Complete within 1 hour",
                "steps": [
                    {
                        "step": 1,
                        "action": "Assume Compromise",
                        "description": "If this was exposed, credentials were likely captured",
                        "actions": [
                            "Change ALL device credentials",
                            "Review device logs for unauthorized access",
                            "Check connected networks for lateral movement"
                        ]
                    },
                    {
                        "step": 2,
                        "action": "Replace with SSH",
                        "description": "Connect to device and enable SSH (port 22)",
                        "via_telnet": f"telnet {scan_context['target_ip']} 23 (this is insecure!)",
                        "options": [
                            "Device Settings → Remote Access → SSH: Enable",
                            "Device Settings → Telnet: Disable",
                            "Restart device"
                        ]
                    }
                ]
            },
            
            "verification": [
                f"Verify: nc -zv {scan_context['target_ip']} 23 (should timeout)",
                f"Test: ssh {scan_context['target_ip']} (should work with new creds)",
                "Confirm Telnet is completely disabled"
            ],
            
            "affected_ports": [23],
        }
    
    def _recommend_snmp_fix(self, vuln: Dict[str, Any],
                           scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate SNMP exposure fix recommendation"""
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": "Fix SNMP Community String Exposure",
            "severity": vuln.get("severity", "HIGH"),
            "priority": "URGENT",
            "estimated_total_time": "45 minutes",
            
            "quick_fix": {
                "description": "Immediate (5 minutes)",
                "steps": [
                    "Block port 161 UDP at firewall",
                    "Restrict to admin subnets only"
                ]
            },
            
            "steps": [
                {
                    "step": 1,
                    "title": "Disable SNMP if not needed",
                    "options": [
                        "Camera Settings → Management → SNMP: Disable",
                        "Restart to apply changes"
                    ]
                },
                {
                    "step": 2,
                    "title": "If SNMP required: Change community strings",
                    "change": {
                        "from": "public/private",
                        "to": "Complex, 16+ character random string"
                    },
                    "example": "SNMPc0mmun1ty$K3y#2024"
                },
                {
                    "step": 3,
                    "title": "Upgrade to SNMPv3",
                    "description": "Use modern authentication and encryption",
                    "setup": [
                        "Enable SNMPv3 in camera settings",
                        "Disable SNMPv1/v2",
                        "Set auth password and privacy password (both strong)"
                    ]
                }
            ],
            
            "affected_ports": [161],
        }
    
    def _recommend_ftp_fix(self, vuln: Dict[str, Any],
                          scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate FTP exposure fix recommendation"""
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": "Fix FTP Unencrypted File Transfer",
            "severity": "HIGH",
            "priority": "URGENT",
            "estimated_total_time": "1 hour",
            
            "CRITICAL_NOTE": "FTP transmits all data including passwords in plaintext",
            
            "steps": [
                {
                    "action": "IMMEDIATE: Disable FTP",
                    "description": "FTP is outdated and insecure",
                    "how": [
                        "Admin panel → Services → FTP: Disable",
                        "Or firewall block port 21"
                    ]
                },
                {
                    "action": "Replace with SFTP",
                    "description": "Use SSH-based file transfer (port 22)",
                    "enable_ssh": "First enable SSH if not already running"
                },
                {
                    "action": "If FTP must stay",
                    "options": [
                        "Force FTPS (explicit TLS) on port 21",
                        "Restrict access to admin networks only",
                        "Use strong FTP credentials",
                        "Log and monitor all FTP transfers"
                    ]
                }
            ],
            
            "affected_ports": [21],
        }
    
    def _recommend_excessive_ports_fix(self, vuln: Dict[str, Any],
                                      scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate excessive ports fix recommendation"""
        
        num_ports = len(vuln.get("ports", []))
        ports_str = ", ".join(map(str, vuln.get("ports", [])[:10]))
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": f"Reduce Attack Surface ({num_ports} open ports)",
            "severity": vuln.get("severity", "MEDIUM"),
            "priority": "HIGH",
            "estimated_total_time": "2 hours",
            
            "overview": f"Device has {num_ports} open ports: {ports_str}",
            
            "steps": [
                {
                    "step": 1,
                    "action": "Audit Services",
                    "description": "List all running services and determine which are needed",
                    "items": vuln.get("ports", [])[:10]
                },
                {
                    "step": 2,
                    "action": "Disable Unnecessary Services",
                    "description": "Turn off services not required for camera operation",
                    "common_candidates": [
                        "UPnP/SSDP",
                        "SNMP (if not monitored)",
                        "FTP (use SSH instead)",
                        "Secondary web servers"
                    ]
                },
                {
                    "step": 3,
                    "action": "Firewall Rules",
                    "description": "Implement whitelist approach",
                    "setup": [
                        "Allow ONLY required ports",
                        "Restrict each port to specific source IPs",
                        "Block everything else by default"
                    ]
                }
            ],
            
            "affected_ports": vuln.get("ports", []),
        }
    
    def _generate_generic_recommendation(self, vuln: Dict[str, Any],
                                        scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate generic recommendation for unknown vulnerability"""
        
        return {
            "type": "vulnerability_fix",
            "vulnerability_id": vuln["id"],
            "title": f"Fix: {vuln.get('title', 'Unknown Vulnerability')}",
            "severity": vuln.get("severity", "MEDIUM"),
            "priority": "HIGH" if vuln.get("severity") == "CRITICAL" else "MEDIUM",
            
            "description": vuln.get("description", ""),
            
            "recommended_actions": vuln.get("remediation", []),
            
            "ports": vuln.get("ports", []),
            
            "cves": vuln.get("cves", []),
        }
    
    def _generate_strategic_recommendation(self, vulnerabilities: List[Dict[str, Any]],
                                          scan_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate overall strategic recommendation"""
        
        critical_count = len([v for v in vulnerabilities if v.get("severity") == "CRITICAL"])
        high_count = len([v for v in vulnerabilities if v.get("severity") == "HIGH"])
        medium_count = len([v for v in vulnerabilities if v.get("severity") == "MEDIUM"])
        
        if critical_count > 0:
            priority = "EMERGENCY: Device requires immediate remediation"
            timeline = "Complete critical fixes TODAY"
        elif high_count > 2:
            priority = "HIGH PRIORITY: Multiple significant vulnerabilities"
            timeline = "Complete fixes within 24-48 hours"
        else:
            priority = "STANDARD: Address vulnerabilities systematically"
            timeline = "Complete fixes within 1 week"
        
        return {
            "type": "strategy",
            "title": "Remediation Strategy",
            "priority": priority,
            "timeline": timeline,
            
            "summary": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "total": len(vulnerabilities)
            },
            
            "recommended_order": [
                "1. Fix CRITICAL vulnerabilities immediately (affects $ more vulnerabilities = higher priority)",
                "2. Fix HIGH vulnerabilities within 24 hours",
                "3. Address MEDIUM vulnerabilities within 1 week",
                "4. Implement long-term hardening",
                "5. Set up monitoring and periodic scanning"
            ],
            
            "parallel_work": [
                "While fixing vulnerabilities, change all default credentials",
                "Update to latest firmware during maintenance window",
                "Plan network isolation if not already done",
                "Document all changes made"
            ],
            
            "long_term_hardening": [
                "Place devices on isolated VLAN",
                "Implement firewall rules (whitelist approach)",
                "Enable device logging and monitoring",
                "Set up automated security scanning (monthly)",
                "Maintain firmware update schedule",
                "Create incident response plan"
            ]
        }


# ===== EXAMPLE USAGE =====

if __name__ == "__main__":
    
    example_vulns = [
        {
            "id": "VULN_001",
            "rule_id": "VULN_RTSP_EXPOSURE",
            "severity": "CRITICAL",
            "ports": [554],
            "title": "RTSP Stream Exposed",
        },
        {
            "id": "VULN_002",
            "rule_id": "VULN_HTTP_WEB_PANEL",
            "severity": "HIGH",
            "ports": [80, 8080],
            "title": "Unencrypted HTTP Interface",
        }
    ]
    
    scan_ctx = {
        "target_ip": "192.168.1.100",
        "port_numbers": [22, 23, 80, 554, 8080, 8089],
    }
    
    engine = DynamicRecommendationEngine()
    recs = engine.generate_recommendations(example_vulns, scan_ctx)
    
    print(f"\n📋 Generated {len(recs)} recommendations:\n")
    for rec in recs:
        print(f"[{rec['priority']}] {rec['title']}")
        if "estimated_total_time" in rec:
            print(f"  ⏱ Time: {rec['estimated_total_time']}")
        print()
