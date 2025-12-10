#!/usr/bin/env python3
"""
SmartCam Shield - Simple Network Scanner
Discovers cameras on localhost and tests for vulnerabilities
"""

# Import required libraries for network operations, HTTP requests, and data handling
import socket  # For low-level network operations (port scanning)
import requests  # For HTTP requests to camera web interfaces
from requests.auth import HTTPBasicAuth  # For basic authentication
import json  # For saving/loading scan results
from datetime import datetime  # For timestamping scan results

# ===== CONFIGURATION =====
# Define target cameras to scan - typically discovered via network scan
# Format: name for identification, IP address, and ports to check
TARGETS = [
    {"name": "Camera 1", "ip": "127.0.0.1", "ports": [8081, 5541]},  # Basic camera with HTTP and RTSP
    {"name": "Camera 2", "ip": "127.0.0.1", "ports": [8082]},  # Secure camera (HTTP only)
    {"name": "Camera 3", "ip": "127.0.0.1", "ports": [8083, 2121, 2323, 5543]},  # Critical - multiple insecure services
    {"name": "Camera 4", "ip": "127.0.0.1", "ports": [8084, 2324, 5544]},  # Moderate risk camera
]

# Common weak credentials to test against camera interfaces
# These are frequently used default/weak passwords found in IoT devices
COMMON_CREDS = [
    ("admin", "admin"),  # Most common default
    ("admin", "password"),  # Second most common
    ("admin", "12345"),  # Numeric weak password
    ("root", "root"),  # Linux-style default
    ("root", "12345"),  # Root with numeric password
    ("admin", ""),  # Empty password (very insecure)
    ("user", "user"),  # Generic user account
    ("guest", "guest"),  # Guest account
    ("homeowner", "SecureP@ssw0rd2024!"),  # Strong password for testing secure camera
]

# Firmware vulnerability database - maps versions to known security issues
# Status indicates patch level, CVEs are known vulnerabilities, risk is severity
FIRMWARE_DB = {
    "0.9.4": {"status": "vulnerable", "cves": ["CVE-2023-1234", "CVE-2023-5678"], "risk": "CRITICAL"},
    "1.0.2": {"status": "outdated", "cves": [], "risk": "HIGH"},  # No CVEs but outdated
    "1.5.1": {"status": "outdated", "cves": [], "risk": "MEDIUM"},  # Moderately outdated
    "2.4.0": {"status": "up-to-date", "cves": [], "risk": "LOW"},  # Latest secure version
}

# Port-to-service risk mapping - identifies dangerous open ports
# Maps port numbers to service name, risk level, and security implications
PORT_RISKS = {
    21: {"service": "FTP", "risk": "HIGH", "description": "Unencrypted file transfer"},
    23: {"service": "Telnet", "risk": "CRITICAL", "description": "Unencrypted remote access"},
    80: {"service": "HTTP", "risk": "LOW", "description": "Web interface (unencrypted)"},
    554: {"service": "RTSP", "risk": "MEDIUM", "description": "Streaming protocol"},
}


def check_port(ip, port, timeout=2):
    """
    Check if a specific port is open on the target IP address
    Uses TCP socket connection to determine port availability
    Returns True if port is open, False otherwise
    """
    try:
        # Create a TCP socket for port checking
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)  # Set connection timeout to avoid hanging
        
        # Attempt connection - returns 0 if successful, error code otherwise
        result = sock.connect_ex((ip, port))
        sock.close()  # Always close socket to free resources
        
        return result == 0  # Port is open if connection succeeded
    except:
        # Handle any network errors (unreachable host, permission denied, etc.)
        return False


def test_credentials(ip, http_port, creds_list):
    """
    Test a list of username/password combinations against camera HTTP interface
    Attempts authentication with each credential pair until one succeeds
    Returns list of valid credentials with strength assessment
    """
    found_creds = []  # Store successfully authenticated credentials
    
    # Iterate through each username/password combination
    for username, password in creds_list:
        try:
            # Construct URL to camera info endpoint
            url = f"http://{ip}:{http_port}/info"
            
            # Send authenticated GET request to camera
            response = requests.get(
                url,
                auth=HTTPBasicAuth(username, password),  # HTTP Basic Auth
                timeout=3  # 3 second timeout to avoid hanging
            )
            
            # Status 200 indicates successful authentication
            if response.status_code == 200:
                # Assess password strength based on common weak patterns
                found_creds.append({
                    "username": username,
                    "password": password,
                    "strength": "weak" if password in ["admin", "password", "12345", ""] else "moderate"
                })
                print(f"  ✓ Valid credentials found: {username}:{password}")
                return found_creds  # Return immediately on first success (optimization)
        except:
            # Silently continue if request fails (connection error, timeout, etc.)
            pass
    
    return found_creds  # Return empty list if no credentials worked


