# 🎨 Dashboard UI Reference - New Features

## New Button Layout (Top Right)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Security Dashboard                                                 │
│  Monitor and protect your camera network in real-time              │
│                                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌───────────┐ ┌─────────┐ ┌──────────┐│
│  │ 🔔   │ │ 📁   │ │ 📄   │ │ ➕ Add    │ │ 🔄      │ │ ▶ Run    ││
│  │Alerts│ │Groups│ │Export│ │   Camera  │ │ Refresh │ │   Scan   ││
│  └──────┘ └──────┘ └──────┘ └───────────┘ └─────────┘ └──────────┘│
│     ↑        ↑        ↑           ↑            ↑           ↑        │
│    NEW      NEW      NEW       EXISTING     EXISTING   EXISTING    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Feature Modals

### 1. 🔔 Alert Settings Modal

```
┌──────────────────────────────────────────────────────────┐
│  🔔 Alert Settings                                    ✕  │
│  Configure email and SMS notifications                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  📧 Email Alerts                         [Toggle: ON ]   │
│  ├─ Add Email: [email@example.com    ] [Add Button]     │
│  ├─ • admin@company.com               [✕]               │
│  ├─ • security@company.com            [✕]               │
│  └─ [🧪 Send Test Email]                                 │
│                                                           │
│  📱 SMS Alerts                           [Toggle: OFF]   │
│  └─ Receive alerts via SMS (requires Twilio)             │
│                                                           │
│  ⚙️ Alert Thresholds                                     │
│  ├─ Critical Threshold: [━━━●━━━━━━] 30                 │
│  └─ High Priority: [━━━━━━●━━━] 60                      │
│                                                           │
│  🎯 Alert Triggers                                       │
│  ├─ [✓] Alert on critical vulnerabilities                │
│  ├─ [✓] Alert on health score drops (≥20 points)        │
│  └─ [ ] Alert on new device discovery                   │
│                                                           │
│                            [Cancel] [💾 Save Settings]   │
└──────────────────────────────────────────────────────────┘
```

**Key Actions:**
- Toggle email/SMS on/off
- Add multiple recipients
- Test alerts before enabling
- Adjust alert sensitivity
- Choose what triggers alerts

---

### 2. 📄 Export Report Modal

```
┌──────────────────────────────────────────────────────────┐
│  📄 Export Security Report                            ✕  │
│  Generate a comprehensive PDF report                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Select Devices               [Select All] [Deselect]   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [✓] Camera 1 - Front Door    127.0.0.1  • 95    │    │
│  │ [✓] Camera 2 - Backyard      127.0.0.2  • 88    │    │
│  │ [✓] Camera 3 - Garage        127.0.0.3  • 62    │    │
│  │ [ ] Camera 4 - Living Room   127.0.0.4  • 45    │    │
│  └─────────────────────────────────────────────────┘    │
│  ⚠️ Please select at least one device                    │
│                                                           │
│  Report Sections                                         │
│  ├─ [✓] Executive Summary                                │
│  ├─ [✓] Statistics & Charts                              │
│  ├─ [✓] Device Details                                   │
│  ├─ [✓] Vulnerabilities                                  │
│  └─ [✓] Recommendations                                  │
│                                                           │
│  📋 Report Preview                                       │
│  Your report will include 3 device(s) with               │
│  5 section(s). The PDF will be downloaded                │
│  automatically when ready.                               │
│                                                           │
│                         [Cancel] [⬇ Generate PDF]       │
└──────────────────────────────────────────────────────────┘
```

**Key Actions:**
- Select specific devices or all
- Choose report sections
- Generate professional PDF
- Instant download

---

### 3. 📁 Group Management Modal

```
┌──────────────────────────────────────────────────────────┐
│  📁 Group Management                                  ✕  │
│  Organize cameras by room or location                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ➕ Create New Group                                     │
│  ├─ Group name: [Living Room            ] [Create]      │
│  ├─ Color: [🔵] [🟣] [🔴] [🟠] [🟡] [🟢] [🔷] [◯]        │
│  └─ Assign Cameras:                                      │
│     ├─ [✓] Camera 1 - Front Door                         │
│     ├─ [ ] Camera 2 - Backyard                           │
│     └─ [✓] Camera 4 - Living Room                        │
│                                                           │
│  🏷️ Existing Groups (3)                                 │
│                                                           │
│  🔵 Living Room                          [✏️] [🗑️]       │
│  └─ 2 cameras                                            │
│     ├─ [✓] Camera 1 - Front Door                         │
│     ├─ [ ] Camera 2 - Backyard                           │
│     ├─ [ ] Camera 3 - Garage                             │
│     └─ [✓] Camera 4 - Living Room                        │
│                                                           │
│  🟢 Outdoor                              [✏️] [🗑️]       │
│  └─ 2 cameras                                            │
│                                                           │
│  🟠 Critical Areas                       [✏️] [🗑️]       │
│  └─ 1 camera                                             │
│                                                           │
│                                        [Done]            │
└──────────────────────────────────────────────────────────┘
```

