#!/usr/bin/env python3
"""
Smart Camera Scanner API - Clean, Minimal, Modern
Provides REST endpoints for improved nmap-based IoT camera scanning
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from scanner_main import IoTCameraScanner
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

# ============== HEALTH & STATUS ==============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "message": "✓ Smart Camera Scanner API is running",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/api/health/status', methods=['GET'])
def health_status():
    """Get health status"""
    return jsonify({
        "status": "online",
        "api_version": "2.0",
        "scanner": "nmap-based",
        "timestamp": datetime.now().isoformat()
    }), 200

# ============== SCANNING ENDPOINTS ==============

@app.route('/api/scan', methods=['POST'])
@app.route('/api/scan/nmap', methods=['POST'])
def scan_camera():
    """Run improved nmap scan on target camera with full analysis"""
    try:
        data = request.get_json()
        target_ip = data.get('target', '192.168.18.234')
        full_scan = data.get('full_scan', False)
        
        print(f"\n{'='*70}")
        print(f"🔍 SCAN REQUEST")
        print(f"  Target IP: {target_ip}")
        print(f"  Full Scan: {full_scan}")
        print(f"{'='*70}")
        
        # Run improved scan using IoTCameraScanner
        scanner = IoTCameraScanner()
        results = scanner.scan_device(target_ip, full_scan=full_scan)
        
        if results is None or 'error' in results:
            error_msg = results.get('error', 'Unknown scan error') if results else 'Scan failed'
            print(f"❌ Error: {error_msg}")
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Print summary
        print(f"\n✓ SCAN COMPLETED")
        print(f"  Status: Success")
        print(f"  Duration: {results.get('scan_duration', 0):.1f}s")
        print(f"  Open ports: {len(results.get('open_ports', []))}")
        print(f"  Vulnerabilities: {len(results.get('vulnerabilities', []))}")
        print(f"  Risk level: {results.get('risk_level', 'UNKNOWN')}")
        print(f"  Risk score: {results.get('risk_score', 0):.1f}/10")
        print(f"  Camera detected: {results.get('device_profile', {}).get('is_camera', False)}")
        print(f"{'='*70}\n")
        
        # Save to history
        history = load_history()
        history.append(results)
        save_history(history)
        
        return jsonify({
            "success": True,
            "data": results
        }), 200
        
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/comprehensive', methods=['POST'])
def comprehensive_scan():
    """Alias for /api/scan (the improved comprehensive scanner) with Frontend-compatible response format"""
    try:
        data = request.get_json()
        target_ip = data.get('target', '192.168.18.234')
        full_scan = data.get('full_scan', False)
        
        print(f"\n{'='*70}")
        print(f"🔍 COMPREHENSIVE SCAN REQUEST")
        print(f"  Target IP: {target_ip}")
        print(f"  Full Scan: {full_scan}")
        print(f"{'='*70}")
        
        # Run improved scan using IoTCameraScanner
        scanner = IoTCameraScanner()
        results = scanner.scan_device(target_ip, full_scan=full_scan)
        
        if results is None or 'error' in results.get('metadata', {}):
            error_msg = results.get('metadata', {}).get('error', 'Unknown scan error') if results else 'Scan failed'
            print(f"❌ Error: {error_msg}")
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Transform scanner output to frontend-compatible format
        scan_end_time = datetime.now()
        scan_start_time = datetime.fromisoformat(results["metadata"]["scan_time"])
        scan_duration = (scan_end_time - scan_start_time).total_seconds()
        
        transformed = {
            "target_ip": results["metadata"]["target_ip"],
            "timestamp": results["metadata"]["scan_time"],
            "scan_type": "NMAP_COMPREHENSIVE",
            "status": "COMPLETE",
            
            # Device profile
            "device_profile": {
                "is_camera": results["device_info"].get("is_camera", False),
                "camera_type": results["device_info"].get("camera_type_guess", "Unknown"),
                "confidence": results["device_info"].get("confidence", 0),
                "status": "online",
                "open_ports": results["scan_results"].get("ports", {}).get("open_ports", []),
                "services_detected": len(results["scan_results"].get("ports", {}).get("open_ports", []))
            },
            
            # Summary
            "summary": {
                "total_scanners": 1,
                "scanners_completed": 1,
                "vulnerabilities_found": len(results.get("vulnerabilities", [])),
                "critical_issues": sum(1 for v in results.get("vulnerabilities", []) if v.get("severity") == "CRITICAL"),
                "high_issues": sum(1 for v in results.get("vulnerabilities", []) if v.get("severity") == "HIGH"),
                "medium_issues": sum(1 for v in results.get("vulnerabilities", []) if v.get("severity") == "MEDIUM"),
                "low_issues": sum(1 for v in results.get("vulnerabilities", []) if v.get("severity") == "LOW")
            },
            
            # Risk assessment
            "overall_risk_score": results.get("risk_assessment", {}).get("score", 0),
            "overall_risk_level": results.get("risk_assessment", {}).get("level", "UNKNOWN"),
            
            # All findings
            "all_findings": results.get("vulnerabilities", []),
            
            # Recommendations
            "recommendations": results.get("recommendations", []),
            
            # Scanner details
            "scanners": {
                "nmap": {
                    "status": "completed",
                    "data": results.get("scan_results", {}),
                    "timestamp": results["metadata"]["scan_time"]
                }
            },
            
            # Metadata
            "scan_duration_seconds": scan_duration,
            "scan_mode": results["metadata"].get("scan_mode", "QUICK")
        }
        
        # Print summary
        print(f"\n✓ SCAN COMPLETED")
        print(f"  Duration: {transformed.get('scan_duration_seconds', 0):.1f}s")
        print(f"  Open ports: {transformed['device_profile']['services_detected']}")
        print(f"  Vulnerabilities: {transformed['summary']['vulnerabilities_found']}")
        print(f"  Risk level: {transformed['overall_risk_level']}")
        print(f"  Risk score: {transformed['overall_risk_score']:.1f}/10")
        print(f"  Is Camera: {transformed['device_profile']['is_camera']}")
        print(f"{'='*70}\n")
        
        # Save to history
        history = load_history()
        history.append(transformed)
        save_history(history)
        
        return jsonify({
            "success": True,
            "data": transformed
        }), 200
        
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== HISTORY ENDPOINTS ==============

@app.route('/api/scan/history', methods=['GET'])
def scan_history():
    """Get all scan history"""
    try:
        history = load_history()
        return jsonify({
            "success": True,
            "scans": history,
            "count": len(history)
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scan/latest', methods=['GET'])
def latest_scan():
    """Get latest scan"""
    try:
        history = load_history()
        if history:
            return jsonify({
                "success": True,
                "data": history[-1]
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "No scans found"
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
            "message": "History cleared"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============== ERROR HANDLERS ==============

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "available_endpoints": [
            "/api/health",
            "/api/scan",
            "/api/scan/nmap",
            "/api/scan/comprehensive",
            "/api/scan/history",
            "/api/scan/latest",
            "/api/scan/clear"
        ]
    }), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({
        "success": False,
        "error": f"Server error: {str(error)}"
    }), 500

# ============== MAIN ==============

if __name__ == '__main__':
    print(f"\n{'='*70}")
    print("🚀 STARTING SMART CAMERA SCANNER API v2.0")
    print(f"{'='*70}")
    print("✓ Backend: nmap-based network scanning")
    print("✓ Port: 5000")
    print("✓ CORS: Enabled for localhost:3000")
    print(f"\n📍 Available endpoints:")
    print(f"  GET  /api/health         - Health check")
    print(f"  POST /api/scan           - Run scan")
    print(f"  POST /api/scan/nmap      - Run nmap scan")
    print(f"  GET  /api/scan/history   - Get all scans")
    print(f"  GET  /api/scan/latest    - Get latest scan")
    print(f"  DELETE /api/scan/clear   - Clear history")
    print(f"\n📝 Example request:")
    print(f'  curl -X POST http://localhost:5000/api/scan \\')
    print(f'    -H "Content-Type: application/json" \\')
    print(f'    -d \'{{"target": "192.168.18.234"}}\'')
    print(f"{'='*70}\n")
    
    app.run(host='127.0.0.1', port=5000, debug=True)
