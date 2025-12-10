#!/usr/bin/env python3
"""
SmartCam Shield - Live Network Scanner API
Provides REST API for real-time scanning and device status monitoring
"""

# Import Flask web framework components
from flask import Flask, jsonify, request, send_file  # Core Flask for API endpoints
from flask_cors import CORS  # Enable cross-origin requests from React frontend

# Import networking and HTTP utilities
import socket  # Low-level network operations (port scanning)
import requests  # HTTP client for camera communication
from requests.auth import HTTPBasicAuth  # Basic authentication for camera interfaces

# Import data handling utilities
import json  # JSON serialization for file storage
from datetime import datetime  # Timestamping for scan history
import os  # File system operations

# ===== OPTIONAL MODULE IMPORTS =====
# Import alert system module with graceful fallback
try:
    from alert_manager import alert_manager  # Email/SMS notification system
    ALERTS_ENABLED = True  # Flag to enable alert features in API
except ImportError:
    ALERTS_ENABLED = False  # Disable alert endpoints if module missing
    print("Warning: Alert system not available. Install flask-mail and twilio.")

# Import PDF generation module with graceful fallback
try:
    from pdf_generator import pdf_generator  # Professional report generation
    PDF_ENABLED = True  # Flag to enable PDF export endpoints
except ImportError:
    PDF_ENABLED = False  # Disable PDF endpoints if module missing
    print("Warning: PDF generation not available. Install reportlab.")

# ===== FLASK APPLICATION SETUP =====
app = Flask(__name__)  # Initialize Flask application
CORS(app)  # Enable CORS to allow React frontend on different port to access API

# Initialize alert manager with Flask app context if available
if ALERTS_ENABLED:
    alert_manager.init_app(app)  # Setup Flask-Mail and Twilio configuration

# ===== CAMERA TARGET CONFIGURATION =====
# Define cameras to scan - includes container IPs for Docker environment
# host_ip is used for port mapping (localhost), ip is container internal IP
TARGETS = [
    {"name": "Camera 1 - Vulnerable", "ip": "172.25.0.11", "host_ip": "127.0.0.1", "ports": [8081, 5541], "container": "smartcam-demo-cam1"},
    {"name": "Camera 2 - Secure", "ip": "172.25.0.12", "host_ip": "127.0.0.1", "ports": [8082], "container": "smartcam-demo-cam2"},
    {"name": "Camera 3 - Critical", "ip": "172.25.0.13", "host_ip": "127.0.0.1", "ports": [8083, 2121, 2323, 5543], "container": "smartcam-demo-cam3"},
    {"name": "Camera 4 - Moderate", "ip": "172.25.0.14", "host_ip": "127.0.0.1", "ports": [8084, 2324, 5544], "container": "smartcam-demo-cam4"},
]

# Common weak credentials for vulnerability testing
COMMON_CREDS = [
    ("admin", "admin"),  # Most common default
    ("admin", "password"),  # Second most common
    ("admin", "12345"),  # Numeric weak password
    ("root", "root"),  # Linux-style default
    ("root", "12345"),  # Root with numeric password
    ("homeowner", "SecureP@ssw0rd2024!"),  # Strong password for testing
]

# Firmware vulnerability database - maps versions to security status
FIRMWARE_DB = {
    "0.9.4": {"status": "vulnerable", "cves": ["CVE-2023-1234", "CVE-2023-5678"], "risk": "CRITICAL"},
    "1.0.2": {"status": "outdated", "cves": [], "risk": "HIGH"},
    "1.5.1": {"status": "outdated", "cves": [], "risk": "MEDIUM"},
    "2.4.0": {"status": "up-to-date", "cves": [], "risk": "LOW"},
}

# ===== FILE STORAGE CONFIGURATION =====
HISTORY_FILE = "scan_history.json"  # Stores historical scan results over time
CURRENT_RESULTS_FILE = "scan_results.json"  # Stores most recent scan results
GROUPS_FILE = "camera_groups.json"  # Stores camera group assignments