def get_device_info(ip, http_port, username, password):
    """
    Retrieve detailed device information from authenticated camera endpoint
    Queries /info endpoint and parses response for model, firmware, etc.
    Returns device info dictionary or None if request fails
    """
    try:
        # Query the camera's info endpoint
        url = f"http://{ip}:{http_port}/info"
        response = requests.get(
            url,
            auth=HTTPBasicAuth(username, password),  # Use previously found credentials
            timeout=3
        )
        
        # Parse JSON response if authentication successful
        if response.status_code == 200:
            return response.json()  # Return device info as dictionary
    except:
        # Handle request failures (timeout, connection error, invalid JSON)
        pass
    
    return None  # Return None if unable to retrieve device info


def calculate_health_score(device_data):
    """
    Calculate comprehensive health/security score for a device (0-100 scale)
    Higher score indicates better security posture
    Evaluates firmware status, credentials, open ports, and internet exposure
    Returns score, risk level, and detailed risk breakdown
    """
    score = 100  # Start with perfect score and deduct for security issues
    risks = []  # Collect all identified security risks with impacts
    
    # FIRMWARE VULNERABILITY CHECK (-30 to -50 points)
    # Check if device firmware has known vulnerabilities or is outdated
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") == "vulnerable":
        score -= 50  # Major deduction for known CVEs
        risks.append({"severity": "CRITICAL", "issue": "Vulnerable firmware with known CVEs", "impact": -50})
    elif firmware.get("status") == "outdated":
        score -= 30  # Moderate deduction for outdated firmware
        risks.append({"severity": "HIGH", "issue": "Outdated firmware", "impact": -30})
    
    # CREDENTIAL STRENGTH CHECK (-20 to -40 points)
    # Evaluate the strength of device authentication credentials
    creds = device_data.get("credentials", {})
    if creds.get("strength") == "weak":
        score -= 40  # Large deduction for weak/default passwords
        risks.append({"severity": "CRITICAL", "issue": "Weak or default credentials", "impact": -40})
    elif creds.get("strength") == "moderate":
        score -= 20  # Smaller deduction for moderate passwords
        risks.append({"severity": "MEDIUM", "issue": "Moderate password strength", "impact": -20})
    
    # INSECURE SERVICES CHECK (-15 points per service)
    # Scan open ports for dangerous/unencrypted services
    insecure_count = 0
    for port_data in device_data.get("open_ports", []):
        risk_level = port_data.get("risk", "LOW")
        if risk_level in ["CRITICAL", "HIGH"]:
            insecure_count += 1
            score -= 15  # Deduct for each insecure service (FTP, Telnet, etc.)
            risks.append({
                "severity": risk_level,
                "issue": f"Insecure service: {port_data['service']} on port {port_data['port']}",
                "impact": -15
            })
    
    # INTERNET EXPOSURE CHECK (-50 points)
    # Major security risk if device is accessible from public internet
    if device_data.get("exposed_to_internet"):
        score -= 50  # Severe deduction for internet exposure
        risks.append({"severity": "CRITICAL", "issue": "Device exposed to internet", "impact": -50})
    
    score = max(0, score)  # Ensure score doesn't go below 0
    
    # DETERMINE OVERALL RISK CATEGORY
    # Map numerical score to human-readable risk level
    if score >= 80:
        risk_level = "LOW"  # Excellent security (80-100)
    elif score >= 60:
        risk_level = "MEDIUM"  # Acceptable security (60-79)
    elif score >= 40:
        risk_level = "HIGH"  # Poor security (40-59)
    else:
        risk_level = "CRITICAL"  # Dangerous security (0-39)
    
    # Return comprehensive health assessment
    return {
        "health_score": score,  # Numerical score (0-100)
        "risk_level": risk_level,  # Overall category
        "risks": risks  # Detailed list of all identified issues
    }


