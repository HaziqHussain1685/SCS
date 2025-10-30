#!/usr/bin/env python3
"""
SmartCam Shield - Simple Network Scanner
Discovers cameras on localhost and tests for vulnerabilities
"""

import socket
import requests
from requests.auth import HTTPBasicAuth
import json
from datetime import datetime

# Configuration
TARGETS = [
    {"name": "Camera 1", "ip": "127.0.0.1", "ports": [8081, 5541]},
    {"name": "Camera 2", "ip": "127.0.0.1", "ports": [8082]},
    {"name": "Camera 3", "ip": "127.0.0.1", "ports": [8083, 2121, 2323, 5543]},
    {"name": "Camera 4", "ip": "127.0.0.1", "ports": [8084, 2324, 5544]},
]

# Common weak credentials to test
COMMON_CREDS = [
    ("admin", "admin"),
    ("admin", "password"),
    ("admin", "12345"),
    ("root", "root"),
    ("root", "12345"),
    ("admin", ""),
    ("user", "user"),
    ("guest", "guest"),
    ("homeowner", "SecureP@ssw0rd2024!"),  # For testing the secure one
]

# Firmware vulnerability database (simplified)
FIRMWARE_DB = {
    "0.9.4": {"status": "vulnerable", "cves": ["CVE-2023-1234", "CVE-2023-5678"], "risk": "CRITICAL"},
    "1.0.2": {"status": "outdated", "cves": [], "risk": "HIGH"},
    "1.5.1": {"status": "outdated", "cves": [], "risk": "MEDIUM"},
    "2.4.0": {"status": "up-to-date", "cves": [], "risk": "LOW"},
}

# Port risk mapping
PORT_RISKS = {
    21: {"service": "FTP", "risk": "HIGH", "description": "Unencrypted file transfer"},
    23: {"service": "Telnet", "risk": "CRITICAL", "description": "Unencrypted remote access"},
    80: {"service": "HTTP", "risk": "LOW", "description": "Web interface (unencrypted)"},
    554: {"service": "RTSP", "risk": "MEDIUM", "description": "Streaming protocol"},
}


