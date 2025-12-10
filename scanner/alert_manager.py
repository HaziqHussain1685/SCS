"""
Alert Management System
Handles email and SMS notifications for security events
"""

from flask_mail import Mail, Message
from twilio.rest import Client
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class AlertManager:
    def __init__(self, app=None):
        self.mail = None
        self.twilio_client = None
        self.alert_settings = self.load_alert_settings()
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Flask-Mail and Twilio"""
        # Email configuration
        app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
        app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
        app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
        app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
        app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
        app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
        
        self.mail = Mail(app)
        
        # Twilio configuration
        twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
        twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
        
        if twilio_sid and twilio_token:
            self.twilio_client = Client(twilio_sid, twilio_token)
    
    def load_alert_settings(self):
        """Load alert settings from file"""
        try:
            with open('alert_settings.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                'email_enabled': os.getenv('ALERT_EMAIL_ENABLED', 'False') == 'True',
                'sms_enabled': os.getenv('ALERT_SMS_ENABLED', 'False') == 'True',
                'email_addresses': [],
                'phone_numbers': [],
                'critical_threshold': int(os.getenv('ALERT_CRITICAL_THRESHOLD', 30)),
                'high_threshold': int(os.getenv('ALERT_HIGH_THRESHOLD', 50)),
                'alert_on_new_device': True,
                'alert_on_health_drop': True,
                'alert_on_critical_vuln': True
            }
    
    def save_alert_settings(self, settings):
        """Save alert settings to file"""
        self.alert_settings = settings
        with open('alert_settings.json', 'w') as f:
            json.dump(settings, f, indent=2)
    
    def send_email_alert(self, subject, body, recipients=None):
        """Send email alert"""
        if not self.alert_settings['email_enabled'] or not self.mail:
            return {'success': False, 'message': 'Email alerts disabled or not configured'}
        
        recipients = recipients or self.alert_settings.get('email_addresses', [])
        
        if not recipients:
            return {'success': False, 'message': 'No email recipients configured'}
        
        try:
            msg = Message(
                subject=f"🚨 SmartCam Shield Alert: {subject}",
                recipients=recipients,
                body=body,
                html=self._generate_email_html(subject, body)
            )
            self.mail.send(msg)
            return {'success': True, 'message': f'Email sent to {len(recipients)} recipient(s)'}
        except Exception as e:
            return {'success': False, 'message': f'Email failed: {str(e)}'}
    
    def send_sms_alert(self, message, recipients=None):
        """Send SMS alert"""
        if not self.alert_settings['sms_enabled'] or not self.twilio_client:
            return {'success': False, 'message': 'SMS alerts disabled or not configured'}
        
        recipients = recipients or self.alert_settings.get('phone_numbers', [])
        
        if not recipients:
            return {'success': False, 'message': 'No phone numbers configured'}
        
        results = []
        twilio_number = os.getenv('TWILIO_PHONE_NUMBER')
        
        for phone in recipients:
            try:
                self.twilio_client.messages.create(
                    body=f"SmartCam Shield Alert: {message}",
                    from_=twilio_number,
                    to=phone
                )
                results.append({'phone': phone, 'success': True})
            except Exception as e:
                results.append({'phone': phone, 'success': False, 'error': str(e)})
        
        success_count = sum(1 for r in results if r['success'])
        return {
            'success': success_count > 0,
            'message': f'SMS sent to {success_count}/{len(recipients)} recipient(s)',
            'details': results
        }
    
    def check_and_alert(self, device, previous_device=None):
        """Check device for alert conditions and send notifications"""
        alerts_sent = []
        
        # Critical health score
        if device['health_score'] <= self.alert_settings['critical_threshold']:
            if self.alert_settings['alert_on_critical_vuln']:
                subject = f"CRITICAL: {device['device_name']} Health Score {device['health_score']}"
                body = self._format_critical_alert(device)
                
                email_result = self.send_email_alert(subject, body)
                sms_result = self.send_sms_alert(f"{device['device_name']} is critically vulnerable (Score: {device['health_score']})")
                
                alerts_sent.append({'type': 'critical_health', 'email': email_result, 'sms': sms_result})
        
        # Health score drop
        if previous_device and self.alert_settings['alert_on_health_drop']:
            score_drop = previous_device['health_score'] - device['health_score']
            if score_drop >= 20:
                subject = f"Health Score Drop: {device['device_name']} (-{score_drop} points)"
                body = self._format_health_drop_alert(device, previous_device, score_drop)
                
                email_result = self.send_email_alert(subject, body)
                alerts_sent.append({'type': 'health_drop', 'email': email_result})
        
        # New critical vulnerabilities
        if self.alert_settings['alert_on_critical_vuln']:
            critical_risks = [r for r in device.get('identified_risks', []) if r['severity'] == 'CRITICAL']
            if critical_risks:
                subject = f"New Critical Vulnerabilities: {device['device_name']}"
                body = self._format_vulnerability_alert(device, critical_risks)
                
                email_result = self.send_email_alert(subject, body)
                alerts_sent.append({'type': 'critical_vulnerability', 'email': email_result})
        
        return alerts_sent
    
    def _generate_email_html(self, subject, body):
        """Generate HTML email template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }}
                .footer {{ background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }}
                .alert-badge {{ display: inline-block; padding: 4px 12px; background: #ef4444; color: white; border-radius: 4px; font-weight: bold; }}
                pre {{ background: #1f2937; color: #10b981; padding: 15px; border-radius: 4px; overflow-x: auto; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚨 SmartCam Shield Alert</h1>
                    <p style="margin: 0;">{subject}</p>
                </div>
                <div class="content">
                    <pre>{body}</pre>
                </div>
                <div class="footer">
                    <p>SmartCam Shield Security Monitoring System</p>
                    <p>Alert sent at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _format_critical_alert(self, device):
        """Format critical health score alert"""
        return f"""
🚨 CRITICAL SECURITY ALERT 🚨

Device: {device['device_name']}
IP Address: {device['ip_address']}
Health Score: {device['health_score']}/100

CRITICAL ISSUES DETECTED:
{self._format_risks(device.get('identified_risks', []))}

IMMEDIATE ACTION REQUIRED:
1. Review device security settings immediately
2. Check for unauthorized access
3. Apply recommended security patches
4. Consider disconnecting device if necessary

Dashboard: http://localhost:3000
"""
    
    def _format_health_drop_alert(self, device, previous_device, score_drop):
        """Format health score drop alert"""
        return f"""
⚠️ HEALTH SCORE DROP DETECTED ⚠️

Device: {device['device_name']}
IP Address: {device['ip_address']}

Previous Score: {previous_device['health_score']}/100
Current Score: {device['health_score']}/100
Drop: -{score_drop} points

New Issues Detected:
{self._format_risks(device.get('identified_risks', []))}

Review the device in your dashboard for details.
"""
    
    def _format_vulnerability_alert(self, device, critical_risks):
        """Format vulnerability alert"""
        return f"""
🔴 CRITICAL VULNERABILITIES DETECTED 🔴

Device: {device['device_name']}
IP Address: {device['ip_address']}
Health Score: {device['health_score']}/100

Critical Vulnerabilities ({len(critical_risks)}):
{self._format_risks(critical_risks)}

Recommendations:
{self._format_recommendations(device.get('recommendations', []))}

Take action immediately to secure this device.
"""
    
    def _format_risks(self, risks):
        """Format risks list"""
        if not risks:
            return "None"
        
        formatted = []
        for i, risk in enumerate(risks, 1):
            formatted.append(f"{i}. [{risk['severity']}] {risk['issue']}")
            if 'impact' in risk:
                formatted.append(f"   Impact: {risk['impact']}")
        
        return '\n'.join(formatted)
    
    def _format_recommendations(self, recommendations):
        """Format recommendations list"""
        if not recommendations:
            return "Check dashboard for details"
        
        formatted = []
        for i, rec in enumerate(recommendations[:3], 1):  # Top 3
            formatted.append(f"{i}. {rec.get('action', 'Security update required')}")
        
        return '\n'.join(formatted)

# Singleton instance
alert_manager = AlertManager()
