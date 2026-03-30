#!/usr/bin/env python3
"""
Scanner Orchestrator - Clean, Single-Purpose Nmap-Based Scanner
Coordinates all scanning steps and generates a professional report
"""

import json
from datetime import datetime
from typing import Dict, Any

from nmap_wrapper import NmapWrapper
from camera_detector import CameraDetector
from vulnerability_analyzer import VulnerabilityAnalyzer
from risk_scorer import RiskScorer

class IoTCameraScanner:
    """
    Complete IoT camera vulnerability scanner
    Uses ONLY network-level tools (Nmap)
    """
    
    def __init__(self):
        self.nmap_wrapper = NmapWrapper()
        self.camera_detector = CameraDetector()
        self.vuln_analyzer = VulnerabilityAnalyzer()
        self.risk_scorer = RiskScorer()
        
        self.scan_results = None
        self.target_ip = None
    
    def scan_device(self, target_ip: str, full_scan: bool = False) -> Dict[str, Any]:
        """
        Run complete security scan on target IP
        
        Args:
            target_ip: IP address to scan
            full_scan: If True, scan all 65535 ports (slower but comprehensive)
        
        Returns:
            Complete scan report with findings and recommendations
        """
        self.target_ip = target_ip
        scan_start_time = datetime.now()
        
        print(f"\n{'='*80}")
        print(f"IoT CAMERA SECURITY SCANNER v1.0")
        print(f"Target: {target_ip}")
        print(f"Scan Mode: {'FULL (all ports)' if full_scan else 'QUICK (common ports)'}")
        print(f"Started: {scan_start_time}")
        print(f"{'='*80}\n")
        
        # Initialize report
        report = {
            "metadata": {
                "target_ip": target_ip,
                "scan_time": scan_start_time.isoformat(),
                "scan_mode": "FULL" if full_scan else "QUICK",
                "scanner": "IoT-Camera-Scanner v1.0",
                "nmap_stages": []
            },
            "device_info": {},
            "scan_results": {},
            "vulnerabilities": [],
            "risk_assessment": {},
            "recommendations": []
        }
        
        try:
            # Stage 1: Port scan (quick or full based on flag)
            if full_scan:
                print("[Stage 1/5] Running FULL port scan (all 65535 ports)...")
                nmap_results = self.nmap_wrapper.run_full_port_scan(target_ip)
            else:
                print("[Stage 1/5] Running quick port scan (common ports)...")
                nmap_results = self.nmap_wrapper.run_quick_port_scan(target_ip)
            
            report["scan_results"]["ports"] = nmap_results
            
            if "error" in nmap_results:
                print(f"❌ Scan failed: {nmap_results['error']}")
                report["metadata"]["status"] = "FAILED"
                report["metadata"]["error"] = nmap_results.get('error', 'Unknown error')
                return report
            
            open_ports = nmap_results.get('open_ports', [])
            print(f"✓ Found {len(open_ports)} open ports")
            
            # Stage 2: Detect if it's a camera
            print("\n[Stage 2/5] Identifying device type...")
            device_info = self.camera_detector.detect_from_scan(nmap_results)
            report["device_info"] = device_info
            
            if device_info["is_camera"]:
                print(f"✓ CAMERA DETECTED (confidence: {device_info['confidence']}%)")
                print(f"  Type: {device_info['camera_type_guess']}")
                print(f"  Services: {', '.join(device_info['detected_services'])}")
            else:
                print(f"⚠ Device does not appear to be an IP camera")
                print(f"  Confidence: {device_info['confidence']}%")
            
            # Stage 3: RTSP enumeration (if RTSP port found)
            print("\n[Stage 3/5] Running RTSP enumeration...")
            if any(p['port'] == 554 for p in open_ports):
                rtsp_results = self.nmap_wrapper.run_rtsp_enumeration(target_ip)
                report["scan_results"]["rtsp"] = rtsp_results
                if rtsp_results.get('scripts'):
                    print(f"✓ RTSP enumeration complete ({len(rtsp_results['scripts'])} scripts)")
            else:
                print(f"⊘ RTSP (port 554) not found, skipping enumeration")
            
            # Stage 4: Web panel discovery
            print("\n[Stage 4/5] Discovering web admin panels...")
            web_results = self.nmap_wrapper.run_web_panel_discovery(target_ip)
            report["scan_results"]["web"] = web_results
            if web_results.get('scripts'):
                print(f"✓ Web panel discovery complete ({len(web_results['scripts'])} panels)")
            
            # Stage 5: ONVIF detection
            print("\n[Stage 5/5] Detecting ONVIF device management...")
            if any(p['port'] in [8899, 49153] for p in open_ports):
                onvif_results = self.nmap_wrapper.run_onvif_detection(target_ip)
                report["scan_results"]["onvif"] = onvif_results
                print(f"✓ ONVIF detection complete")
            else:
                print(f"⊘ ONVIF ports not found, skipping detection")
            
            # Stage 6: Analyze vulnerabilities
            print("\n[Stage 6/6] Analyzing security vulnerabilities...")
            vulnerabilities = self.vuln_analyzer.analyze(nmap_results, target_ip)
            report["vulnerabilities"] = vulnerabilities
            
            if vulnerabilities:
                print(f"✓ Found {len(vulnerabilities)} vulnerabilities")
                for vuln in vulnerabilities:
                    print(f"  - {vuln['title']} ({vuln['severity']})")
            else:
                print("✓ No vulnerabilities detected")
            
            # Stage 7: Calculate risk
            print("\nCalculating risk score...")
            risk_assessment = self.risk_scorer.calculate_overall_risk(vulnerabilities)
            report["risk_assessment"] = risk_assessment
            
            print(f"✓ Overall Risk: {risk_assessment['level']} ({risk_assessment['score']}/10)")
            print(f"  - Critical: {risk_assessment['breakdown']['critical']}")
            print(f"  - High: {risk_assessment['breakdown']['high']}")
            print(f"  - Medium: {risk_assessment['breakdown']['medium']}")
            print(f"  - Low: {risk_assessment['breakdown']['low']}")
            
            # Stage 8: Generate recommendations
            report["recommendations"] = risk_assessment.get("recommendations", [])
            
            # Calculate actual scan duration
            scan_end_time = datetime.now()
            report["metadata"]["status"] = "COMPLETED"
            report["metadata"]["scan_duration_seconds"] = (scan_end_time - scan_start_time).total_seconds()
            report["metadata"]["scan_end_time"] = scan_end_time.isoformat()
            
            print(f"\n{'='*80}")
            print("✅ SCAN COMPLETED SUCCESSFULLY")
            print(f"Total time: {report['metadata']['scan_duration_seconds']:.1f} seconds")
            print(f"{'='*80}\n")
            
            return report
            
        except Exception as e:
            print(f"\n❌ Error during scan: {str(e)}")
            report["metadata"]["status"] = "ERROR"
            report["metadata"]["error"] = str(e)
            return report
    
    def save_report(self, report: Dict[str, Any], filename: str) -> bool:
        """Save report to JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"✓ Report saved to {filename}")
            return True
        except Exception as e:
            print(f"❌ Failed to save report: {str(e)}")
            return False
    
    def print_report_summary(self, report: Dict[str, Any]) -> None:
        """Print readable summary of scan results"""
        print("\n" + "="*80)
        print("SCAN REPORT SUMMARY")
        print("="*80 + "\n")
        
        # Metadata
        metadata = report.get('metadata', {})
        print(f"Target IP: {metadata.get('target_ip', 'Unknown')}")
        print(f"Scan Time: {metadata.get('scan_time', 'Unknown')}")
        print(f"Scan Mode: {metadata.get('scan_mode', 'QUICK')}")
        print(f"Duration: {metadata.get('scan_duration_seconds', 'Unknown'):.1f} seconds" if metadata.get('scan_duration_seconds') else "")
        
        # Device info
        device_info = report.get("device_info", {})
        if device_info.get("is_camera"):
            print(f"\n📹 DEVICE TYPE: {device_info.get('camera_type_guess', 'IP Camera')}")
            print(f"   Confidence: {device_info.get('confidence', 0)}%")
            print(f"   Services: {', '.join(device_info.get('detected_services', []))}")
        else:
            print(f"\n❓ Device Type: Unknown (likely not an IP camera)")
            print(f"   Confidence: {device_info.get('confidence', 0)}%")
        
        # Port summary
        scan_results = report.get("scan_results", {})
        ports_data = scan_results.get("ports", {})
        open_ports = ports_data.get("open_ports", [])
        if open_ports:
            print(f"\n🔓 OPEN PORTS ({len(open_ports)}):")
            for port_info in open_ports:
                port = port_info.get('port', 'Unknown')
                service = port_info.get('service', 'unknown')
                print(f"   {port:>5}/tcp  {service}")
        
        # Risk summary
        risk = report.get("risk_assessment", {})
        print(f"\n🔐 SECURITY RISK: {risk.get('level', 'UNKNOWN')} ({risk.get('score', 'N/A')}/10)")
        print(f"   {risk.get('description', '')}")
        
        # Vulnerabilities
        vulns = report.get("vulnerabilities", [])
        if vulns:
            print(f"\n⚠️ VULNERABILITIES FOUND: {len(vulns)}")
            for i, vuln in enumerate(vulns[:15], 1):  # Show top 15
                print(f"\n   [{i}] {vuln.get('severity', 'N/A')} - {vuln.get('title', 'Unknown')}")
                print(f"       Port: {vuln.get('affected_port', 'N/A')}")
                print(f"       Issue: {vuln.get('description', '')}")
                print(f"       Effort: {vuln.get('effort', 'Unknown')}")
        else:
            print(f"\n✅ NO VULNERABILITIES FOUND")
        
        # Recommendations
        recommendations = report.get("recommendations", [])
        if recommendations:
            print(f"\n📋 RECOMMENDATIONS:")
            for rec in recommendations:
                print(f"   • {rec}")
        
        print("\n" + "="*80 + "\n")

# CLI Entry point
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python scanner_main.py <target_ip> [--full]")
        print("  target_ip: IP address of device to scan")
        print("  --full: Perform full port scan (optional, slower)")
        sys.exit(1)
    
    target_ip = sys.argv[1]
    full_scan = "--full" in sys.argv
    
    # Run scanner
    scanner = IoTCameraScanner()
    report = scanner.scan_device(target_ip, full_scan=full_scan)
    
    # Save and display
    scanner.save_report(report, f"scan_report_{target_ip}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    scanner.print_report_summary(report)
