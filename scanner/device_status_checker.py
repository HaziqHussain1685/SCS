#!/usr/bin/env python3
"""
Device Status Checker Module
Real device availability detection using ping + port connectivity
"""

import subprocess
import socket
import platform
from datetime import datetime
from typing import Dict, Any

class DeviceStatusChecker:
    """
    Check device reachability using multiple methods:
    1. ICMP Ping
    2. Port connectivity (554, 80, 8089)
    """
    
    # Camera common ports - if ANY responds, device is online
    CAMERA_PORTS = [554, 80, 8089, 8080, 443, 8899]
    PING_TIMEOUT = 2
    PORT_TIMEOUT = 1
    
    @staticmethod
    def ping_device(ip: str) -> Dict[str, Any]:
        """
        Ping device and return reachability status
        
        Returns:
            {
                'online': bool,
                'latency_ms': float or None,
                'method': 'ping'
            }
        """
        try:
            # Determine ping command based on OS
            param = '-n' if platform.system().lower() == 'windows' else '-c'
            timeout_param = '-w' if platform.system().lower() == 'windows' else '-W'
            
            # Run ping command
            cmd = ['ping', param, '1', timeout_param, str(DeviceStatusChecker.PING_TIMEOUT * 1000), ip]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=DeviceStatusChecker.PING_TIMEOUT + 1
            )
            
            is_reachable = result.returncode == 0
            latency_ms = None
            
            # Try to extract latency
            if is_reachable:
                try:
                    if 'time=' in result.stdout:
                        time_part = result.stdout.split('time=')[1].split('ms')[0].strip()
                        latency_ms = float(time_part)
                except:
                    latency_ms = None
            
            return {
                'online': is_reachable,
                'latency_ms': latency_ms,
                'method': 'ping'
            }
        
        except Exception as e:
            # Ping failed, try port method
            return {
                'online': False,
                'latency_ms': None,
                'method': 'ping',
                'error': str(e)
            }
    
    @staticmethod
    def check_port_connectivity(ip: str, port: int = 554) -> bool:
        """
        Try to connect to a specific port
        
        Args:
            ip: Target IP
            port: Target port (default 554 for RTSP)
        
        Returns:
            True if port responds, False otherwise
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(DeviceStatusChecker.PORT_TIMEOUT)
            
            result = sock.connect_ex((ip, port))
            sock.close()
            
            return result == 0
        except:
            return False
    
    @staticmethod
    def check_device_status(ip: str) -> Dict[str, Any]:
        """
        Multi-method device reachability check
        
        Strategy:
        1. Try ICMP ping first (fastest)
        2. If ping fails, try port connectivity on camera ports
        3. Return status with method used
        
        Returns:
            {
                'status': 'ONLINE' | 'OFFLINE',
                'reachable': bool,
                'latency_ms': float or None,
                'method_used': 'ping' | 'port',
                'port_open': int or None,
                'timestamp': ISO datetime
            }
        """
        
        print(f"\n🔍 Checking device status for {ip}...")
        
        # Method 1: Ping
        ping_result = DeviceStatusChecker.ping_device(ip)
        
        if ping_result['online']:
            print(f"✓ Device is reachable (ping: {ping_result.get('latency_ms', 'N/A')}ms)")
            return {
                'status': 'ONLINE',
                'reachable': True,
                'latency_ms': ping_result.get('latency_ms'),
                'method_used': 'ping',
                'port_open': None,
                'timestamp': datetime.now().isoformat()
            }
        
        print(f"⚠ Ping failed, trying port connectivity...")
        
        # Method 2: Check camera ports
        for port in DeviceStatusChecker.CAMERA_PORTS:
            if DeviceStatusChecker.check_port_connectivity(ip, port):
                print(f"✓ Port {port} is open! Device is ONLINE")
                return {
                    'status': 'ONLINE',
                    'reachable': True,
                    'latency_ms': None,
                    'method_used': 'port',
                    'port_open': port,
                    'timestamp': datetime.now().isoformat()
                }
        
        print(f"❌ Device is not reachable (ping failed, no open camera ports)")
        
        # Device is offline
        return {
            'status': 'OFFLINE',
            'reachable': False,
            'latency_ms': None,
            'method_used': 'none',
            'port_open': None,
            'timestamp': datetime.now().isoformat()
        }


# Testing
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        ip = sys.argv[1]
        result = DeviceStatusChecker.check_device_status(ip)
        print(f"\nResult: {result}")
    else:
        print("Usage: python device_status_checker.py <ip_address>")
