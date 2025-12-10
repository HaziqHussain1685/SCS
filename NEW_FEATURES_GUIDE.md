# New Features Installation Guide

## 🎉 Three New Features Added

### 1. ✨ Email/SMS Alerts
### 2. 📄 PDF Report Export
### 3. 🏷️ Camera Grouping/Tags

---

## Installation Steps

### 1. Install Python Dependencies

Navigate to the `scanner` directory and install new packages:

```powershell
cd scanner
pip install -r requirements.txt
```

This will install:
- `Flask-Mail` - Email notifications
- `twilio` - SMS notifications
- `reportlab` - PDF generation
- `python-dotenv` - Environment variable management

### 2. Configure Environment Variables

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` file with your credentials:

**For Email (Gmail example):**
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password  # Generate from Google Account settings
MAIL_DEFAULT_SENDER=your-email@gmail.com
ALERT_EMAIL_ENABLED=True
```

**For SMS (Twilio - Optional):**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
ALERT_SMS_ENABLED=True
```

**Alert Thresholds:**
```env
ALERT_CRITICAL_THRESHOLD=30
ALERT_HIGH_THRESHOLD=50
```

### 3. Gmail App Password Setup (for Email Alerts)

If using Gmail:
1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate new app password
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password to `.env`

### 4. Twilio Setup (for SMS Alerts - Optional)

1. Sign up at https://www.twilio.com/
2. Get Account SID and Auth Token from console
3. Get a Twilio phone number
4. Add credentials to `.env`

### 5. Restart the Backend

```powershell
cd scanner
python scanner_api.py
```

You should see:
```
Starting SmartCam Shield Scanner API...
API will be available at http://localhost:5000

Endpoints:
  ...
  === Alert Management ===
  GET  /api/alerts/settings
  POST /api/alerts/settings
  POST /api/alerts/test
  
  === PDF Export ===
  POST /api/export/pdf
  
  === Group Management ===
  GET    /api/groups
  POST   /api/groups
  ...
```

---

## Feature Usage

### 📧 Email/SMS Alerts

**Access:** Dashboard → Click "Alerts" button (top right)

**Features:**
- ✅ Configure email recipients
- ✅ Configure SMS recipients (if Twilio is set up)
- ✅ Set alert thresholds (critical/high)
- ✅ Choose alert triggers:
  - Critical vulnerabilities detected
  - Health score drops ≥20 points
  - New device discovered
- ✅ Test alerts before enabling
- ✅ Toggle email/SMS independently

**Email Template:**
- Professional HTML email with branding
- Includes device details, health scores
- Lists vulnerabilities and recommendations
- Direct link to dashboard

**Automatic Triggers:**
- System checks devices during scans
- Sends alerts if conditions match
- No manual intervention needed

---

### 📄 PDF Report Export

**Access:** Dashboard → Click "Export" button (top right)

**Features:**
- ✅ Select specific devices or export all
- ✅ Choose report sections:
  - Executive Summary
  - Statistics & Charts
  - Device Details
  - Vulnerabilities
  - Recommendations
- ✅ Professional PDF layout with branding
- ✅ Tables, charts, and color-coded severity
- ✅ Ready for audits and documentation

**Report Contents:**
- Title page with report metadata
- Executive summary with key findings
- Health score distribution table
- Individual device sections
- Vulnerability details with severity levels
- Priority recommendations with action steps

**Use Cases:**
- 📋 Compliance audits
- 📊 Management reports
- 📝 Security documentation
- 🔍 Incident investigations

---

### 🏷️ Camera Grouping/Tags

**Access:** Dashboard → Click "Groups" button (top right)

**Features:**
- ✅ Create unlimited groups
- ✅ Assign custom colors (8 presets)
- ✅ Add cameras to multiple groups
- ✅ Edit group names and members
- ✅ Delete groups (cameras remain)
- ✅ Visual organization

**Example Groups:**
- 🏠 Living Room
- 🚪 Front Entrance
- 🚗 Garage
- 🌳 Backyard
- 🏢 Office
- 🛏️ Bedrooms

**Benefits:**
- Organize by physical location
- Quick filtering in large installations
- Better overview of camera coverage
- Simplified management

---

## Troubleshooting

### Email Alerts Not Working

**Problem:** Test email fails

**Solutions:**
1. Check Gmail App Password is correct (16 characters, no spaces)
2. Verify 2-Step Verification is enabled in Google Account
3. Check `MAIL_USERNAME` and `MAIL_DEFAULT_SENDER` match
4. Try port 465 with `MAIL_USE_SSL=True` instead of TLS
5. Check spam folder for test emails

**Error:** "Authentication failed"
- Generate a new App Password
- Make sure you're using App Password, not your regular password

### PDF Export Fails

**Problem:** "PDF generation failed"

**Solution:**
```powershell
pip install reportlab
```

**Problem:** Missing charts or formatting issues
- Update reportlab: `pip install --upgrade reportlab`
- Check write permissions in `scanner/reports/` directory

### SMS Not Working

**Problem:** SMS test fails

**Solutions:**
1. Verify Twilio credentials in `.env`
2. Check Twilio account balance
3. Verify phone number format: `+1234567890` (include country code)
4. Check Twilio console for error messages

### Groups Not Saving

**Problem:** Groups disappear after restart

**Solution:**
- Check `scanner/camera_groups.json` file exists
- Verify write permissions in scanner directory
- Check browser console for errors

---

## API Testing

### Test Alert System
```powershell
# Test email alert
curl -X POST http://localhost:5000/api/alerts/test `
  -H "Content-Type: application/json" `
  -d '{"type":"email"}'

# Test SMS alert
curl -X POST http://localhost:5000/api/alerts/test `
  -H "Content-Type: application/json" `
  -d '{"type":"sms"}'
```

