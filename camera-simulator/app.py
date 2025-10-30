#!/usr/bin/env python3
"""
SmartCam Shield - Camera Simulator
Simulates vulnerable smart cameras for demo purposes.
Opens configurable ports (HTTP, RTSP, Telnet, FTP) and serves device info.
"""

import os
import json
import socket
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from base64 import b64decode

# Configuration from environment variables
MODEL = os.getenv('MODEL', 'GenericCam X1')
FIRMWARE = os.getenv('FIRMWARE', '1.0.0')
DEFAULT_USER = os.getenv('DEFAULT_USER', 'admin')
DEFAULT_PASS = os.getenv('DEFAULT_PASS', 'admin')
OPEN_PORTS = os.getenv('OPEN_PORTS', '80').split(',')
EXPOSED = os.getenv('EXPOSED', 'false').lower() == 'true'
HOST = '0.0.0.0'

# Device info
device_info = {
    'model': MODEL,
    'firmware': FIRMWARE,
    'manufacturer': 'SmartCam Simulator Inc.',
    'last_update': datetime.now().isoformat(),
    'exposed_to_internet': EXPOSED,
    'capabilities': ['video', 'audio', 'motion_detection']
}

# Credentials store (can be updated via API)
credentials = {
    'username': DEFAULT_USER,
    'password': DEFAULT_PASS
}

class CameraHTTPHandler(BaseHTTPRequestHandler):
    """HTTP request handler for camera simulator"""
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[HTTP] {self.address_string()} - {format % args}")
    
    def check_auth(self):
        """Check HTTP Basic Authentication"""
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            return False
        
        try:
            auth_type, auth_string = auth_header.split(' ', 1)
            if auth_type.lower() != 'basic':
                return False
            
            decoded = b64decode(auth_string).decode('utf-8')
            username, password = decoded.split(':', 1)
            
            return username == credentials['username'] and password == credentials['password']
        except Exception as e:
            print(f"[HTTP] Auth error: {e}")
            return False
    
    def send_auth_required(self):
        """Send 401 Unauthorized response"""
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="Camera Login"')
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {'error': 'Authentication required'}
        self.wfile.write(json.dumps(response).encode())
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            # Root path - simple welcome
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = f"""
            <html>
            <head><title>{MODEL}</title></head>
            <body>
                <h1>{MODEL}</h1>
                <p>Firmware: {FIRMWARE}</p>
                <p>Status: Online</p>
                <p><a href="/info">Device Info</a> | <a href="/stream">Live Stream</a></p>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        
        elif self.path == '/info':
            # Device info endpoint (requires auth)
            if not self.check_auth():
                self.send_auth_required()
                return
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(device_info, indent=2).encode())
        
        elif self.path == '/stream':
            # Simulated stream endpoint
            if not self.check_auth():
                self.send_auth_required()
                return
            
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"[Simulated RTSP Stream - Use rtsp://camera:554/stream for actual stream]")
        
        elif self.path == '/api/status':
            # Public status endpoint (no auth required)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            status = {
                'model': MODEL,
                'status': 'online',
                'uptime': '72h 15m'
            }
            self.wfile.write(json.dumps(status).encode())
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/credentials':
            # Update credentials (for demo password change)
            if not self.check_auth():
                self.send_auth_required()
                return
            
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body.decode())
                if 'username' in data:
                    credentials['username'] = data['username']
                if 'password' in data:
                    credentials['password'] = data['password']
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    'success': True,
                    'message': 'Credentials updated',
                    'username': credentials['username']
                }
                self.wfile.write(json.dumps(response).encode())
                print(f"[HTTP] Credentials updated: {credentials['username']}")
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()


def run_http_server(port=80):
    """Run HTTP server"""
    try:
        server = HTTPServer((HOST, port), CameraHTTPHandler)
        print(f"[HTTP] Server started on port {port}")
        server.serve_forever()
    except Exception as e:
        print(f"[HTTP] Error: {e}")


def run_rtsp_simulator(port=554):
    """Simulate RTSP service (basic TCP listener)"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((HOST, port))
        sock.listen(5)
        print(f"[RTSP] Listener started on port {port}")
        
        while True:
            client, addr = sock.accept()
            print(f"[RTSP] Connection from {addr}")
            # Send a simple RTSP response
            response = (
                "RTSP/1.0 200 OK\r\n"
                f"Server: {MODEL}\r\n"
                "Content-Type: application/sdp\r\n"
                "\r\n"
                f"v=0\r\no=- 0 0 IN IP4 {HOST}\r\ns={MODEL} Stream\r\n"
            )
            client.send(response.encode())
            client.close()
    except Exception as e:
        print(f"[RTSP] Error: {e}")


def run_telnet_simulator(port=23):
    """Simulate Telnet service (basic TCP listener with login prompt)"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((HOST, port))
        sock.listen(5)
        print(f"[TELNET] Listener started on port {port}")
        
        while True:
            client, addr = sock.accept()
            print(f"[TELNET] Connection from {addr}")
            # Send login prompt
            client.send(f"\r\n{MODEL} Login\r\nUsername: ".encode())
            # Wait briefly then close (simulated vulnerable service)
            threading.Timer(2.0, client.close).start()
    except Exception as e:
        print(f"[TELNET] Error: {e}")


def run_ftp_simulator(port=21):
    """Simulate FTP service (basic TCP listener)"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((HOST, port))
        sock.listen(5)
        print(f"[FTP] Listener started on port {port}")
        
        while True:
            client, addr = sock.accept()
            print(f"[FTP] Connection from {addr}")
            # Send FTP banner
            client.send(f"220 {MODEL} FTP Server Ready\r\n".encode())
            threading.Timer(2.0, client.close).start()
    except Exception as e:
        print(f"[FTP] Error: {e}")


def main():
    """Main entry point - start all configured services"""
    print("=" * 60)
    print(f"SmartCam Shield - Camera Simulator")
    print(f"Model: {MODEL}")
    print(f"Firmware: {FIRMWARE}")
    print(f"Credentials: {DEFAULT_USER}:{DEFAULT_PASS}")
    print(f"Open Ports: {', '.join(OPEN_PORTS)}")
    print(f"Exposed to Internet: {EXPOSED}")
    print("=" * 60)
    
    threads = []
    
    # Start services based on OPEN_PORTS configuration
    for port_str in OPEN_PORTS:
        port = int(port_str.strip())
        
        if port == 80 or port == 8080:
            t = threading.Thread(target=run_http_server, args=(port,), daemon=True)
            threads.append(t)
        elif port == 554:
            t = threading.Thread(target=run_rtsp_simulator, args=(port,), daemon=True)
            threads.append(t)
        elif port == 23:
            t = threading.Thread(target=run_telnet_simulator, args=(port,), daemon=True)
            threads.append(t)
        elif port == 21:
            t = threading.Thread(target=run_ftp_simulator, args=(port,), daemon=True)
            threads.append(t)
    
    # Start all threads
    for t in threads:
        t.start()
    
    print("\n[MAIN] All services started. Press Ctrl+C to stop.")
    
    # Keep main thread alive
    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        print("\n[MAIN] Shutting down...")


if __name__ == '__main__':
    main()