def generate_recommendations(device_data, health_data):
    """
    Generate prioritized, actionable security recommendations based on scan results
    Provides step-by-step remediation instructions for each identified issue
    Returns list of recommendations sorted by priority (CRITICAL > HIGH > MEDIUM)
    """
    recommendations = []  # Collect all recommendations for this device
    
    # Extract device model name for personalized recommendations
    model_name = "your camera"  # Default fallback
    if device_data.get("device_info"):
        model_name = device_data["device_info"].get("model", "your camera")
    
    # FIRMWARE UPDATE RECOMMENDATIONS
    # Generate firmware-specific remediation steps if device is outdated or vulnerable
    firmware = device_data.get("firmware_info", {})
    if firmware.get("status") in ["vulnerable", "outdated"]:
        recommendations.append({
            "priority": "HIGH" if firmware.get("status") == "vulnerable" else "MEDIUM",
            "action": "Update firmware",  # Main action to take
            "steps": [  # Detailed step-by-step instructions
                f"1. Visit manufacturer website for {model_name}",
                "2. Download latest firmware (v2.4.0 or newer recommended)",
                "3. Access camera admin panel",
                "4. Navigate to System > Firmware Update",
                "5. Upload and install new firmware",
                "6. Restart device and verify update"
            ]
        })
    
    # PASSWORD SECURITY RECOMMENDATIONS
    # Provide password strengthening guidance for weak or moderate credentials
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
    
    # SERVICE HARDENING RECOMMENDATIONS
    # Identify and recommend disabling dangerous services (FTP, Telnet, etc.)
    insecure_services = [p for p in device_data.get("open_ports", []) if p.get("risk") in ["CRITICAL", "HIGH"]]
    if insecure_services:
        recommendations.append({
            "priority": "HIGH",
            "action": "Disable insecure services",
            "steps": [
                "1. Access camera admin panel",
                "2. Navigate to Network > Services",
                f"3. Disable: {', '.join([s['service'] for s in insecure_services])}",  # List specific services
                "4. Keep only HTTPS for web access",
                "5. Use VPN for remote access instead of port forwarding"
            ]
        })
    
    # INTERNET EXPOSURE RECOMMENDATIONS
    # Critical: provide guidance to remove device from public internet
    if device_data.get("exposed_to_internet"):
        recommendations.append({
            "priority": "CRITICAL",  # Highest priority - public exposure is dangerous
            "action": "Remove from public internet",
            "steps": [
                "1. Access router admin panel",
                "2. Remove port forwarding rules for camera",
                "3. Place camera on isolated VLAN if possible",  # Network segmentation
                "4. Use VPN for remote access",  # Secure alternative
                "5. Enable router firewall rules"
            ]
        })
    
    return recommendations  # Return complete list of prioritized actions