def check_port(ip, port, timeout=2):
    """Check if a port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((ip, port))
        sock.close()
        return result == 0
    except:
        return False


def test_credentials(ip, http_port, creds_list):
    """Test common credentials against HTTP interface"""
    found_creds = []
    
    for username, password in creds_list:
        try:
            url = f"http://{ip}:{http_port}/info"
            response = requests.get(
                url,
                auth=HTTPBasicAuth(username, password),
                timeout=3
            )
            
            if response.status_code == 200:
                found_creds.append({
                    "username": username,
                    "password": password,
                    "strength": "weak" if password in ["admin", "password", "12345", ""] else "moderate"
                })
                print(f"  ✓ Valid credentials found: {username}:{password}")
                return found_creds  # Return first valid credentials
        except:
            pass
    
    return found_creds


def get_device_info(ip, http_port, username, password):
    """Retrieve device information"""
    try:
        url = f"http://{ip}:{http_port}/info"
        response = requests.get(
            url,
            auth=HTTPBasicAuth(username, password),
            timeout=3
        )
        
        if response.status_code == 200:
            return response.json()
    except:
        pass
    
    return None


def calculate_health_score(device_data):
    """Calculate health index score (0-100, higher is better)"""
    score = 100
    risks = []
    
    # Firmware check
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") == "vulnerable":
        score -= 50
        risks.append({"severity": "CRITICAL", "issue": "Vulnerable firmware with known CVEs", "impact": -50})
    elif firmware.get("status") == "outdated":
        score -= 30
        risks.append({"severity": "HIGH", "issue": "Outdated firmware", "impact": -30})
    
    # Credentials check
    creds = device_data.get("credentials", {})
    if creds.get("strength") == "weak":
        score -= 40
        risks.append({"severity": "CRITICAL", "issue": "Weak or default credentials", "impact": -40})
    elif creds.get("strength") == "moderate":
        score -= 20
        risks.append({"severity": "MEDIUM", "issue": "Moderate password strength", "impact": -20})
    
    # Insecure services
    insecure_count = 0
    for port_data in device_data.get("open_ports", []):
        risk_level = port_data.get("risk", "LOW")
        if risk_level in ["CRITICAL", "HIGH"]:
            insecure_count += 1
            score -= 15
            risks.append({
                "severity": risk_level,
                "issue": f"Insecure service: {port_data['service']} on port {port_data['port']}",
                "impact": -15
            })
    
    # Exposure check
    if device_data.get("exposed_to_internet"):
        score -= 50
        risks.append({"severity": "CRITICAL", "issue": "Device exposed to internet", "impact": -50})
    
    score = max(0, score)  # Minimum 0
    
    # Determine overall risk level
    if score >= 80:
        risk_level = "LOW"
    elif score >= 60:
        risk_level = "MEDIUM"
    elif score >= 40:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"
    
    return {
        "health_score": score,
        "risk_level": risk_level,
        "risks": risks
    }


def generate_recommendations(device_data, health_data):
    """Generate actionable remediation steps"""
    recommendations = []
    
    # Get model name
    model_name = "your camera"
    if device_data.get("device_info"):
        model_name = device_data["device_info"].get("model", "your camera")
    
    # Firmware recommendations
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") in ["vulnerable", "outdated"]:
        recommendations.append({
            "priority": "HIGH" if firmware.get("status") == "vulnerable" else "MEDIUM",
            "action": "Update firmware",
            "steps": [
                f"1. Visit manufacturer website for {model_name}",
                "2. Download latest firmware (v2.4.0 or newer recommended)",
                "3. Access camera admin panel",
                "4. Navigate to System > Firmware Update",
                "5. Upload and install new firmware",
                "6. Restart device and verify update"
            ]
        })
    
    # Password recommendations
    creds = device_data.get("credentials", {})
    if creds.get("strength") in ["weak", "moderate"]:
        recommendations.append({
            "priority": "CRITICAL" if creds.get("strength") == "weak" else "MEDIUM",
            "action": "Change password",
            "steps": [
                "1. Access camera admin panel",
                "2. Go to Settings > User Management",
                "3. Change default password",
                "4. Use strong password (12+ chars, mixed case, numbers, symbols)",
                "5. Enable two-factor authentication if available"
            ]
        })
    
    # Service hardening
    insecure_services = [p for p in device_data.get("open_ports", []) if p.get("risk") in ["CRITICAL", "HIGH"]]
    if insecure_services:
        recommendations.append({
            "priority": "HIGH",
            "action": "Disable insecure services",
            "steps": [
                "1. Access camera admin panel",
                "2. Navigate to Network > Services",
                f"3. Disable: {', '.join([s['service'] for s in insecure_services])}",
                "4. Keep only HTTPS for web access",
                "5. Use VPN for remote access instead of port forwarding"
            ]
        })
    
    # Exposure recommendations
    if device_data.get("exposed_to_internet"):
        recommendations.append({
            "priority": "CRITICAL",
            "action": "Remove from public internet",
            "steps": [
                "1. Access router admin panel",
                "2. Remove port forwarding rules for camera",
                "3. Place camera on isolated VLAN if possible",
                "4. Use VPN for remote access",
                "5. Enable router firewall rules"
            ]
        })
    
    return recommendations


def scan_network():
    """Main scanning function"""
    print("\n" + "="*70)
    print("SmartCam Shield - Network Scanner")
    print("="*70 + "\n")
    
    results = []
    
    for target in TARGETS:
        print(f"Scanning {target['name']} at {target['ip']}...")
        
        device_result = {
            "name": target['name'],
            "ip": target['ip'],
            "scan_time": datetime.now().isoformat(),
            "open_ports": [],
            "credentials": None,
            "device_info": None,
            "firmware_info": None,
            "exposed_to_internet": False
        }
        
        # Check ports
        http_port = None
        for port in target['ports']:
            if check_port(target['ip'], port):
                port_info = PORT_RISKS.get(port, {"service": "Unknown", "risk": "UNKNOWN", "description": ""})
                device_result["open_ports"].append({
                    "port": port,
                    "service": port_info["service"],
                    "risk": port_info["risk"],
                    "description": port_info["description"]
                })
                print(f"  ✓ Port {port} open ({port_info['service']}) - Risk: {port_info['risk']}")
                
                if port in [80, 8080, 8081, 8082, 8083, 8084]:
                    http_port = port
        
        # Test credentials if HTTP is available
        if http_port:
            print(f"  Testing credentials...")
            creds = test_credentials(target['ip'], http_port, COMMON_CREDS)
            if creds:
                device_result["credentials"] = creds[0]
                
                # Get device info
                info = get_device_info(target['ip'], http_port, creds[0]['username'], creds[0]['password'])
                if info:
                    device_result["device_info"] = info
                    device_result["exposed_to_internet"] = info.get("exposed_to_internet", False)
                    
                    # Check firmware
                    firmware_version = info.get("firmware")
                    if firmware_version in FIRMWARE_DB:
                        device_result["firmware_info"] = FIRMWARE_DB[firmware_version]
                        device_result["firmware_info"]["version"] = firmware_version
                        print(f"  Firmware: {firmware_version} - Status: {FIRMWARE_DB[firmware_version]['status']}")
        
        # Calculate health score
        health = calculate_health_score(device_result)
        device_result["health_score"] = health["health_score"]
        device_result["risk_level"] = health["risk_level"]
        device_result["identified_risks"] = health["risks"]
        
        # Generate recommendations
        device_result["recommendations"] = generate_recommendations(device_result, health)
        
        results.append(device_result)
        
        print(f"  Health Score: {health['health_score']}/100 ({health['risk_level']})")
        print()
    
    return results


def print_summary(results):
    """Print summary report"""
    print("\n" + "="*70)
    print("SCAN SUMMARY")
    print("="*70 + "\n")
    
    for device in results:
        print(f"{device['name']} ({device['ip']})")
        print(f"  Health Score: {device['health_score']}/100")
        print(f"  Risk Level: {device['risk_level']}")
        print(f"  Open Ports: {len(device['open_ports'])}")
        print(f"  Credentials: {'Found' if device['credentials'] else 'Not tested'}")
        print(f"  Recommendations: {len(device['recommendations'])}")
        print()


def save_results(results, filename="scan_results.json"):
    """Save results to JSON file"""
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Results saved to {filename}")


if __name__ == "__main__":
    results = scan_network()
    print_summary(results)
    save_results(results)
    
    print("\nScan complete! Use scan_results.json to feed data to your dashboard.")
