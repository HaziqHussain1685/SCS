#!/usr/bin/env python3
"""
SmartCam Shield - Live Network Scanner API
Provides REST API for real-time scanning and device status monitoring
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import socket
import requests
from requests.auth import HTTPBasicAuth
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
TARGETS = [
    {"name": "Camera 1 - Vulnerable", "ip": "172.25.0.11", "host_ip": "127.0.0.1", "ports": [8081, 5541], "container": "smartcam-demo-cam1"},
    {"name": "Camera 2 - Secure", "ip": "172.25.0.12", "host_ip": "127.0.0.1", "ports": [8082], "container": "smartcam-demo-cam2"},
    {"name": "Camera 3 - Critical", "ip": "172.25.0.13", "host_ip": "127.0.0.1", "ports": [8083, 2121, 2323, 5543], "container": "smartcam-demo-cam3"},
    {"name": "Camera 4 - Moderate", "ip": "172.25.0.14", "host_ip": "127.0.0.1", "ports": [8084, 2324, 5544], "container": "smartcam-demo-cam4"},
]

COMMON_CREDS = [
    ("admin", "admin"),
    ("admin", "password"),
    ("admin", "12345"),
    ("root", "root"),
    ("root", "12345"),
    ("homeowner", "SecureP@ssw0rd2024!"),
]

FIRMWARE_DB = {
    "0.9.4": {"status": "vulnerable", "cves": ["CVE-2023-1234", "CVE-2023-5678"], "risk": "CRITICAL"},
    "1.0.2": {"status": "outdated", "cves": [], "risk": "HIGH"},
    "1.5.1": {"status": "outdated", "cves": [], "risk": "MEDIUM"},
    "2.4.0": {"status": "up-to-date", "cves": [], "risk": "LOW"},
}

HISTORY_FILE = "scan_history.json"
CURRENT_RESULTS_FILE = "scan_results.json"


def check_port(ip, port, timeout=1):
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
    for username, password in creds_list:
        try:
            url = f"http://{ip}:{http_port}/info"
            response = requests.get(
                url,
                auth=HTTPBasicAuth(username, password),
                timeout=2
            )
            
            if response.status_code == 200:
                return [{
                    "username": username,
                    "password": password,
                    "strength": "weak" if password in ["admin", "password", "12345", ""] else "moderate"
                }]
        except:
            pass
    return []


def get_device_info(ip, http_port, username, password):
    """Retrieve device information"""
    try:
        url = f"http://{ip}:{http_port}/info"
        response = requests.get(
            url,
            auth=HTTPBasicAuth(username, password),
            timeout=2
        )
        
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None


def calculate_health_score(device_data):
    """Calculate health score"""
    score = 100
    risks = []
    
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") == "vulnerable":
        score -= 50
        risks.append({"severity": "CRITICAL", "issue": "Vulnerable firmware with known CVEs", "impact": -50})
    elif firmware.get("status") == "outdated":
        score -= 30
        risks.append({"severity": "HIGH", "issue": "Outdated firmware", "impact": -30})
    
    creds = device_data.get("credentials", {})
    if creds.get("strength") == "weak":
        score -= 40
        risks.append({"severity": "CRITICAL", "issue": "Weak or default credentials", "impact": -40})
    elif creds.get("strength") == "moderate":
        score -= 20
        risks.append({"severity": "MEDIUM", "issue": "Moderate password strength", "impact": -20})
    
    if device_data.get("exposed_to_internet"):
        score -= 50
        risks.append({"severity": "CRITICAL", "issue": "Device exposed to internet", "impact": -50})
    
    score = max(0, score)
    
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


def generate_recommendations(device_data):
    """Generate recommendations"""
    recommendations = []
    
    model_name = "your camera"
    if device_data.get("device_info"):
        model_name = device_data["device_info"].get("model", "your camera")
    
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") in ["vulnerable", "outdated"]:
        recommendations.append({
            "priority": "HIGH" if firmware.get("status") == "vulnerable" else "MEDIUM",
            "action": "Update firmware",
            "steps": [f"1. Visit manufacturer website for {model_name}", "2. Download latest firmware"]
        })
    
    creds = device_data.get("credentials", {})
    if creds.get("strength") in ["weak", "moderate"]:
        recommendations.append({
            "priority": "CRITICAL" if creds.get("strength") == "weak" else "MEDIUM",
            "action": "Change password",
            "steps": ["1. Access camera admin panel", "2. Change default password"]
        })
    
    return recommendations


def scan_single_device(target):
    """Scan a single device and return status"""
    device_result = {
        "name": target['name'],
        "ip": target['ip'],  # Internal Docker network IP
        "container_name": target.get('container', 'N/A'),
        "scan_time": datetime.now().isoformat(),
        "status": "offline",  # Will change to 'online' if reachable
        "open_ports": [],
        "credentials": None,
        "default_credentials_detected": False,
        "detected_username": None,
        "detected_password": None,
        "device_info": None,
        "firmware_info": None,
        "exposed_to_internet": False,
        "health_score": 0,
        "risk_level": "UNKNOWN",
        "identified_risks": [],
        "recommendations": []
    }
    
    # Check if device is reachable (using host_ip for port mapping)
    http_port = None
    any_port_open = False
    scan_ip = target.get('host_ip', target['ip'])  # Use host_ip for scanning via port mappings
    
    for port in target['ports']:
        if check_port(scan_ip, port):
            any_port_open = True
            service_name = "HTTP"
            risk = "MEDIUM"
            
            if port in [21, 2121]:
                service_name = "FTP"
                risk = "HIGH"
            elif port in [23, 2323, 2324]:
                service_name = "Telnet"
                risk = "CRITICAL"
            elif port in [554, 5541, 5543, 5544]:
                service_name = "RTSP"
                risk = "MEDIUM"
            elif port >= 8000:
                service_name = "HTTP"
                risk = "MEDIUM"
                
            device_result["open_ports"].append({
                "port": port,
                "service": service_name,
                "risk": risk
            })
            
            if port >= 8000:
                http_port = port
    
    if not any_port_open:
        # Device is offline
        device_result["status"] = "offline"
        device_result["risk_level"] = "OFFLINE"
        return device_result
    
    # Device is online
    device_result["status"] = "online"
    
    # Test credentials if HTTP is available
    if http_port:
        creds = test_credentials(scan_ip, http_port, COMMON_CREDS)
        if creds:
            device_result["credentials"] = creds[0]
            device_result["default_credentials_detected"] = True
            device_result["detected_username"] = creds[0]['username']
            device_result["detected_password"] = creds[0]['password']
            
            info = get_device_info(scan_ip, http_port, creds[0]['username'], creds[0]['password'])
            if info:
                device_result["device_info"] = info
                device_result["exposed_to_internet"] = info.get("exposed_to_internet", False)
                
                firmware_version = info.get("firmware")
                if firmware_version in FIRMWARE_DB:
                    device_result["firmware_info"] = FIRMWARE_DB[firmware_version]
                    device_result["firmware_info"]["version"] = firmware_version
    
    # Calculate health score
    health = calculate_health_score(device_result)
    device_result["health_score"] = health["health_score"]
    device_result["risk_level"] = health["risk_level"]
    device_result["identified_risks"] = health["risks"]
    device_result["recommendations"] = generate_recommendations(device_result)
    
    return device_result


def save_to_history(scan_data):
    """Save scan to history file"""
    history = []
    
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
        except:
            history = []
    
    # Add new scan to history
    history.append({
        "scan_id": len(history) + 1,
        "timestamp": datetime.now().isoformat(),
        "devices": scan_data
    })
    
    # Keep only last 50 scans
    history = history[-50:]
    
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)


@app.route('/api/scan', methods=['POST'])
def scan_network():
    """Perform a full network scan"""
    results = []
    
    for target in TARGETS:
        device_result = scan_single_device(target)
        results.append(device_result)
    
    # Save current results
    with open(CURRENT_RESULTS_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Save to history
    save_to_history(results)
    
    return jsonify({
        "success": True,
        "scan_time": datetime.now().isoformat(),
        "devices": results,
        "summary": {
            "total": len(results),
            "online": len([d for d in results if d['status'] == 'online']),
            "offline": len([d for d in results if d['status'] == 'offline']),
            "critical": len([d for d in results if d['risk_level'] == 'CRITICAL']),
            "high": len([d for d in results if d['risk_level'] == 'HIGH']),
            "medium": len([d for d in results if d['risk_level'] == 'MEDIUM']),
            "low": len([d for d in results if d['risk_level'] == 'LOW'])
        }
    })


@app.route('/api/devices', methods=['GET'])
def get_devices():
    """Get current device status"""
    if os.path.exists(CURRENT_RESULTS_FILE):
        with open(CURRENT_RESULTS_FILE, 'r') as f:
            devices = json.load(f)
        return jsonify({"success": True, "devices": devices})
    
    return jsonify({"success": False, "message": "No scan data available. Please run a scan first."})


@app.route('/api/history', methods=['GET'])
def get_history():
    """Get scan history"""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)
        return jsonify({"success": True, "history": history})
    
    return jsonify({"success": True, "history": []})


@app.route('/api/device/<device_name>', methods=['GET'])
def get_device_details(device_name):
    """Get details for a specific device"""
    if os.path.exists(CURRENT_RESULTS_FILE):
        with open(CURRENT_RESULTS_FILE, 'r') as f:
            devices = json.load(f)
        
        for device in devices:
            if device['name'] == device_name or device['name'].replace(' ', '-') == device_name:
                return jsonify({"success": True, "device": device})
    
    return jsonify({"success": False, "message": "Device not found"})


@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check"""
    return jsonify({
        "success": True,
        "message": "SmartCam Shield Scanner API is running",
        "timestamp": datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("Starting SmartCam Shield Scanner API...")
    print("API will be available at http://localhost:5000")
    print("\nEndpoints:")
    print("  POST /api/scan - Run a new scan")
    print("  GET  /api/devices - Get current devices")
    print("  GET  /api/history - Get scan history")
    print("  GET  /api/device/<name> - Get device details")
    print("  GET  /api/health - Health check")
    print("\nPress Ctrl+C to stop\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