def scan_network():
    """
    Main network scanning orchestrator - performs comprehensive security assessment
    Scans all configured targets, tests for vulnerabilities, calculates health scores
    Returns list of complete device scan results with recommendations
    """
    # Print header banner for console output
    print("\n" + "="*70)
    print("SmartCam Shield - Network Scanner")
    print("="*70 + "\n")
    
    results = []  # Collect scan results for all devices
    
    # Iterate through each configured camera target
    for target in TARGETS:
        print(f"Scanning {target['name']} at {target['ip']}...")
        
        # Initialize device result structure with empty/default values
        device_result = {
            "name": target['name'],  # Camera identifier
            "ip": target['ip'],  # Network address
            "scan_time": datetime.now().isoformat(),  # Timestamp of scan
            "open_ports": [],  # Will be populated with discovered ports
            "credentials": None,  # Authentication info (if found)
            "device_info": None,  # Device metadata (model, firmware, etc.)
            "firmware_info": None,  # Firmware vulnerability details
            "exposed_to_internet": False  # Public accessibility flag
        }
        
        # PORT SCANNING PHASE
        # Check each configured port and identify HTTP interfaces
        http_port = None  # Track HTTP port for later credential testing
        for port in target['ports']:
            # Attempt connection to port
            if check_port(target['ip'], port):
                # Look up port in risk database for service identification
                port_info = PORT_RISKS.get(port, {"service": "Unknown", "risk": "UNKNOWN", "description": ""})
                
                # Record open port with associated risk information
                device_result["open_ports"].append({
                    "port": port,
                    "service": port_info["service"],  # Service name (HTTP, FTP, etc.)
                    "risk": port_info["risk"],  # Risk level (CRITICAL, HIGH, etc.)
                    "description": port_info["description"]  # Security implications
                })
                print(f"  ✓ Port {port} open ({port_info['service']}) - Risk: {port_info['risk']}")
                
                # Save HTTP port for authentication testing
                if port in [80, 8080, 8081, 8082, 8083, 8084]:
                    http_port = port
        
        # AUTHENTICATION TESTING PHASE
        # If HTTP interface is available, attempt credential testing
        if http_port:
            print(f"  Testing credentials...")
            creds = test_credentials(target['ip'], http_port, COMMON_CREDS)
            
            # If valid credentials found, retrieve device information
            if creds:
                device_result["credentials"] = creds[0]  # Store first successful credential
                
                # DEVICE INFORMATION RETRIEVAL
                # Use authenticated access to query device metadata
                info = get_device_info(target['ip'], http_port, creds[0]['username'], creds[0]['password'])
                if info:
                    device_result["device_info"] = info  # Store full device info
                    device_result["exposed_to_internet"] = info.get("exposed_to_internet", False)
                    
                    # FIRMWARE VULNERABILITY CHECK
                    # Cross-reference firmware version with vulnerability database
                    firmware_version = info.get("firmware")
                    if firmware_version in FIRMWARE_DB:
                        device_result["firmware_info"] = FIRMWARE_DB[firmware_version]
                        device_result["firmware_info"]["version"] = firmware_version
                        print(f"  Firmware: {firmware_version} - Status: {FIRMWARE_DB[firmware_version]['status']}")
        
        # SECURITY SCORE CALCULATION
        # Analyze all collected data to compute overall security health score
        health = calculate_health_score(device_result)
        device_result["health_score"] = health["health_score"]  # 0-100 score
        device_result["risk_level"] = health["risk_level"]  # CRITICAL/HIGH/MEDIUM/LOW
        device_result["identified_risks"] = health["risks"]  # Detailed risk breakdown
        
        # RECOMMENDATION GENERATION
        # Create actionable remediation steps based on findings
        device_result["recommendations"] = generate_recommendations(device_result, health)
        
        # Add completed device scan to results
        results.append(device_result)
        
        # Print summary for this device
        print(f"  Health Score: {health['health_score']}/100 ({health['risk_level']})")
        print()
    
    return results  # Return all scan results for further processing


def print_summary(results):
    """
    Print concise summary report of all scanned devices to console
    Shows key metrics: health score, risk level, ports, credentials, recommendations
    """
    # Print summary header
    print("\n" + "="*70)
    print("SCAN SUMMARY")
    print("="*70 + "\n")
    
    # Iterate through each scanned device and display key metrics
    for device in results:
        print(f"{device['name']} ({device['ip']})")
        print(f"  Health Score: {device['health_score']}/100")  # Security score
        print(f"  Risk Level: {device['risk_level']}")  # Overall risk category
        print(f"  Open Ports: {len(device['open_ports'])}")  # Number of accessible services
        print(f"  Credentials: {'Found' if device['credentials'] else 'Not tested'}")  # Auth status
        print(f"  Recommendations: {len(device['recommendations'])}")  # Number of remediation actions
        print()


def save_results(results, filename="scan_results.json"):
    """
    Persist scan results to JSON file for later analysis or dashboard consumption
    Writes formatted JSON with 2-space indentation for readability
    """
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)  # Save with pretty formatting
    print(f"Results saved to {filename}")


# MAIN EXECUTION BLOCK
# Entry point when script is run directly (not imported as module)
if __name__ == "__main__":
    # Execute full network scan
    results = scan_network()
    
    # Display summary to console
    print_summary(results)
    
    # Save detailed results to file
    save_results(results)
    
    # Print completion message
    print("\nScan complete! Use scan_results.json to feed data to your dashboard.")
