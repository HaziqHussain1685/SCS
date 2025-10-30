# SmartCam Shield - Camera Security Platform

> A comprehensive security solution for protecting smart cameras in home environments

## Overview

SmartCam Shield is a specialized cybersecurity platform designed to secure smart cameras by detecting vulnerabilities, analyzing risks, and providing actionable remediation guidance. The system automates security assessments and empowers homeowners to protect their privacy without requiring technical expertise.

## Problem

Smart cameras in homes are increasingly vulnerable to cyberattacks due to:
- Default or weak passwords
- Outdated firmware with known CVEs
- Insecure network services (Telnet, FTP, unencrypted RTSP)
- Direct exposure to the internet
- Lack of user-friendly security tools

## Solution

SmartCam Shield provides:
- ✅ Automated network scanning and device discovery
- ✅ Weak credential detection (dictionary-based testing)
- ✅ Firmware vulnerability assessment
- ✅ Insecure service identification (Telnet, FTP, etc.)
- ✅ Health Index Score (0-100) for each device
- ✅ Actionable remediation recommendations
- ✅ Password rotation automation
- ✅ Continuous monitoring capabilities

## Features

### 1. Network Scanner
- Discovers smart cameras on local network
- Tests for weak/default credentials
- Identifies open ports and insecure services
- Validates firmware versions against CVE databases

### 2. Risk Analysis Engine
- Calculates Health Index Score (0-100, higher is better)
- Assigns risk levels: CRITICAL, HIGH, MEDIUM, LOW
- Provides detailed vulnerability breakdown
- Prioritizes security issues by severity

### 3. Automated Remediation
- Generates step-by-step remediation guides
- Supports automated password updates (where possible)
- Provides firmware update instructions
- Recommends network isolation strategies

### 4. Dashboard Integration
- Outputs JSON data for web dashboard consumption
- Supports visualization of health scores
- Tracks remediation progress
- Enables continuous monitoring alerts

## Project Structure

```
SmartCam Shield/
├── camera-simulator/           # Docker-based camera simulators for testing
│   ├── app.py                  # Python camera simulator
│   ├── Dockerfile              # Container configuration
│   └── .dockerignore
├── scanner/                    # Scanning and analysis tools
│   ├── network_scanner.py      # Main vulnerability scanner
│   ├── password_demo.py        # Remediation demonstration script
│   └── scan_results.json       # Output (generated after scan)
├── docker-compose.yml          # Multi-camera test environment
├── DEMO_GUIDE.md              # Complete demonstration walkthrough
└── README.md                  # This file
```

## Quick Start

### Prerequisites
- Docker Desktop (for camera simulators)
- Python 3.8 or higher
- `requests` library: `pip install requests`

### Running the Demo

#### Step 1: Start Camera Simulators
```powershell
# Build and start all simulated cameras
docker-compose up -d --build

# Verify cameras are running
docker-compose ps
```

You should see 4 containers running:
- `smartcam-demo-cam1` - Vulnerable (default creds, outdated firmware)
- `smartcam-demo-cam2` - Secure (strong password, current firmware)
- `smartcam-demo-cam3` - Critical (weak creds, ancient firmware, all insecure services)
- `smartcam-demo-cam4` - Moderate (weak password, Telnet open)

#### Step 2: Run Network Scan
```powershell
cd scanner
python network_scanner.py
```

The scanner will:
1. Discover all cameras on localhost
2. Test for weak credentials
3. Check firmware versions
4. Identify insecure services
5. Calculate health scores
6. Generate `scan_results.json`

#### Step 3: View Results
```powershell
# View JSON output
Get-Content scan_results.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Quick summary
Get-Content scan_results.json | ConvertFrom-Json | Select-Object name, health_score, risk_level
```

#### Step 4: Run Remediation Demo
```powershell
python password_demo.py
```

This demonstrates:
- Authenticating with weak credentials
- Updating to strong passwords
- Verifying changes
- Security improvement

#### Step 5: Verify Improvements
```powershell
# Rescan to see improved health scores
python network_scanner.py

# Compare before/after
Get-Content scan_results.json | ConvertFrom-Json | Select-Object name, health_score, risk_level
```

