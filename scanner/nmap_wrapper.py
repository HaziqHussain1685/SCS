#!/usr/bin/env python3
"""
NMAP Wrapper - Clean network-only scanning
Handles all nmap operations for IP camera discovery and vulnerability detection
"""

import subprocess
import xml.etree.ElementTree as ET
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

class NmapWrapper:
    """Wrapper for nmap commands optimized for IoT camera scanning"""
    
    def __init__(self):
        self.scan_results = None
        self.target_ip = None
    
    def run_quick_port_scan(self, target_ip: str) -> Dict[str, Any]:
        """
        Stage 2: Quick port scan on common camera ports
        Tests ports: 554, 8089, 8899, 80, 8080, 8888, 443, 49153
        Time: ~30 seconds
        """
        self.target_ip = target_ip
        ports = "554,8089,8899,80,8080,8888,443,49153"
        
        cmd = [
            "nmap",
            "-sV",                 # Service version detection
            "-T4",                 # Fast timing
            f"-p {ports}",         # Only these ports
            "--open",              # Only show open ports
            "-oX", "-",            # XML to stdout
            target_ip
        ]
        
        try:
            print(f"[NMAP] Running quick port scan on {target_ip}...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return self._parse_nmap_xml(result.stdout)
            else:
                return {"error": "Nmap scan failed", "stderr": result.stderr}
        except subprocess.TimeoutExpired:
            return {"error": "Nmap scan timeout (120s)"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_full_port_scan(self, target_ip: str) -> Dict[str, Any]:
        """
        Stage 1: Full port scan (all 65535 ports)
        Time: ~2-3 minutes
        WARNING: Can be slow - consider skipping if quick scan finds issues
        """
        self.target_ip = target_ip
        
        cmd = [
            "nmap",
            "-sV",                 # Service version
            "-T4",                 # Fast
            "-p-",                 # ALL ports
            "--open",
            "-oX", "-",
            target_ip
        ]
        
        try:
            print(f"[NMAP] Running full port scan on {target_ip}...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes
            )
            
            if result.returncode == 0:
                return self._parse_nmap_xml(result.stdout)
            else:
                return {"error": "Full port scan failed"}
        except subprocess.TimeoutExpired:
            return {"error": "Full port scan timeout (300s)"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_rtsp_enumeration(self, target_ip: str) -> Dict[str, Any]:
        """
        Stage 4: RTSP enumeration on port 554
        Tests for RTSP endpoints, authentication, methods
        Time: ~20 seconds
        """
        cmd = [
            "nmap",
            "-p 554",
            "--script=rtsp-url-brute,rtsp-methods,http-auth",
            "-oX", "-",
            target_ip
        ]
        
        try:
            print(f"[NMAP] Running RTSP enumeration on {target_ip}:554...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return self._parse_script_output(result.stdout, "rtsp")
            else:
                return {"error": "RTSP enumeration failed"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_web_panel_discovery(self, target_ip: str) -> Dict[str, Any]:
        """
        Stage 5: Web panel discovery (HTTP/HTTPS)
        Tests ports: 80, 8080, 8888, 443, 8443
        Time: ~15 seconds
        """
        ports = "80,8080,8888,443,8443"
        
        cmd = [
            "nmap",
            f"-p {ports}",
            "--script=http-title,http-headers,http-favicon,ssl-cert",
            "-oX", "-",
            target_ip
        ]
        
        try:
            print(f"[NMAP] Running web panel discovery on {target_ip}...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return self._parse_script_output(result.stdout, "web")
            else:
                return {"error": "Web panel discovery failed"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_onvif_detection(self, target_ip: str) -> Dict[str, Any]:
        """
        Stage 6: ONVIF detection on ports 8899, 49153
        Looks for ONVIF device management
        Time: ~15 seconds
        """
        ports = "8899,49153"
        
        cmd = [
            "nmap",
            f"-p {ports}",
            "--script=onvif-discovery",
            "-oX", "-",
            target_ip
        ]
        
        try:
            print(f"[NMAP] Running ONVIF detection on {target_ip}...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return self._parse_script_output(result.stdout, "onvif")
            else:
                return {"error": "ONVIF detection failed"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_vulnerability_scan(self, target_ip: str, ports: str = "554,8089,8899,80,8080") -> Dict[str, Any]:
        """
        Stage 7: Vulnerability scanning
        Tests for SSL/SSH issues, weak protocols, security headers
        Time: ~30 seconds
        """
        cmd = [
            "nmap",
            f"-p {ports}",
            "--script=ssl-cert,ssl-enum-ciphers,ssh-hostkey,sshv1",
            "-oX", "-",
            target_ip
        ]
        
        try:
            print(f"[NMAP] Running vulnerability scan on {target_ip}...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return self._parse_script_output(result.stdout, "vuln")
            else:
                return {"error": "Vulnerability scan failed"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_default_credentials_scan(self, target_ip: str) -> Dict[str, Any]:
        """
        Enhanced: Check for default credentials on common camera ports
        Scans for HTTP/S on ports 80, 443, 8080, 8088, 8443
        Tests for basic auth, form-based login, and known weak defaults
        Time: ~30 seconds
        """
        ports = "80,443,8080,8088,8443,8089"
        
        cmd = [
            "nmap",
            f"-p {ports}",
            "--script=http-title,http-headers,http-auth,samba-os-discovery,smb-security-mode",
            "-oX", "-",
            target_ip
        ]
        
        try:
            print(f"[NMAP] Scanning for default credentials and weak configs on {target_ip}...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return self._parse_script_output(result.stdout, "credentials")
            else:
                return {"error": "Credential scan failed"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_weak_security_scan(self, target_ip: str, ports: str = "554,8089,8899,80,8080") -> Dict[str, Any]:
        """
        Enhanced: Detect weak security configurations
        - SSL/TLS weaknesses
        - Unencrypted connections (HTTP instead of HTTPS)
        - Weak ciphers
        - Missing security headers
        Time: ~30 seconds
        """
        cmd = [
            "nmap",
            f"-p {ports}",
            "--script=ssl-cert,ssl-enum-ciphers,ssl-known-key,http-security-headers,sslv2,sslv3",
            "-oX", "-",
            target_ip
        ]
        
        try:
            print(f"[NMAP] Scanning for weak security on {target_ip}...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return self._parse_script_output(result.stdout, "weak_security")
            else:
                return {"error": "Weak security scan failed"}
        except Exception as e:
            return {"error": str(e)}
    
    def _parse_nmap_xml(self, xml_output: str) -> Dict[str, Any]:
        """Parse nmap XML and extract key data"""
        try:
            root = ET.fromstring(xml_output)
            
            findings = {
                "open_ports": [],
                "services": {},
                "scripts": {},
                "raw_xml": xml_output
            }
            
            # Extract open ports and services
            for host in root.findall('host'):
                for port_elem in host.findall('ports/port'):
                    state = port_elem.find('state')
                    if state is not None and state.get('state') == 'open':
                        port_num = int(port_elem.get('portid'))
                        service_elem = port_elem.find('service')
                        
                        service_info = {
                            "port": port_num,
                            "protocol": port_elem.get('protocol'),
                            "service": "",
                            "version": ""
                        }
                        
                        if service_elem is not None:
                            service_info["service"] = service_elem.get('name', 'unknown')
                            service_info["version"] = service_elem.get('version', '')
                        
                        findings["open_ports"].append(service_info)
                        findings["services"][port_num] = service_info["service"]
                        
                        # Extract script outputs
                        for script in port_elem.findall('script'):
                            script_id = script.get('id')
                            script_output = script.get('output', '')
                            findings["scripts"][script_id] = script_output
            
            findings["status"] = "success"
            findings["timestamp"] = datetime.now().isoformat()
            return findings
            
        except Exception as e:
            return {"error": f"XML parsing failed: {str(e)}", "status": "failed"}
    
    def _parse_script_output(self, xml_output: str, script_type: str) -> Dict[str, Any]:
        """Parse nmap script output for specific script results"""
        try:
            root = ET.fromstring(xml_output)
            
            scripts = {}
            
            for script in root.findall('.//script'):
                script_id = script.get('id')
                script_output = script.get('output', '')
                
                if script_output:
                    scripts[script_id] = script_output
            
            return {
                "type": script_type,
                "scripts": scripts,
                "status": "success",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Script output parsing failed: {str(e)}", "status": "failed"}