def check_port(ip, port, timeout=1):
    """
    Check if a TCP port is open on target device
    Uses socket connection attempt with short timeout
    Returns True if port is accessible, False otherwise
    """
    try:
        # Create TCP socket for connection test
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)  # 1 second timeout for API responsiveness
        
        # Attempt connection - returns 0 if successful
        result = sock.connect_ex((ip, port))
        sock.close()  # Always close to free resources
        
        return result == 0  # Port is open if connection succeeded
    except:
        # Handle any network errors (unreachable, permission denied, etc.)
        return False


def test_credentials(ip, http_port, creds_list):
    """
    Test list of credentials against camera HTTP interface
    Returns first valid credential pair found, or empty list
    Assesses password strength for vulnerability reporting
    """
    # Try each username/password combination
    for username, password in creds_list:
        try:
            # Attempt authenticated request to camera info endpoint
            url = f"http://{ip}:{http_port}/info"
            response = requests.get(
                url,
                auth=HTTPBasicAuth(username, password),  # HTTP Basic Auth
                timeout=2  # Short timeout for API speed
            )
            
            # If authentication successful, return credentials with strength assessment
            if response.status_code == 200:
                return [{
                    "username": username,
                    "password": password,
                    # Classify password strength based on common weak patterns
                    "strength": "weak" if password in ["admin", "password", "12345", ""] else "moderate"
                }]
        except:
            # Continue to next credential if request fails
            pass
    
    return []  # No valid credentials found


def get_device_info(ip, http_port, username, password):
    """
    Retrieve device metadata from authenticated camera endpoint
    Queries /info endpoint for model, firmware, configuration
    Returns device info dictionary or None if request fails
    """
    try:
        # Query camera info endpoint with authentication
        url = f"http://{ip}:{http_port}/info"
        response = requests.get(
            url,
            auth=HTTPBasicAuth(username, password),  # Use found credentials
            timeout=2
        )
        
        # Parse and return JSON response if successful
        if response.status_code == 200:
            return response.json()  # Device info as dictionary
    except:
        # Handle request failures (timeout, connection error, invalid JSON)
        pass
    
    return None  # Return None if unable to retrieve info


def calculate_health_score(device_data):
    """
    Calculate device security health score (0-100, higher is better)
    Evaluates firmware status, credential strength, and internet exposure
    Returns score, risk level, and detailed risk breakdown
    """
    score = 100  # Start with perfect score
    risks = []  # Collect identified security issues
    
    # FIRMWARE VULNERABILITY ASSESSMENT (-30 to -50 points)
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") == "vulnerable":
        score -= 50  # Major penalty for known CVEs
        risks.append({"severity": "CRITICAL", "issue": "Vulnerable firmware with known CVEs", "impact": -50})
    elif firmware.get("status") == "outdated":
        score -= 30  # Moderate penalty for outdated firmware
        risks.append({"severity": "HIGH", "issue": "Outdated firmware", "impact": -30})
    
    # CREDENTIAL STRENGTH ASSESSMENT (-20 to -40 points)
    creds = device_data.get("credentials", {})
    if creds.get("strength") == "weak":
        score -= 40  # Large penalty for weak/default passwords
        risks.append({"severity": "CRITICAL", "issue": "Weak or default credentials", "impact": -40})
    elif creds.get("strength") == "moderate":
        score -= 20  # Smaller penalty for moderate passwords
        risks.append({"severity": "MEDIUM", "issue": "Moderate password strength", "impact": -20})
    
    # INTERNET EXPOSURE ASSESSMENT (-50 points)
    if device_data.get("exposed_to_internet"):
        score -= 50  # Severe penalty for public exposure
        risks.append({"severity": "CRITICAL", "issue": "Device exposed to internet", "impact": -50})
    
    score = max(0, score)  # Ensure score doesn't go negative
    
    # MAP SCORE TO RISK CATEGORY
    if score >= 80:
        risk_level = "LOW"  # Excellent security
    elif score >= 60:
        risk_level = "MEDIUM"  # Acceptable security
    elif score >= 40:
        risk_level = "HIGH"  # Poor security
    else:
        risk_level = "CRITICAL"  # Dangerous security
    
    # Return comprehensive assessment
    return {
        "health_score": score,  # Numerical score (0-100)
        "risk_level": risk_level,  # Category (CRITICAL/HIGH/MEDIUM/LOW)
        "risks": risks  # Detailed list of issues
    }