### Test PDF Export
```powershell
# Export all devices
curl -X POST http://localhost:5000/api/export/pdf `
  -H "Content-Type: application/json" `
  -d '{"options":{"include_summary":true}}' `
  --output report.pdf
```

### Test Group Management
```powershell
# Create group
curl -X POST http://localhost:5000/api/groups `
  -H "Content-Type: application/json" `
  -d '{"name":"Living Room","color":"#3b82f6"}'

# List groups
curl http://localhost:5000/api/groups
```

---

## Performance Notes

### Email Alerts
- Email sending: ~1-2 seconds per recipient
- Recommended max recipients: 10
- Rate limits: Gmail allows ~500 emails/day

### PDF Export
- Small report (1-5 devices): ~1-2 seconds
- Large report (20+ devices): ~5-10 seconds
- File size: ~100-500 KB per device

### Groups
- No performance impact
- Stored in JSON file (~1 KB per group)
- Instant loading and saving

---

## Security Considerations

### Email Configuration
- ✅ Use App Passwords, not account passwords
- ✅ Restrict email access to trusted recipients
- ✅ Don't commit `.env` file to git
- ✅ Use TLS/SSL for email transmission

### SMS Configuration
- ✅ Protect Twilio credentials
- ✅ Monitor Twilio usage to prevent abuse
- ✅ Use phone number verification
- ✅ Be aware of SMS costs

### PDF Reports
- ⚠️ Reports contain sensitive security data
- ⚠️ Store in secure location
- ⚠️ Delete old reports regularly
- ⚠️ Use encryption for transmission

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env` file
3. ✅ Test each feature individually
4. ✅ Set up automated alerts
5. ✅ Create camera groups for organization
6. ✅ Export your first security report

**Need Help?**
- Check API health: http://localhost:5000/api/health
- View logs in terminal running `scanner_api.py`
- Check browser console for frontend errors

---

## Feature Roadmap

Coming soon:
- 📱 Mobile app notifications
- 📅 Scheduled reports
- 📊 Advanced analytics
- 🔄 Automatic firmware updates
- 🌐 Network topology visualization

Enjoy your enhanced SmartCam Shield! 🎉
