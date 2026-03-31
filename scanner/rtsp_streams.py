#!/usr/bin/env python3
"""
RTSP Streaming Module
Handles live MJPEG stream conversion and snapshot serving
Converts RTSP streams to MJPEG format for web browsers
"""

import subprocess
import os
import json
from datetime import datetime
from typing import Optional, Generator
import threading
import time
import shutil
import io

# Check if FFmpeg is available
FFMPEG_AVAILABLE = shutil.which('ffmpeg') is not None

# Try to import PIL for placeholder images
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

class RTSPStreamManager:
    """
    Manages RTSP stream conversion to MJPEG
    Provides live streaming to web browsers via HTTP
    """
    
    def __init__(self, snapshots_dir: str = "snapshots"):
        """
        Initialize stream manager
        
        Args:
            snapshots_dir: Directory to store snapshot files
        """
        self.snapshots_dir = snapshots_dir
        self.live_processes = {}  # Store active FFmpeg processes
        
        # Create snapshots directory if it doesn't exist
        os.makedirs(self.snapshots_dir, exist_ok=True)
        print(f"📁 Snapshots directory: {os.path.abspath(self.snapshots_dir)}")
    
    def _generate_placeholder_image(self, filepath: str, camera_id: str, rtsp_url: str) -> bool:
        """
        Generate a placeholder image when FFmpeg is unavailable
        
        Args:
            filepath: Where to save the placeholder image
            camera_id: Camera identifier
            rtsp_url: RTSP URL for display
        
        Returns:
            True if successful, False otherwise
        """
        if not PIL_AVAILABLE:
            return False
        
        try:
            # Create placeholder image (800x600, dark blue background)
            img = Image.new('RGB', (800, 600), color=(30, 40, 80))
            draw = ImageDraw.Draw(img)
            
            # Try to load a nice font, fallback to default
            try:
                title_font = ImageFont.truetype("arial.ttf", 36)
                info_font = ImageFont.truetype("arial.ttf", 16)
            except:
                title_font = ImageFont.load_default()
                info_font = ImageFont.load_default()
            
            # Draw text
            draw.text((20, 50), "FFmpeg Not Installed", fill=(255, 200, 0), font=title_font)
            draw.text((20, 120), "Live snapshot capture unavailable", fill=(200, 200, 200), font=info_font)
            draw.text((20, 170), f"Camera ID: {camera_id}", fill=(150, 200, 255), font=info_font)
            draw.text((20, 210), f"Stream: {rtsp_url[:50]}...", fill=(150, 200, 255), font=info_font)
            draw.text((20, 270), "To enable snapshots, install FFmpeg:", fill=(200, 200, 200), font=info_font)
            draw.text((20, 310), "• Linux: apt-get install ffmpeg", fill=(150, 255, 150), font=info_font)
            draw.text((20, 350), "• Windows: choco install ffmpeg", fill=(150, 255, 150), font=info_font)
            draw.text((20, 390), "• Or: pip install ffmpeg-python", fill=(150, 255, 150), font=info_font)
            draw.text((20, 500), f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", fill=(100, 100, 100), font=info_font)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            # Save image
            img.save(filepath, 'JPEG', quality=85)
            print(f"  ✓ Placeholder image generated (PIL)")
            return True
            
        except Exception as e:
            print(f"  ✗ Placeholder generation failed: {e}")
            return False

    def capture_snapshot(self, rtsp_url: str, camera_id: str = "default") -> Optional[dict]:
        """
        Capture a single snapshot from RTSP stream
        Falls back to placeholder image if FFmpeg unavailable
        
        Args:
            rtsp_url: RTSP stream URL (e.g., rtsp://192.168.18.234/live)
            camera_id: Identifier for camera (used in filename)
        
        Returns:
            Dict with snapshot info or None if failed:
            {
                'success': bool,
                'filename': 'snapshot_20260331_143022.jpg',
                'filepath': '/snapshots/snapshot_20260331_143022.jpg',
                'url': '/api/snapshot/snapshot_20260331_143022.jpg',
                'file_size_bytes': 45230,
                'timestamp': '2026-03-31T14:30:22.123456',
                'rtsp_url': rtsp_url,
                'source': 'ffmpeg' | 'placeholder'
            }
        """
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"snapshot_{camera_id}_{timestamp}.jpg"
        filepath = os.path.join(self.snapshots_dir, filename)
        
        print(f"\n🎬 SNAPSHOT CAPTURE")
        print(f"  RTSP URL: {rtsp_url}")
        print(f"  Output: {filename}")
        
        # Check if FFmpeg is available
        if not FFMPEG_AVAILABLE:
            print(f"  ⚠️  FFmpeg not installed - attempting fallback")
            
            # Try to generate placeholder using PIL
            if self._generate_placeholder_image(filepath, camera_id, rtsp_url):
                if os.path.exists(filepath):
                    file_size = os.path.getsize(filepath)
                    return {
                        'success': True,
                        'filename': filename,
                        'filepath': filepath,
                        'url': f'/api/snapshot/{filename}',
                        'file_size_bytes': file_size,
                        'timestamp': datetime.now().isoformat(),
                        'rtsp_url': rtsp_url,
                        'source': 'placeholder',
                        'note': 'Placeholder image - FFmpeg not installed'
                    }
            
            # PIL also unavailable
            print(f"  ✗ FFmpeg and PIL not available - cannot create snapshot")
            return {
                'success': False,
                'error': 'FFmpeg not installed and PIL unavailable for placeholder',
                'installation_info': {
                    'linux': 'apt-get install ffmpeg',
                    'windows': 'choco install ffmpeg (or download from ffmpeg.org)',
                    'pip': 'pip install ffmpeg-python'
                },
                'timestamp': datetime.now().isoformat()
            }
        
        # FFmpeg is available - proceed with actual capture
        try:
            print(f"  Timeout: 10 seconds")
            
            # FFmpeg command to capture single frame
            cmd = [
                'ffmpeg',
                '-rtsp_transport', 'tcp',      # Use TCP for reliability
                '-i', rtsp_url,                 # Input RTSP stream
                '-frames:v', '1',              # Capture 1 frame only
                '-f', 'image2',                # Output as image
                '-q:v', '5',                   # Quality (1-31, lower=better)
                '-y',                          # Overwrite without asking
                filepath
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            # Verify capture was successful
            if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
                file_size = os.path.getsize(filepath)
                print(f"  ✓ Snapshot captured successfully")
                print(f"  📊 File size: {file_size / 1024:.1f} KB")
                
                return {
                    'success': True,
                    'filename': filename,
                    'filepath': filepath,
                    'url': f'/api/snapshot/{filename}',
                    'file_size_bytes': file_size,
                    'timestamp': datetime.now().isoformat(),
                    'rtsp_url': rtsp_url,
                    'source': 'ffmpeg'
                }
            else:
                print(f"  ✗ Capture failed or file too small")
                if os.path.exists(filepath):
                    os.remove(filepath)
                return {
                    'success': False,
                    'error': 'Capture failed - stream may be offline',
                    'timestamp': datetime.now().isoformat()
                }
                
        except subprocess.TimeoutExpired:
            print(f"  ✗ FFmpeg timeout (10s) - stream not responding")
            return {
                'success': False,
                'error': 'Stream timeout - camera may be offline or unreachable',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return {
                'success': False,
                'error': f'Capture error: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def get_live_stream(self, rtsp_url: str, stream_id: str = "default") -> Generator[bytes, None, None]:
        """
        Stream RTSP as MJPEG (Motion JPEG) for browser display
        Falls back to placeholder image stream if FFmpeg unavailable
        
        Yields MJPEG frames for streaming in <img src> tags
        
        Args:
            rtsp_url: RTSP stream URL
            stream_id: Unique identifier for this stream
        
        Yields:
            JPEG frame data with proper MJPEG boundaries
        """
        process = None
        
        # Check if FFmpeg is available
        if not FFMPEG_AVAILABLE:
            print(f"\n🎥 LIVE STREAM (FALLBACK - FFmpeg not available)")
            print(f"  RTSP URL: {rtsp_url}")
            print(f"  Format: Placeholder JPEG (no FFmpeg)")
            
            # Generate a single placeholder frame for streaming
            if PIL_AVAILABLE:
                try:
                    img = Image.new('RGB', (800, 600), color=(30, 40, 80))
                    draw = ImageDraw.Draw(img)
                    
                    try:
                        font = ImageFont.truetype("arial.ttf", 24)
                        small_font = ImageFont.truetype("arial.ttf", 14)
                    except:
                        font = ImageFont.load_default()
                        small_font = ImageFont.load_default()
                    
                    draw.text((20, 50), "Live Stream Unavailable", fill=(255, 200, 0), font=font)
                    draw.text((20, 110), "FFmpeg not installed", fill=(200, 200, 200), font=small_font)
                    draw.text((20, 150), f"Stream: {rtsp_url[:50]}...", fill=(150, 200, 255), font=small_font)
                    draw.text((20, 190), "Expected: Real-time MJPEG feed", fill=(200, 100, 100), font=small_font)
                    draw.text((20, 240), "To enable streaming, install FFmpeg:", fill=(200, 200, 200), font=small_font)
                    draw.text((20, 270), "Linux: apt-get install ffmpeg", fill=(150, 255, 150), font=small_font)
                    draw.text((20, 300), "Windows: choco install ffmpeg", fill=(150, 255, 150), font=small_font)
                    
                    # Convert image to JPEG bytes
                    import io
                    buffer = io.BytesIO()
                    img.save(buffer, format='JPEG', quality=85)
                    jpeg_data = buffer.getvalue()
                    
                    # Yield MJPEG frame with boundary
                    boundary = b'--BOUNDARY\r\n'
                    header = b'Content-Type: image/jpeg\r\nContent-Length: ' + str(len(jpeg_data)).encode() + b'\r\n\r\n'
                    
                    yield boundary + header + jpeg_data + b'\r\n'
                    print(f"  ✓ Placeholder frame generated (PIL)")
                    
                except Exception as e:
                    print(f"  ✗ Placeholder generation failed: {e}")
                    yield b'Stream failed'
            else:
                print(f"  ✗ FFmpeg not installed and PIL unavailable")
                yield b'Stream unavailable - FFmpeg not installed'
            return
        
        # FFmpeg is available - proceed with actual stream
        try:
            print(f"\n🎥 LIVE STREAM START")
            print(f"  RTSP URL: {rtsp_url}")
            print(f"  Format: MJPEG")
            print(f"  Quality: 5 (1=best, 31=worst)")
            
            # FFmpeg command to convert RTSP to MJPEG stream
            # -f mjpeg: Output as MJPEG
            # -q:v 5: Quality setting
            # pipe:1: Output to stdout (we capture it)
            cmd = [
                'ffmpeg',
                '-rtsp_transport', 'tcp',      # Use TCP
                '-i', rtsp_url,                # Input RTSP stream
                '-f', 'mjpeg',                 # Output format: Motion JPEG
                '-q:v', '5',                   # Quality
                '-r', '5',                     # Frame rate: 5 fps
                '-vf', 'scale=800:600',        # Resize for bandwidth efficiency
                'pipe:1'                       # Output to stdout
            ]
            
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=0  # Unbuffered
            )
            
            print(f"  ✓ FFmpeg process started (PID: {process.pid})")
            
            # Read MJPEG stream from FFmpeg stdout
            chunk_size = 65536  # 64KB chunks
            while True:
                try:
                    frame_data = process.stdout.read(chunk_size)
                    if not frame_data:
                        print(f"  ⚠ Stream ended")
                        break
                    yield frame_data
                except Exception as e:
                    print(f"  ✗ Stream error: {e}")
                    break
                    
        except FileNotFoundError:
            print(f"  ✗ FFmpeg not found")
            yield b"FFmpeg not installed"
        except Exception as e:
            print(f"  ✗ Error: {e}")
            yield f"Stream error: {str(e)}".encode()
        finally:
            if process:
                try:
                    process.terminate()
                    process.wait(timeout=2)
                    print(f"  ✓ Stream terminated")
                except:
                    process.kill()
                    print(f"  ⚠ Process forcefully killed")
    
    def validate_rtsp_url(self, rtsp_url: str) -> dict:
        """
        Validate RTSP URL is accessible
        
        Args:
            rtsp_url: RTSP URL to validate
        
        Returns:
            {
                'accessible': bool,
                'latency_ms': float or None,
                'error': str or None,
                'codec_info': str or None
            }
        """
        try:
            print(f"\n🔍 VALIDATING RTSP URL: {rtsp_url}")
            
            start_time = time.time()
            
            # Quick FFmpeg probe to check if stream is accessible
            cmd = [
                'ffprobe',
                '-rtsp_transport', 'tcp',
                '-i', rtsp_url,
                '-show_format',
                '-show_streams',
                '-select_streams', 'v:0',
                '-pretty'
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            latency_ms = (time.time() - start_time) * 1000
            
            if result.returncode == 0:
                print(f"  ✓ Stream accessible")
                print(f"  ⏱ Latency: {latency_ms:.1f}ms")
                return {
                    'accessible': True,
                    'latency_ms': latency_ms,
                    'error': None,
                    'codec_info': 'Stream detected'
                }
            else:
                print(f"  ✗ Stream not accessible")
                return {
                    'accessible': False,
                    'latency_ms': latency_ms,
                    'error': 'Stream probe failed',
                    'codec_info': None
                }
                
        except FileNotFoundError:
            print(f"  ⚠ ffprobe not found (part of ffmpeg)")
            return {
                'accessible': None,
                'latency_ms': None,
                'error': 'ffprobe not installed',
                'codec_info': None
            }
        except subprocess.TimeoutExpired:
            print(f"  ✗ Probe timeout")
            return {
                'accessible': False,
                'latency_ms': 5000,
                'error': 'Stream timeout',
                'codec_info': None
            }
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return {
                'accessible': False,
                'latency_ms': None,
                'error': str(e),
                'codec_info': None
            }
    
    def get_snapshot_file(self, filename: str) -> Optional[str]:
        """
        Get full path to snapshot file
        
        Args:
            filename: Snapshot filename
        
        Returns:
            Full filepath or None if doesn't exist
        """
        filepath = os.path.join(self.snapshots_dir, filename)
        
        if os.path.exists(filepath) and os.path.isfile(filepath):
            return filepath
        
        return None
    
    def list_snapshots(self, limit: int = 10) -> list:
        """
        List available snapshots
        
        Args:
            limit: Maximum number to return
        
        Returns:
            List of snapshot info dicts
        """
        snapshots = []
        
        if os.path.exists(self.snapshots_dir):
            files = sorted(
                os.listdir(self.snapshots_dir),
                key=lambda x: os.path.getmtime(os.path.join(self.snapshots_dir, x)),
                reverse=True
            )[:limit]
            
            for filename in files:
                filepath = os.path.join(self.snapshots_dir, filename)
                if os.path.isfile(filepath):
                    snapshots.append({
                        'filename': filename,
                        'url': f'/api/snapshot/{filename}',
                        'file_size_bytes': os.path.getsize(filepath),
                        'created': datetime.fromtimestamp(
                            os.path.getmtime(filepath)
                        ).isoformat()
                    })
        
        return snapshots
    
    def get_stream_config(self, rtsp_url: str) -> dict:
        """
        Get stream configuration for frontend
        
        Returns:
            {
                'live_stream_url': '/live-stream?url=...',
                'snapshot_url': '/api/snapshot?url=...',
                'status': 'ONLINE'/'OFFLINE'
            }
        """
        validation = self.validate_rtsp_url(rtsp_url)
        
        return {
            'rtsp_url': rtsp_url,
            'live_stream_url': f'/live-stream?rtsp_url={rtsp_url.replace("://", "%3A%2F%2F")}',
            'snapshot_base_url': '/api/snapshot/',
            'status': 'ONLINE' if validation['accessible'] else 'OFFLINE',
            'latency_ms': validation['latency_ms'],
            'accessible': validation['accessible']
        }