#### Step 6: Cleanup
```powershell
cd ..
docker-compose down
```

## Camera Simulator Details

Each simulated camera runs multiple network services:

### Camera 1: AcmeCam A1 (Vulnerable)
- **IP**: 127.0.0.1:8081
- **Credentials**: admin/admin (default)
- **Firmware**: 1.0.2 (outdated)
- **Services**: HTTP (80), RTSP (554)
- **Expected Health Score**: ~25/100 (HIGH risk)

### Camera 2: SafeView Pro 100 (Secure)
- **IP**: 127.0.0.1:8082
- **Credentials**: homeowner/SecureP@ssw0rd2024! (strong)
- **Firmware**: 2.4.0 (current)
- **Services**: HTTP (80) only
- **Expected Health Score**: 95/100 (LOW risk)

### Camera 3: OldEye Z200 (Critical)
- **IP**: 127.0.0.1:8083
- **Credentials**: root/12345 (weak)
- **Firmware**: 0.9.4 (vulnerable with CVEs)
- **Services**: FTP (21), Telnet (23), HTTP (80), RTSP (554)
- **Exposure**: Flagged as internet-exposed
- **Expected Health Score**: 0/100 (CRITICAL risk)

### Camera 4: BudgetCam 500 (Moderate)
- **IP**: 127.0.0.1:8084
- **Credentials**: admin/password (weak)
- **Firmware**: 1.5.1 (outdated)
- **Services**: Telnet (23), HTTP (80), RTSP (554)
- **Expected Health Score**: ~45/100 (MEDIUM risk)

## Health Score Calculation

The Health Index Score starts at 100 and deducts points for vulnerabilities:

| Issue | Deduction | Severity |
|-------|-----------|----------|
| Vulnerable firmware (with CVEs) | -50 | CRITICAL |
| Outdated firmware | -30 | HIGH |
| Default/weak credentials | -40 | CRITICAL |
| Moderate password strength | -20 | MEDIUM |
| Each insecure service (Telnet/FTP) | -15 | HIGH |
| Internet exposure | -50 | CRITICAL |

**Score Ranges:**
- 80-100: LOW risk (green)
- 60-79: MEDIUM risk (yellow)
- 40-59: HIGH risk (orange)
- 0-39: CRITICAL risk (red)

## API Endpoints (Simulator)

Each camera simulator exposes:

### Public Endpoints
- `GET /` - Camera homepage (HTML)
- `GET /api/status` - Public status (no auth required)

### Authenticated Endpoints (Basic Auth required)
- `GET /info` - Device information (model, firmware, capabilities)
- `GET /stream` - Simulated stream endpoint
- `POST /api/credentials` - Update credentials (for remediation demo)

### Example: Access Device Info
```powershell
# Using PowerShell
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
Invoke-WebRequest -Uri http://localhost:8081/info -Headers @{Authorization="Basic $credentials"}
```

## Development Notes

### Extending the Scanner

To add new vulnerability checks, edit `scanner/network_scanner.py`:

```python
# Add to PORT_RISKS dictionary
PORT_RISKS = {
    # ... existing entries ...
    8080: {"service": "HTTP-Alt", "risk": "MEDIUM", "description": "Alternative HTTP port"},
}

# Add to FIRMWARE_DB for new firmware versions
FIRMWARE_DB = {
    # ... existing entries ...
    "1.8.0": {"status": "outdated", "cves": [], "risk": "MEDIUM"},
}
```

### Adding New Camera Models

Edit `docker-compose.yml` to add more simulators:

```yaml
camera5-custom:
  build: ./camera-simulator
  container_name: smartcam-demo-cam5
  environment:
    - MODEL=YourModel X100
    - FIRMWARE=1.0.0
    - DEFAULT_USER=admin
    - DEFAULT_PASS=admin
    - OPEN_PORTS=80,554,8080
    - EXPOSED=false
  ports:
    - "8085:80"
  networks:
    smartcam_net:
      ipv4_address: 172.25.0.15
```

Then update `scanner/network_scanner.py` TARGETS list:

