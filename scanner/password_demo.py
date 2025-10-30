#!/usr/bin/env python3
"""
SmartCam Shield - Password Change Demo
Demonstrates remediation by changing camera password
"""

import requests
from requests.auth import HTTPBasicAuth
import sys

def change_password(ip, port, old_user, old_pass, new_user, new_pass):
    """Change camera credentials"""
    print(f"\n{'='*60}")
    print(f"Changing credentials for camera at {ip}:{port}")
    print(f"{'='*60}\n")
    
    # Step 1: Verify current credentials
    print(f"Step 1: Verifying current credentials...")
    try:
        response = requests.get(
            f"http://{ip}:{port}/info",
            auth=HTTPBasicAuth(old_user, old_pass),
            timeout=3
        )
        
        if response.status_code != 200:
            print(f"  ✗ Current credentials invalid!")
            return False
        
        device_info = response.json()
        print(f"  ✓ Authenticated to {device_info.get('model', 'Unknown')}")
        print(f"  ✓ Current firmware: {device_info.get('firmware', 'Unknown')}")
    except Exception as e:
        print(f"  ✗ Connection failed: {e}")
        return False
    
    # Step 2: Change credentials
    print(f"\nStep 2: Updating credentials...")
    try:
        response = requests.post(
            f"http://{ip}:{port}/api/credentials",
            auth=HTTPBasicAuth(old_user, old_pass),
            json={"username": new_user, "password": new_pass},
            timeout=3
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"  ✓ Credentials updated successfully!")
            print(f"  ✓ New username: {result.get('username')}")
        else:
            print(f"  ✗ Update failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ✗ Update failed: {e}")
        return False
    
    # Step 3: Verify new credentials
    print(f"\nStep 3: Verifying new credentials...")
    try:
        response = requests.get(
            f"http://{ip}:{port}/info",
            auth=HTTPBasicAuth(new_user, new_pass),
            timeout=3
        )
        
        if response.status_code == 200:
            print(f"  ✓ New credentials verified!")
            print(f"  ✓ Password strength improved!")
            return True
        else:
            print(f"  ✗ Verification failed!")
            return False
    except Exception as e:
        print(f"  ✗ Verification failed: {e}")
        return False


def demo_remediation():
    """Run complete remediation demo"""
    print("\n" + "="*70)
    print("SmartCam Shield - Remediation Demo")
    print("="*70)
    
    cameras = [
        {
            "name": "Camera 1 (AcmeCam A1)",
            "ip": "127.0.0.1",
            "port": 8081,
            "old_user": "admin",
            "old_pass": "admin",
            "new_user": "admin",
            "new_pass": "SecureP@ssw0rd2024!Updated"
        },
        {
            "name": "Camera 3 (OldEye Z200)",
            "ip": "127.0.0.1",
            "port": 8083,
            "old_user": "root",
            "old_pass": "12345",
            "new_user": "admin",
            "new_pass": "VeryStr0ng!Pass2024"
        }
    ]
    
    print("\nThis demo will:")
    print("  1. Change weak passwords to strong passwords")
    print("  2. Verify the changes")
    print("  3. Show improved health scores\n")
    
    print("Starting remediation demo...\n")
    
    for camera in cameras:
        success = change_password(
            camera["ip"],
            camera["port"],
            camera["old_user"],
            camera["old_pass"],
            camera["new_user"],
            camera["new_pass"]
        )
        
        if success:
            print(f"\n✓ {camera['name']} secured!")
        else:
            print(f"\n✗ {camera['name']} remediation failed!")
        
        print()
    
    print("\n" + "="*70)
    print("Remediation complete!")
    print("Re-run network_scanner.py to see improved health scores.")
    print("="*70 + "\n")


if __name__ == "__main__":
    demo_remediation()
