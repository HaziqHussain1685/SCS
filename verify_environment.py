#!/usr/bin/env python3
"""
SmartCam Shield - Quick Verification Test
Tests the complete demo environment
"""

import socket
import requests
from requests.auth import HTTPBasicAuth
import sys
import time

def test_port(ip, port, name):
    """Test if a port is accessible"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((ip, port))
        sock.close()
        if result == 0:
            print(f"  ✓ {name} (port {port}) is accessible")
            return True
        else:
            print(f"  ✗ {name} (port {port}) is NOT accessible")
            return False
    except Exception as e:
        print(f"  ✗ {name} (port {port}) error: {e}")
        return False

def test_auth(ip, port, username, password, camera_name):
    """Test authentication"""
    try:
        url = f"http://{ip}:{port}/info"
        response = requests.get(
            url,
            auth=HTTPBasicAuth(username, password),
            timeout=3
        )
        if response.status_code == 200:
            data = response.json()
            print(f"  ✓ {camera_name} authenticated successfully")
            print(f"    Model: {data.get('model', 'Unknown')}")
            print(f"    Firmware: {data.get('firmware', 'Unknown')}")
            return True
        else:
            print(f"  ✗ {camera_name} authentication failed (status {response.status_code})")
            return False
    except Exception as e:
        print(f"  ✗ {camera_name} authentication error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("SmartCam Shield - Environment Verification Test")
    print("="*70 + "\n")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Check Docker containers are accessible
    print("Test 1: Checking camera accessibility...")
    cameras = [
        {"name": "Camera 1", "port": 8081},
        {"name": "Camera 2", "port": 8082},
        {"name": "Camera 3", "port": 8083},
        {"name": "Camera 4", "port": 8084},
    ]
    
    for camera in cameras:
        tests_total += 1
        if test_port("127.0.0.1", camera["port"], camera["name"]):
            tests_passed += 1
    
    print()
    
    # Test 2: Verify authentication
    print("Test 2: Verifying authentication...")
    auth_tests = [
        {"name": "Camera 1", "port": 8081, "user": "admin", "pass": "admin"},
        {"name": "Camera 2", "port": 8082, "user": "homeowner", "pass": "SecureP@ssw0rd2024!"},
        {"name": "Camera 3", "port": 8083, "user": "root", "pass": "12345"},
        {"name": "Camera 4", "port": 8084, "user": "admin", "pass": "password"},
    ]
    
    for test in auth_tests:
        tests_total += 1
        if test_auth("127.0.0.1", test["port"], test["user"], test["pass"], test["name"]):
            tests_passed += 1
    
    print()
    
    # Test 3: Check insecure services
    print("Test 3: Checking insecure services...")
    insecure_services = [
        {"name": "Camera 3 Telnet", "port": 2323},
        {"name": "Camera 3 FTP", "port": 2121},
        {"name": "Camera 4 Telnet", "port": 2324},
    ]
    
    for service in insecure_services:
        tests_total += 1
        if test_port("127.0.0.1", service["port"], service["name"]):
            tests_passed += 1
    
    print()
    
    # Test 4: Verify dependencies
    print("Test 4: Checking Python dependencies...")
    try:
        import requests
        print(f"  ✓ requests library installed (version {requests.__version__})")
        tests_passed += 1
    except ImportError:
        print(f"  ✗ requests library not installed")
    tests_total += 1
    
    print()
    
    # Summary
    print("="*70)
    print(f"VERIFICATION SUMMARY: {tests_passed}/{tests_total} tests passed")
    print("="*70 + "\n")
    
    if tests_passed == tests_total:
        print("✓ All tests passed! Environment is ready for demo.")
        print("\nNext steps:")
        print("  1. cd scanner")
        print("  2. python network_scanner.py")
        return 0
    else:
        print("✗ Some tests failed. Please check:")
        print("  1. Docker containers are running: docker-compose ps")
        print("  2. Dependencies are installed: pip install -r requirements.txt")
        print("  3. No port conflicts: netstat -an | Select-String '8081|8082|8083|8084'")
        return 1

if __name__ == "__main__":
    sys.exit(main())