**Key Actions:**
- Create unlimited groups
- Choose custom colors
- Assign cameras to multiple groups
- Edit group membership
- Delete groups (cameras remain)

---

## Workflow Examples

### 🎯 Example 1: Set Up Critical Alerts

```
1. Click [🔔 Alerts] button
                ↓
2. Toggle Email Alerts [ON]
                ↓
3. Add email: security@company.com
                ↓
4. Set Critical Threshold: 30
                ↓
5. Check "Alert on critical vulnerabilities"
                ↓
6. Click [🧪 Send Test Email]
                ↓
7. Click [💾 Save Settings]
                ↓
   ✅ Done! You'll be notified of critical issues
```

### 📊 Example 2: Generate Audit Report

```
1. Click [▶ Run Scan] to get latest data
                ↓
2. Wait for scan to complete
                ↓
3. Click [📄 Export] button
                ↓
4. Select "All Devices" or choose specific ones
                ↓
5. Ensure all sections are checked
                ↓
6. Click [⬇ Generate PDF]
                ↓
   ✅ PDF downloads automatically!
```

### 🏷️ Example 3: Organize by Location

```
1. Click [📁 Groups] button
                ↓
2. Type "Ground Floor" in group name
                ↓
3. Pick 🔵 Blue color
                ↓
4. Select cameras on ground floor
                ↓
5. Click [Create]
                ↓
6. Repeat for "First Floor" (🟣 Purple)
                ↓
7. Repeat for "Outdoor" (🟢 Green)
                ↓
   ✅ Cameras organized by location!
```

---

## Visual Indicators

### Alert Status (Sidebar)
```
┌────────────────────┐
│ 🔔 Alerts          │
│ ✅ Email: Active   │
│ ⏸️ SMS: Disabled   │
└────────────────────┘
```

### Group Badges (Device List)
```
Camera 1 - Front Door
🔵 Living Room  🟠 Critical Areas
Health: 95/100
```

### Export Status
```
⏳ Generating report...
✅ Report ready! Downloading...
```

---

## Keyboard Shortcuts (Planned)

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+A` | Open Alerts |
| `Ctrl+Alt+E` | Export Report |
| `Ctrl+Alt+G` | Manage Groups |
| `Ctrl+Alt+T` | Test Alert |

---

## Mobile View (Responsive)

```
┌─────────────────┐
│ SmartCam Shield │
├─────────────────┤
│ [☰] Menu        │
│                 │
│ [🔔] Alerts     │
│ [📁] Groups     │
│ [📄] Export     │
│ [➕] Add Camera │
│ [▶️] Run Scan   │
└─────────────────┘
```

---

## Color Guide

### Group Colors
- 🔵 **Blue** (#3b82f6) - Default, general areas
- 🟣 **Purple** (#8b5cf6) - Important areas
- 🔴 **Red** (#ef4444) - Critical areas
- 🟠 **Orange** (#f97316) - Warning zones
- 🟡 **Yellow** (#eab308) - Medium priority
- 🟢 **Green** (#10b981) - Low risk areas
- 🔷 **Cyan** (#06b6d4) - Special zones
- ⚪ **Pink** (#ec4899) - Custom areas

### Alert Severity
- 🔴 **Critical** (Health ≤ 30) - Immediate action
- 🟠 **High** (Health ≤ 60) - Urgent
- 🟡 **Medium** (Health ≤ 80) - Monitor
- 🟢 **Low** (Health > 80) - All good

---

## Success Indicators

### Email Alert Sent
```
┌──────────────────────────────────┐
│ ✅ Email sent successfully!      │
│ Sent to 2 recipient(s)           │
└──────────────────────────────────┘
```

### PDF Generated
```
┌──────────────────────────────────┐
│ ✅ Report generated!             │
│ SmartCam_Report_2024-12-11.pdf   │
│ Downloaded to your device        │
└──────────────────────────────────┘
```

### Group Created
```
┌──────────────────────────────────┐
│ ✅ Group "Living Room" created!  │
│ 3 cameras assigned               │
└──────────────────────────────────┘
```

---

## Quick Reference Card

Print this and keep it handy! 📝

```
╔══════════════════════════════════════════╗
║   SMARTCAM SHIELD - QUICK REFERENCE      ║
╠══════════════════════════════════════════╣
║ 🔔 ALERTS    - Get notified of issues    ║
║ 📁 GROUPS    - Organize cameras          ║
║ 📄 EXPORT    - Generate reports          ║
║ ➕ ADD       - Add manual camera         ║
║ 🔄 REFRESH   - Reload device list        ║
║ ▶️ SCAN      - Run security scan         ║
╠══════════════════════════════════════════╣
║ EMERGENCY: Check critical cameras first  ║
║ WEEKLY: Export report for management     ║
║ MONTHLY: Review and update groups        ║
╚══════════════════════════════════════════╝
```

---

**Your dashboard is now supercharged! 🚀**

All three features are accessible from the top-right buttons.
Start with Alerts → then Groups → then Export your first report!
