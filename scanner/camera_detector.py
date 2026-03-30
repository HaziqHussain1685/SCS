#!/usr/bin/env python3
"""
Camera Detection Module
Identifies if a device is an IP camera based on network indicators
"""

from typing import Dict, List, Any

class CameraDetector:
    """Detect IP cameras from nmap scan results"""
    
    # Strong indicators of IP cameras
    CAMERA_PORT_INDICATORS = {
        554: {"service": "RTSP", "confidence": 100, "reason": "Real-Time Streaming Protocol (video)"},
        8899: {"service": "ONVIF", "confidence": 100, "reason": "ONVIF device management"},
        8089: {"service": "HTTP/MJPEG", "confidence": 80, "reason": "Common camera web interface"},
        8081: {"service": "MJPEG", "confidence": 85, "reason": "MJPEG stream server"},
        8888: {"service": "Web Admin", "confidence": 60, "reason": "Web admin panel"},
        49153: {"service": "ONVIF Alt", "confidence": 75, "reason": "Alternate ONVIF port"},
    }
    
    CAMERA_KEYWORDS = [
        "rtsp", "media", "stream", "live", "camera",
        "video", "onvif", "axis", "hikvision", "dahua",
        "uniview", "v380", "turret", "dome", "bullet",
        "ip-camera", "network camera", "mjpeg", "h264", "h265"
    ]
    
    @staticmethod
    def detect_from_scan(nmap_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze nmap results to determine if device is an IP camera
        
        Returns:
        {
            "is_camera": bool,
            "confidence": 0-100,
            "detected_services": [list of camera services],
            "indicators": [list of detection reasons],
            "camera_type_guess": "string"
        }
        """
        confidence = 0
        indicators = []
        detected_services = []
        
        if "error" in nmap_results:
            return {
                "is_camera": False,
                "confidence": 0,
                "detected_services": [],
                "indicators": ["Error in scan"],
                "camera_type_guess": "Unknown"
            }
        
        # Check open ports
        open_ports = nmap_results.get("open_ports", [])
        port_numbers = [p["port"] for p in open_ports]
        
        # Indicator 1: RTSP on port 554 = CAMERA
        if 554 in port_numbers:
            confidence += 45
            detected_services.append("RTSP (video streaming)")
            indicators.append("✓ RTSP streaming port detected")
        
        # Indicator 2: ONVIF on 8899 = CAMERA
        if 8899 in port_numbers:
            confidence += 40
            detected_services.append("ONVIF management")
            indicators.append("✓ ONVIF device management port detected")
        
        # Indicator 3: Multiple HTTP ports + video keywords = likely camera
        http_ports = [p for p in port_numbers if p in [80, 8080, 8888, 443, 8443]]
        if len(http_ports) >= 2:
            confidence += 10
            indicators.append(f"⚠ Multiple HTTP ports open: {http_ports}")
        
        # Indicator 5: Service name keywords
        all_text = " ".join([str(p.get("service", "")) for p in open_ports]).lower()
        for keyword in CameraDetector.CAMERA_KEYWORDS:
            if keyword in all_text:
                confidence += 5
                detected_services.append(f"Found keyword: {keyword}")
        
        # Determine camera type based on detected services
        camera_type = CameraDetector._guess_camera_type(open_ports, all_text, detected_services)
        
        return {
            "is_camera": confidence >= 50,
            "confidence": min(confidence, 100),
            "detected_services": detected_services,
            "indicators": indicators,
            "camera_type_guess": camera_type
        }
    
    @staticmethod
    def _guess_camera_type(open_ports: List[Dict], service_text: str, detected_services: List[str]) -> str:
        """
        Guess specific camera type based on port combination and services
        """
        port_numbers = [p.get("port") for p in open_ports]
        
        # Strong indicators for specific camera types
        if 554 in port_numbers and 8899 in port_numbers:
            if any(keyword in service_text for keyword in ["axis", "hikvision", "uniview"]):
                return "Professional Network Camera (High-end)"
            return "IP Camera with RTSP + ONVIF Management"
        
        if 554 in port_numbers and 8089 in port_numbers:
            if any(keyword in service_text for keyword in ["v380", "dahua"]):
                return "Consumer/Budget IP Camera (V380, Dahua-style)"
            return "IP Camera with Web Panel"
        
        if 554 in port_numbers:
            return "IP Camera (RTSP only)"
        
        if 8899 in port_numbers:
            return "Device with ONVIF Management"
        
        if 8089 in port_numbers or 8080 in port_numbers:
            if len(port_numbers) == 1:
                return "Web-only Device (possibly IP camera)"
            return "Device with Web Interface"
        
        return "Unknown IoT Device"