def generate_recommendations(device_data):
    """
    Generate prioritized remediation recommendations based on scan findings
    Provides actionable steps to improve device security
    Returns list of recommendation objects with priority and steps
    """
    recommendations = []  # Collect all recommendations
    
    # Extract device model name for personalized recommendations
    model_name = "your camera"
    if device_data.get("device_info"):
        model_name = device_data["device_info"].get("model", "your camera")
    
    # FIRMWARE UPDATE RECOMMENDATIONS
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") in ["vulnerable", "outdated"]:
        recommendations.append({
            "priority": "HIGH" if firmware.get("status") == "vulnerable" else "MEDIUM",
            "action": "Update firmware",  # Main remediation action
            "steps": [f"1. Visit manufacturer website for {model_name}", "2. Download latest firmware"]
        })
    
    # PASSWORD SECURITY RECOMMENDATIONS
    creds = device_data.get("credentials", {})
    if creds.get("strength") in ["weak", "moderate"]:
        recommendations.append({
            "priority": "CRITICAL" if creds.get("strength") == "weak" else "MEDIUM",
            "action": "Change password",
            "steps": ["1. Access camera admin panel", "2. Change default password"]
        })
    
    return recommendations  # Return prioritized action list


def scan_single_device(target):
    """
    Perform comprehensive security scan of a single camera device
    Tests ports, credentials, retrieves device info, calculates health score
    Returns complete device security profile with recommendations
    """
    # Initialize result structure with default/empty values
    device_result = {
        "name": target['name'],  # Camera identifier
        "ip": target['ip'],  # Internal Docker network IP
        "container_name": target.get('container', 'N/A'),  # Container name for Docker management
        "scan_time": datetime.now().isoformat(),  # Timestamp for this scan
        "status": "offline",  # Connectivity status (will update to 'online' if reachable)
        "open_ports": [],  # List of accessible ports with risk levels
        "credentials": None,  # Authenticated credentials (if found)
        "default_credentials_detected": False,  # Flag for weak password detection
        "detected_username": None,  # Successfully authenticated username
        "detected_password": None,  # Successfully authenticated password
        "device_info": None,  # Device metadata (model, firmware, etc.)
        "firmware_info": None,  # Firmware vulnerability details
        "exposed_to_internet": False,  # Public accessibility flag
        "health_score": 0,  # Security score (0-100)
        "risk_level": "UNKNOWN",  # Overall risk category
        "identified_risks": [],  # Detailed list of security issues
        "recommendations": []  # Remediation actions
    }
    
    # PORT SCANNING PHASE
    # Check each configured port for accessibility
    http_port = None  # Track HTTP port for credential testing
    any_port_open = False  # Flag to determine if device is reachable
    scan_ip = target.get('host_ip', target['ip'])  # Use host_ip for Docker port mappings
    
    # Iterate through target ports and identify services
    for port in target['ports']:
        if check_port(scan_ip, port):
            any_port_open = True  # Device has at least one open port
            
            # SERVICE IDENTIFICATION AND RISK CLASSIFICATION
            # Default to HTTP with medium risk
            service_name = "HTTP"
            risk = "MEDIUM"
            
            # Identify dangerous services by port number
            if port in [21, 2121]:
                service_name = "FTP"  # Unencrypted file transfer
                risk = "HIGH"
            elif port in [23, 2323, 2324]:
                service_name = "Telnet"  # Unencrypted remote access
                risk = "CRITICAL"  # Most dangerous service
            elif port in [554, 5541, 5543, 5544]:
                service_name = "RTSP"  # Streaming protocol
                risk = "MEDIUM"
            elif port >= 8000:
                service_name = "HTTP"  # Web interface
                risk = "MEDIUM"
            
            # Record open port with service details
            device_result["open_ports"].append({
                "port": port,
                "service": service_name,
                "risk": risk
            })
            
            # Save HTTP port for authentication testing
            if port >= 8000:
                http_port = port
    
    # OFFLINE DEVICE HANDLING
    # If no ports are open, device is unreachable
    if not any_port_open:
        device_result["status"] = "offline"
        device_result["risk_level"] = "OFFLINE"  # Special status for offline devices
        return device_result  # Skip further testing
    
    # Device is reachable - proceed with security testing
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
    """
    Persist scan results to historical log file
    Maintains rolling history of last 50 scans for trend analysis
    Each entry includes scan ID, timestamp, and full device data
    """
    history = []  # Initialize empty history
    
    # Load existing history if file exists
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
        except:
            # If file is corrupted or invalid JSON, start fresh
            history = []
    
    # Append new scan entry with unique ID and timestamp
    history.append({
        "scan_id": len(history) + 1,  # Sequential scan identifier
        "timestamp": datetime.now().isoformat(),  # When this scan occurred
        "devices": scan_data  # Full device scan results
    })
    
    # Limit history to last 50 scans to prevent file bloat
    history = history[-50:]  # Keep most recent 50 entries
    
    # Write updated history back to file with formatting
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)


