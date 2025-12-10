"""
PDF Report Generator
Creates comprehensive security reports for camera devices
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from datetime import datetime
import io
import os

class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#4f46e5'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='DeviceTitle',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=8,
            fontName='Helvetica-Bold'
        ))
    
    def generate_security_report(self, devices, filename='security_report.pdf', options=None):
        """Generate comprehensive security report"""
        options = options or {}
        
        # Create PDF document
        doc = SimpleDocTemplate(
            filename,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Container for elements
        elements = []
        
        # Title Page
        elements.extend(self._create_title_page(devices))
        elements.append(PageBreak())
        
        # Executive Summary
        if options.get('include_summary', True):
            elements.extend(self._create_executive_summary(devices))
            elements.append(PageBreak())
        
        # Overall Statistics
        if options.get('include_stats', True):
            elements.extend(self._create_statistics_section(devices))
            elements.append(Spacer(1, 0.3*inch))
        
        # Device Details
        if options.get('include_device_details', True):
            for device in devices:
                elements.extend(self._create_device_section(device, options))
                elements.append(Spacer(1, 0.2*inch))
        
        # Recommendations Summary
        if options.get('include_recommendations', True):
            elements.append(PageBreak())
            elements.extend(self._create_recommendations_summary(devices))
        
        # Build PDF
        doc.build(elements)
        
        return {
            'success': True,
            'filename': filename,
            'devices_count': len(devices),
            'generated_at': datetime.now().isoformat()
        }
    
    def _create_title_page(self, devices):
        """Create report title page"""
        elements = []
        
        # Title
        title = Paragraph('SmartCam Shield<br/>Security Assessment Report', self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        # Report metadata
        report_date = datetime.now().strftime('%B %d, %Y at %I:%M %p')
        metadata = [
            ['Report Generated:', report_date],
            ['Total Devices Scanned:', str(len(devices))],
            ['Report Type:', 'Comprehensive Security Assessment'],
            ['Status:', 'Official']
        ]
        
        table = Table(metadata, colWidths=[2.5*inch, 3.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.5*inch))
        
        # Disclaimer
        disclaimer = Paragraph(
            '<b>CONFIDENTIAL</b><br/>'
            'This report contains sensitive security information about network devices. '
            'Handle with appropriate care and distribute only to authorized personnel.',
            self.styles['Normal']
        )
        elements.append(disclaimer)
        
        return elements
    
    def _create_executive_summary(self, devices):
        """Create executive summary section"""
        elements = []
        
        elements.append(Paragraph('Executive Summary', self.styles['SectionHeader']))
        
        # Calculate statistics
        total_devices = len(devices)
        avg_health = sum(d.get('health_score', 0) for d in devices) / max(total_devices, 1)
        
        severity_counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        for device in devices:
            for risk in device.get('identified_risks', []):
                severity_counts[risk.get('severity', 'LOW')] += 1
        
        critical_devices = sum(1 for d in devices if d.get('health_score', 100) < 30)
        vulnerable_devices = sum(1 for d in devices if d.get('health_score', 100) < 70)
        
        # Summary text
        summary_text = f"""
        This security assessment covers <b>{total_devices}</b> IoT camera devices on your network. 
        The average health score is <b>{avg_health:.1f}/100</b>.<br/><br/>
        
        <b>Key Findings:</b><br/>
        • {critical_devices} device(s) require immediate attention (Critical)<br/>
        • {vulnerable_devices} device(s) have security vulnerabilities<br/>
        • {severity_counts['CRITICAL']} critical vulnerabilities detected<br/>
        • {severity_counts['HIGH']} high-priority issues identified<br/><br/>
        
        <b>Overall Risk Assessment:</b><br/>
        {'<font color="red">HIGH RISK</font> - Immediate action required' if critical_devices > 0
         else '<font color="orange">MODERATE RISK</font> - Address vulnerabilities soon' if vulnerable_devices > 0
         else '<font color="green">LOW RISK</font> - Maintain current security posture'}
        """
        
        elements.append(Paragraph(summary_text, self.styles['Normal']))
        elements.append(Spacer(1, 0.2*inch))
        
        return elements
    
    def _create_statistics_section(self, devices):
        """Create statistics section with charts"""
        elements = []
        
        elements.append(Paragraph('Security Statistics', self.styles['SectionHeader']))
        
        # Health Score Distribution
        health_ranges = {'Excellent (80-100)': 0, 'Good (60-79)': 0, 'Fair (40-59)': 0, 'Poor (0-39)': 0}
        
        for device in devices:
            score = device.get('health_score', 0)
            if score >= 80:
                health_ranges['Excellent (80-100)'] += 1
            elif score >= 60:
                health_ranges['Good (60-79)'] += 1
            elif score >= 40:
                health_ranges['Fair (40-59)'] += 1
            else:
                health_ranges['Poor (0-39)'] += 1
        
        # Create table
        stats_data = [
            ['Metric', 'Count', 'Percentage'],
            ['Total Devices', str(len(devices)), '100%'],
            ['Excellent Health', str(health_ranges['Excellent (80-100)']), 
             f"{health_ranges['Excellent (80-100)']/max(len(devices),1)*100:.1f}%"],
            ['Good Health', str(health_ranges['Good (60-79)']), 
             f"{health_ranges['Good (60-79)']/max(len(devices),1)*100:.1f}%"],
            ['Fair Health', str(health_ranges['Fair (40-59)']), 
             f"{health_ranges['Fair (40-59)']/max(len(devices),1)*100:.1f}%"],
            ['Poor Health', str(health_ranges['Poor (0-39)']), 
             f"{health_ranges['Poor (0-39)']/max(len(devices),1)*100:.1f}%"],
        ]
        
        table = Table(stats_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        
        elements.append(table)
        
        return elements
    
    def _create_device_section(self, device, options):
        """Create detailed device section"""
        elements = []
        
        # Device Header
        device_name = str(device.get('device_name', 'Unknown Device'))
        health_score = int(device.get('health_score', 0))
        
        # Health score color
        if health_score >= 80:
            health_color = 'green'
        elif health_score >= 60:
            health_color = 'blue'
        elif health_score >= 40:
            health_color = 'orange'
        else:
            health_color = 'red'
        
        header_text = f'<font color="{health_color}">●</font> {device_name} - Health Score: {health_score}/100'
        elements.append(Paragraph(header_text, self.styles['DeviceTitle']))
        
        # Device Information
        device_info = device.get('device_info', {})
        firmware_info = device.get('firmware_info', {})
        
        info_data = [
            ['IP Address:', str(device.get('ip_address', 'N/A'))],
            ['Model:', str(device_info.get('model', 'N/A'))],
            ['Manufacturer:', str(device_info.get('manufacturer', 'N/A'))],
            ['Firmware:', str(firmware_info.get('version', 'N/A'))],
            ['Status:', str(device.get('status', 'N/A'))],
            ['Last Scanned:', str(device.get('scan_time', 'N/A'))[:19] if device.get('scan_time') else 'N/A'],
        ]
        
        info_table = Table(info_data, colWidths=[1.5*inch, 4.5*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 0.1*inch))
        
        # Vulnerabilities
        if options.get('include_vulnerabilities', True):
            risks = device.get('identified_risks', [])
            vulnerabilities = device.get('vulnerabilities', [])
            
            all_issues = []
            
            # Add identified_risks
            for risk in risks:
                all_issues.append({
                    'severity': str(risk.get('severity', 'LOW')),
                    'issue': str(risk.get('issue', 'Unknown')),
                    'impact': str(risk.get('impact', 'N/A'))
                })
            
            # Add vulnerabilities
            for vuln in vulnerabilities:
                all_issues.append({
                    'severity': str(vuln.get('severity', 'LOW')),
                    'issue': str(vuln.get('name', 'Unknown')),
                    'impact': str(vuln.get('description', 'N/A'))
                })
            
            if all_issues:
                elements.append(Paragraph('<b>Identified Vulnerabilities:</b>', self.styles['Normal']))
                
                vuln_data = [['Severity', 'Issue', 'Impact']]
                
                for issue in all_issues:
                    # Convert to strings to avoid type errors
                    issue_str = str(issue['severity'])
                    issue_text = str(issue['issue'])
                    impact_text = str(issue['impact'])
                    
                    vuln_data.append([
                        issue_str,
                        issue_text[:40] + '...' if len(issue_text) > 40 else issue_text,
                        impact_text[:50] + '...' if len(impact_text) > 50 else impact_text
                    ])
                
                vuln_table = Table(vuln_data, colWidths=[1*inch, 2.5*inch, 2.5*inch])
                vuln_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ef4444')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fef2f2')])
                ]))
                
                elements.append(vuln_table)
        
        elements.append(Spacer(1, 0.1*inch))
        
        return elements
    
    def _create_recommendations_summary(self, devices):
        """Create recommendations summary section"""
        elements = []
        
        elements.append(Paragraph('Priority Recommendations', self.styles['SectionHeader']))
        
        # Collect all recommendations
        all_recommendations = []
        
        for device in devices:
            device_name = str(device.get('device_name', 'Unknown'))
            
            # From recommendations field
            for rec in device.get('recommendations', []):
                all_recommendations.append({
                    'device': device_name,
                    'priority': str(rec.get('priority', 'MEDIUM')),
                    'action': str(rec.get('action', 'Security update required'))
                })
            
            # From vulnerabilities field
            for vuln in device.get('vulnerabilities', []):
                all_recommendations.append({
                    'device': device_name,
                    'priority': str(vuln.get('severity', 'MEDIUM')),
                    'action': str(vuln.get('recommendation', vuln.get('name', 'Security update')))
                })
        
        # Sort by priority
        priority_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
        all_recommendations.sort(key=lambda x: priority_order.get(x['priority'], 4))
        
        # Create table
        if all_recommendations:
            rec_data = [['Priority', 'Device', 'Recommended Action']]
            
            for rec in all_recommendations[:15]:  # Top 15
                priority_str = str(rec['priority'])
                device_str = str(rec['device'])
                action_str = str(rec['action'])
                
                rec_data.append([
                    priority_str,
                    device_str[:20] + '...' if len(device_str) > 20 else device_str,
                    action_str[:60] + '...' if len(action_str) > 60 else action_str
                ])
            
            rec_table = Table(rec_data, colWidths=[1*inch, 2*inch, 3*inch])
            rec_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0fdf4')])
            ]))
            
            elements.append(rec_table)
        else:
            elements.append(Paragraph('No recommendations at this time. All devices are secure.', self.styles['Normal']))
        
        return elements

# Singleton instance
pdf_generator = PDFReportGenerator()
