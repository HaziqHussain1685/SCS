#!/usr/bin/env python3
"""
Scan Status Tracker - Tracks real-time scan progress through different stages
Stores status updates that frontend can poll to display timeline
"""

from datetime import datetime
from typing import Dict, Any, List
import json

class ScanStatusTracker:
    """
    Tracks the progress of a scan through different stages
    Stores stages and their completion status
    """
    
    def __init__(self):
        self.stages = {
            'connectivity': {'status': 'pending', 'started': None, 'completed': None, 'message': ''},
            'port_scan': {'status': 'pending', 'started': None, 'completed': None, 'message': ''},
            'service_detection': {'status': 'pending', 'started': None, 'completed': None, 'message': ''},
            'vulnerability_analysis': {'status': 'pending', 'started': None, 'completed': None, 'message': ''},
            'report_generation': {'status': 'pending', 'started': None, 'completed': None, 'message': ''},
        }
        self.current_stage = None
        self.scan_id = None
        
    def get_scan_id(self):
        """Generate unique scan ID"""
        return datetime.now().strftime('%Y%m%d_%H%M%S')
    
    def start_scan(self):
        """Initialize scan"""
        self.scan_id = self.get_scan_id()
        self.current_stage = None
        
        # Reset all stages
        for stage_key in self.stages:
            self.stages[stage_key] = {
                'status': 'pending',
                'started': None,
                'completed': None,
                'message': ''
            }
    
    def start_stage(self, stage_name: str, message: str = ''):
        """Mark stage as started"""
        if stage_name in self.stages:
            self.stages[stage_name]['status'] = 'in_progress'
            self.stages[stage_name]['started'] = datetime.now().isoformat()
            self.stages[stage_name]['message'] = message
            self.current_stage = stage_name
    
    def complete_stage(self, stage_name: str, message: str = ''):
        """Mark stage as completed"""
        if stage_name in self.stages:
            self.stages[stage_name]['status'] = 'completed'
            self.stages[stage_name]['completed'] = datetime.now().isoformat()
            self.stages[stage_name]['message'] = message
    
    def fail_stage(self, stage_name: str, message: str = ''):
        """Mark stage as failed"""
        if stage_name in self.stages:
            self.stages[stage_name]['status'] = 'failed'
            self.stages[stage_name]['completed'] = datetime.now().isoformat()
            self.stages[stage_name]['message'] = message
    
    def get_status(self) -> Dict[str, Any]:
        """Get current scan status"""
        return {
            'scan_id': self.scan_id,
            'current_stage': self.current_stage,
            'stages': self.stages
        }
    
    def get_timeline(self) -> List[Dict[str, Any]]:
        """
        Get timeline data formatted for frontend
        
        Returns:
            List of stage info with status
        """
        stage_labels = {
            'connectivity': 'Device Connectivity',
            'port_scan': 'Port Detection',
            'service_detection': 'Service Analysis',
            'vulnerability_analysis': 'Threat Assessment',
            'report_generation': 'Report Generation',
        }
        
        stage_descriptions = {
            'connectivity': 'Checking if device is reachable',
            'port_scan': 'Scanning for open ports',
            'service_detection': 'Identifying services and versions',
            'vulnerability_analysis': 'Analyzing security vulnerabilities',
            'report_generation': 'Compiling final assessment',
        }
        
        timeline = []
        for stage_id, stage_data in self.stages.items():
            timeline.append({
                'id': stage_id,
                'label': stage_labels.get(stage_id, stage_id),
                'description': stage_descriptions.get(stage_id, ''),
                'status': stage_data['status'],
                'message': stage_data['message'],
                'started': stage_data['started'],
                'completed': stage_data['completed']
            })
        
        return timeline

# Global tracker instance
_tracker = ScanStatusTracker()

def get_tracker() -> ScanStatusTracker:
    """Get global tracker instance"""
    global _tracker
    return _tracker

def reset_tracker():
    """Reset tracker for new scan"""
    global _tracker
    _tracker = ScanStatusTracker()