# ===== API ENDPOINTS =====

@app.route('/api/scan', methods=['POST'])
def scan_network():
    """
    POST /api/scan - Trigger full network scan of all configured cameras
    Scans each target device, calculates health scores, generates recommendations
    Returns: JSON with scan results, timestamp, and summary statistics
    """
    results = []  # Collect results for all devices
    
    # Scan each configured camera target
    for target in TARGETS:
        device_result = scan_single_device(target)  # Perform comprehensive scan
        results.append(device_result)
    
    # Persist current scan results to file for dashboard consumption
    with open(CURRENT_RESULTS_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Archive scan to historical log
    save_to_history(results)
    
    # Return scan results with summary statistics
    return jsonify({
        "success": True,
        "scan_time": datetime.now().isoformat(),
        "devices": results,  # Full device details
        "summary": {  # Aggregate statistics for dashboard
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
    """
    GET /api/devices - Retrieve most recent scan results for all devices
    Returns cached scan data from last scan operation
    Used by dashboard for real-time device status display
    """
    # Check if scan results exist from previous scan
    if os.path.exists(CURRENT_RESULTS_FILE):
        with open(CURRENT_RESULTS_FILE, 'r') as f:
            devices = json.load(f)  # Load cached results
        return jsonify({"success": True, "devices": devices})
    
    # No scan data available - user needs to run first scan
    return jsonify({"success": False, "message": "No scan data available. Please run a scan first."})


@app.route('/api/history', methods=['GET'])
def get_history():
    """
    GET /api/history - Retrieve historical scan data for trend analysis
    Returns up to 50 most recent scans with timestamps
    Used by dashboard for historical charts and comparison
    """
    # Check if history file exists
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)  # Load historical scan entries
        return jsonify({"success": True, "history": history})
    
    # Return empty history if file doesn't exist yet
    return jsonify({"success": True, "history": []})


@app.route('/api/device/<device_name>', methods=['GET'])
def get_device_details(device_name):
    """
    GET /api/device/<device_name> - Retrieve detailed information for specific device
    Accepts device name with spaces or dashes (e.g., "Camera 1" or "Camera-1")
    Used by device detail modal for comprehensive security information
    """
    # Load current scan results
    if os.path.exists(CURRENT_RESULTS_FILE):
        with open(CURRENT_RESULTS_FILE, 'r') as f:
            devices = json.load(f)
        
        # Search for device by name (handle both space and dash variations)
        for device in devices:
            if device['name'] == device_name or device['name'].replace(' ', '-') == device_name:
                return jsonify({"success": True, "device": device})
    
    # Device not found in current scan results
    return jsonify({"success": False, "message": "Device not found"})


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    GET /api/health - API health check endpoint
    Verifies that Flask server is running and responsive
    Used by frontend to confirm backend connectivity
    """
    return jsonify({
        "success": True,
        "message": "SmartCam Shield Scanner API is running",
        "timestamp": datetime.now().isoformat(),  # Server time
        "features": {  # Feature availability flags
            "alerts": ALERTS_ENABLED,  # Email/SMS notifications available
            "pdf_export": PDF_ENABLED  # PDF report generation available
        }
    })


# ===== ALERT MANAGEMENT ENDPOINTS =====
# Email and SMS notification configuration and testing

@app.route('/api/alerts/settings', methods=['GET'])
def get_alert_settings():
    """
    GET /api/alerts/settings - Retrieve current alert configuration
    Returns email recipients, SMS recipients, thresholds, and triggers
    Returns 503 if alert system is not installed
    """
    # Check if alert module is available
    if not ALERTS_ENABLED:
        return jsonify({"success": False, "message": "Alerts not enabled"}), 503
    
    # Return current alert configuration
    return jsonify({
        "success": True,
        "settings": alert_manager.alert_settings  # Email/SMS config, thresholds, triggers
    })


@app.route('/api/alerts/settings', methods=['POST'])
def update_alert_settings():
    """
    POST /api/alerts/settings - Update alert configuration
    Accepts JSON with email recipients, SMS recipients, thresholds, triggers
    Persists settings to alert_settings.json file
    """
    # Check if alert module is available
    if not ALERTS_ENABLED:
        return jsonify({"success": False, "message": "Alerts not enabled"}), 503
    
    # Extract settings from request body
    settings = request.get_json()
    
    # Save updated configuration to file
    alert_manager.save_alert_settings(settings)
    
    # Confirm successful update
    return jsonify({
        "success": True,
        "message": "Alert settings updated",
        "settings": settings  # Echo back saved settings
    })


@app.route('/api/alerts/test', methods=['POST'])
def test_alert():
    """
    POST /api/alerts/test - Send test notification to verify configuration
    Accepts JSON with 'type' field ('email' or 'sms')
    Tests actual delivery to configured recipients
    """
    # Check if alert module is available
    if not ALERTS_ENABLED:
        return jsonify({"success": False, "message": "Alerts not enabled"}), 503
    
    # Extract alert type from request
    data = request.get_json()
    alert_type = data.get('type', 'email')  # Default to email
    
    # Send appropriate test notification
    if alert_type == 'email':
        # Send test email to all configured recipients
        result = alert_manager.send_email_alert(
            "Test Alert",  # Subject line
            "This is a test alert from SmartCam Shield.\n\nIf you received this, email alerts are working correctly!"
        )
    elif alert_type == 'sms':
        # Send test SMS to all configured phone numbers
        result = alert_manager.send_sms_alert(
            "Test alert from SmartCam Shield. SMS notifications are working!"  # Message body
        )
    else:
        # Invalid alert type specified
        return jsonify({"success": False, "message": "Invalid alert type"}), 400
    
    # Return result of test notification
    return jsonify(result)


# ===== PDF EXPORT ENDPOINTS =====
# Professional security report generation with ReportLab

@app.route('/api/export/pdf', methods=['POST'])
def export_pdf():
    """
    POST /api/export/pdf - Generate professional PDF security report
    Accepts JSON with 'devices' array and 'options' object
    Creates comprehensive report with executive summary, statistics, device details
    Returns PDF file for download
    """
    # Check if PDF generation module is available
    if not PDF_ENABLED:
        return jsonify({"success": False, "message": "PDF export not enabled"}), 503
    
    try:
        # Extract request parameters
        data = request.get_json()
        devices = data.get('devices', [])  # Specific devices to include
        options = data.get('options', {})  # Report sections to include
        
        # If no devices specified, use all from last scan
        if not devices:
            try:
                with open(CURRENT_RESULTS_FILE, 'r') as f:
                    devices = json.load(f)  # Load all current devices
            except FileNotFoundError:
                # No scan data available
                return jsonify({"success": False, "message": "No devices to export"}), 404
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'reports/security_report_{timestamp}.pdf'
        
        # Ensure reports directory exists
        os.makedirs('reports', exist_ok=True)
        
        # Generate PDF using pdf_generator module
        result = pdf_generator.generate_security_report(devices, filename, options)
        
        # Send generated PDF file to client
        return send_file(
            filename,  # File path
            mimetype='application/pdf',  # Content type
            as_attachment=True,  # Trigger download
            download_name=f'SmartCam_Security_Report_{timestamp}.pdf'  # Downloaded filename
        )
    
    except Exception as e:
        # Handle any errors during PDF generation
        return jsonify({"success": False, "message": f"PDF generation failed: {str(e)}"}), 500


# ===== GROUP MANAGEMENT ENDPOINTS =====
# Camera organization with colored groups/tags

def load_groups():
    """
    Load camera group definitions from JSON file
    Groups allow organizing cameras by location, function, or risk level
    Returns empty list if file doesn't exist
    """
    try:
        with open(GROUPS_FILE, 'r') as f:
            return json.load(f)  # Return groups array
    except FileNotFoundError:  # File doesn't exist yet
        return []  # Return empty array if no groups exist yet


def save_groups(groups):
    """
    Persist camera groups to JSON file
    Writes formatted JSON with 2-space indentation
    """
    with open(GROUPS_FILE, 'w') as f:
        json.dump(groups, f, indent=2)  # Save with pretty formatting


@app.route('/api/groups', methods=['GET'])
def get_groups():
    """
    GET /api/groups - Retrieve all camera groups
    Returns array of group objects with IDs, names, colors, and assigned cameras
    Used by dashboard to display group filters and organization
    """
    groups = load_groups()  # Load from file
    return jsonify({
        "success": True,
        "groups": groups  # Array of group objects
    })


@app.route('/api/groups', methods=['POST'])
def create_group():
    """
    POST /api/groups - Create new camera group
    Accepts JSON with name, description, color, and initial camera list
    Generates unique ID and timestamps the group
    Returns created group object
    """
    # Extract group details from request
    data = request.get_json()
    
    # Load existing groups
    groups = load_groups()
    
    # Create new group object with defaults
    new_group = {
        "id": data.get('id') or f"group_{len(groups) + 1}",  # Auto-generate ID if not provided
        "name": data.get('name', 'New Group'),  # Group display name
        "description": data.get('description', ''),  # Optional description
        "color": data.get('color', '#3b82f6'),  # Color for visual identification (default blue)
        "cameras": data.get('cameras', []),  # Initial camera assignments
        "created_at": datetime.now().isoformat()  # Creation timestamp
    }
    
    # Add to groups array and persist
    groups.append(new_group)
    save_groups(groups)
    
    # Return created group
    return jsonify({
        "success": True,
        "message": "Group created",
        "group": new_group
    })


@app.route('/api/groups/<group_id>', methods=['PUT'])
def update_group(group_id):
    """
    PUT /api/groups/<group_id> - Update existing group
    Accepts JSON with updated name, description, color, or camera assignments
    Adds update timestamp to track changes
    """
    # Extract updated fields from request
    data = request.get_json()
    groups = load_groups()
    
    # Find and update matching group
    for group in groups:
        if group['id'] == group_id:
            # Update fields (preserve existing if not provided)
            group['name'] = data.get('name', group['name'])
            group['description'] = data.get('description', group['description'])
            group['color'] = data.get('color', group['color'])
            group['cameras'] = data.get('cameras', group['cameras'])
            group['updated_at'] = datetime.now().isoformat()  # Track last modification
            
            # Persist changes
            save_groups(groups)
            
            return jsonify({
                "success": True,
                "message": "Group updated",
                "group": group
            })
    
    # Group not found
    return jsonify({"success": False, "message": "Group not found"}), 404


@app.route('/api/groups/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    """
    DELETE /api/groups/<group_id> - Remove group
    Deletes group but does not affect cameras (they simply become ungrouped)
    """
    groups = load_groups()
    
    # Filter out the group to delete
    groups = [g for g in groups if g['id'] != group_id]
    save_groups(groups)
    
    return jsonify({
        "success": True,
        "message": "Group deleted"
    })


@app.route('/api/groups/<group_id>/cameras', methods=['POST'])
def add_camera_to_group(group_id):
    """
    POST /api/groups/<group_id>/cameras - Add cameras to group
    Accepts JSON with 'camera_ids' array
    Prevents duplicate assignments (cameras added only if not already in group)
    """
    # Extract camera IDs from request
    data = request.get_json()
    camera_ids = data.get('camera_ids', [])
    
    groups = load_groups()
    
    # Find target group
    for group in groups:
        if group['id'] == group_id:
            # Add each camera if not already present
            for camera_id in camera_ids:
                if camera_id not in group['cameras']:
                    group['cameras'].append(camera_id)  # Add to group
            
            # Persist changes
            save_groups(groups)
            
            return jsonify({
                "success": True,
                "message": f"{len(camera_ids)} camera(s) added to group",
                "group": group
            })
    
    # Group not found
    return jsonify({"success": False, "message": "Group not found"}), 404


@app.route('/api/groups/<group_id>/cameras/<camera_id>', methods=['DELETE'])
def remove_camera_from_group(group_id, camera_id):
    """
    DELETE /api/groups/<group_id>/cameras/<camera_id> - Remove camera from group
    Unassigns specific camera from group (camera still exists, just becomes ungrouped)
    Returns 404 if group not found or camera not in group
    """
    groups = load_groups()
    
    # Find target group
    for group in groups:
        if group['id'] == group_id:
            # Check if camera is in group
            if camera_id in group['cameras']:
                group['cameras'].remove(camera_id)  # Remove camera from group
                save_groups(groups)  # Persist changes
                
                return jsonify({
                    "success": True,
                    "message": "Camera removed from group",
                    "group": group
                })
            else:
                # Camera not found in this group
                return jsonify({"success": False, "message": "Camera not in group"}), 404
    
    # Group not found
    return jsonify({"success": False, "message": "Group not found"}), 404


# ===== APPLICATION ENTRY POINT =====
# Run Flask development server when script is executed directly
if __name__ == '__main__':
    # Print startup banner with API documentation
    print("Starting SmartCam Shield Scanner API...")
    print("API will be available at http://localhost:5000")
    print("\nEndpoints:")
    
    # Core scanning endpoints
    print("  POST /api/scan - Run a new scan")
    print("  GET  /api/devices - Get current devices")
    print("  GET  /api/history - Get scan history")
    print("  GET  /api/device/<name> - Get device details")
    print("  GET  /api/health - Health check")
    
    # Alert management endpoints (if enabled)
    print("\n  === Alert Management ===")
    print("  GET  /api/alerts/settings - Get alert settings")
    print("  POST /api/alerts/settings - Update alert settings")
    print("  POST /api/alerts/test - Send test alert")
    
    # PDF export endpoints (if enabled)
    print("\n  === PDF Export ===")
    print("  POST /api/export/pdf - Generate PDF report")
    
    # Group management endpoints
    print("\n  === Group Management ===")
    print("  GET    /api/groups - Get all groups")
    print("  POST   /api/groups - Create group")
    print("  PUT    /api/groups/<id> - Update group")
    print("  DELETE /api/groups/<id> - Delete group")
    print("  POST   /api/groups/<id>/cameras - Add cameras to group")
    print("  DELETE /api/groups/<id>/cameras/<cam_id> - Remove camera from group")
    
    print("\nPress Ctrl+C to stop\n")
    
    # Start Flask development server
    # host='0.0.0.0' - Accept connections from any network interface
    # port=5000 - Standard development port
    # debug=True - Enable auto-reload and detailed error pages
    app.run(host='0.0.0.0', port=5000, debug=True)