```python
TARGETS = [
    # ... existing entries ...
    {"name": "Camera 5", "ip": "127.0.0.1", "ports": [8085]},
]
```

## Dashboard Integration

The scanner outputs `scan_results.json` with structure:

```json
{
  "name": "Camera 1",
  "ip": "127.0.0.1",
  "health_score": 25,
  "risk_level": "HIGH",
  "open_ports": [...],
  "credentials": {...},
  "device_info": {...},
  "firmware_info": {...},
  "identified_risks": [...],
  "recommendations": [
    {
      "priority": "CRITICAL",
      "action": "Change password",
      "steps": [...]
    }
  ]
}
```

Your web dashboard can:
1. Parse this JSON via API endpoint
2. Display health scores as gauges/charts
3. Show risk-level color coding
4. Render remediation checklists
5. Track progress over time

## Testing

### Verify Scanner Functionality
```powershell
# Test port scanning
cd scanner
python -c "from network_scanner import check_port; print(check_port('127.0.0.1', 8081))"

# Test credential checking
python -c "from network_scanner import test_credentials; print(test_credentials('127.0.0.1', 8081, [('admin', 'admin')]))"

# Test health score calculation
python network_scanner.py
```

### Verify Camera Simulators
```powershell
# Test HTTP response
Invoke-WebRequest -Uri http://localhost:8081 -UseBasicParsing

# Test authentication
Invoke-WebRequest -Uri http://localhost:8081/info -Headers @{Authorization=("Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin")))}

# Test service ports
Test-NetConnection -ComputerName localhost -Port 2323  # Telnet on Camera 3
Test-NetConnection -ComputerName localhost -Port 2121  # FTP on Camera 3
```

## Troubleshooting

### Docker Issues
```powershell
# Check Docker is running
docker version

# View container logs
docker-compose logs camera1-vulnerable

# Restart containers
docker-compose restart

# Rebuild from scratch
docker-compose down
docker-compose up -d --build --force-recreate
```

### Scanner Issues
```powershell
# Install dependencies
pip install requests

# Check connectivity
Test-NetConnection -ComputerName localhost -Port 8081

# Run with verbose output (add print statements to network_scanner.py)
```

### Port Conflicts
```powershell
# Check if ports are in use
netstat -an | Select-String "8081|8082|8083|8084"

# Modify docker-compose.yml if needed:
ports:
  - "9081:80"  # Use different host port
```

## Future Enhancements

- [ ] Web-based dashboard (React/Vue.js)
- [ ] Cloud backend API (Flask/FastAPI)
- [ ] Email/SMS alerts for critical issues
- [ ] Mobile app for monitoring
- [ ] Integration with Shodan API for exposure checks
- [ ] Machine learning for anomaly detection
- [ ] Support for additional IoT devices (doorbells, locks)
- [ ] Automated firmware update downloads
- [ ] Network traffic analysis
- [ ] VLAN/network segmentation recommendations

## Technology Stack

- **Camera Simulator**: Python 3.11, Socket programming, HTTP server
- **Scanner**: Python 3.8+, Requests library
- **Containerization**: Docker, Docker Compose
- **Output Format**: JSON (for dashboard integration)
- **Target Platform**: Cross-platform (Windows/Linux/macOS)

## Project Objectives (from FYP)

✅ **Completed:**
1. Automate detection of default/weak passwords
2. Identify open or insecure network services
3. Verify firmware versions and flag vulnerabilities
4. Assess external exposure
5. Generate Health Index Score with actionable recommendations
6. Support password rotation and automated resets

🔄 **In Progress:**
7. Web-based dashboard for visualization
8. Continuous monitoring with alerts

## Contributors

- **Student**: [Your Name]
- **Supervisor**: [Supervisor Name]
- **Institution**: FAST National University
- **Year**: 2024-2025

## License

This project is developed for educational purposes as part of a Final Year Project (FYP).

## Documentation

- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** - Complete demonstration script for evaluators (20-minute walkthrough)
- **README.md** - This file (technical documentation)

## Contact

For questions or support, contact: [Your Email]

---

**Last Updated**: October 30, 2025
