# SmartCam Shield - Dashboard Layout & Components

## 🎯 Single-Page Dashboard Architecture

**Decision:** Single-page application with tabbed sections
**Reason:** Real-time monitoring requires persistent visibility of critical metrics while maintaining focus.

---

## Page Structure

### Main Dashboard (Home View)

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed)     │   MAIN CONTENT AREA                │
│                            │                                     │
│ ┌──────────────────────┐  │   ┌───────────────────────────┐   │
│ │  SmartCam Shield     │  │   │   OVERVIEW STATS BAR      │   │
│ │  [Logo]              │  │   │   4 cards showing:        │   │
│ └──────────────────────┘  │   │   - Total Devices (4)     │   │
│                            │   │   - Critical Issues (3)    │   │
│ ┌──────────────────────┐  │   │   - Avg Health (36/100)   │   │
│ │  NAVIGATION          │  │   │   - Last Scan (2m ago)    │   │
│ │  ━━━━━━━━━━━━━━━━   │  │   └───────────────────────────┘   │
│ │  ⚡ Dashboard        │  │                                     │
│ │  📹 Devices (4)      │  │   ┌───────────────────────────┐   │
│ │  🛡️ Vulnerabilities  │  │   │   HEALTH SCORE OVERVIEW   │   │
│ │  📊 Analytics        │  │   │                           │   │
│ │  ⚙️ Settings         │  │   │   ┌───┐ ┌───┐ ┌───┐ ┌───┐│   │
│ └──────────────────────┘  │   │   │85 │ │30 │ │ 0 │ │45 ││   │
│                            │   │   └───┘ └───┘ └───┘ └───┘│   │
│ ┌──────────────────────┐  │   │   Cam1  Cam2  Cam3  Cam4 │   │
│ │  QUICK STATS         │  │   └───────────────────────────┘   │
│ │  ━━━━━━━━━━━━━━━━   │  │                                     │
│ │  🔴 3 Critical       │  │   ┌──────────────┬─────────────┐   │
│ │  🟡 2 High           │  │   │   DEVICE     │ VULNERA-    │   │
│ │  🟢 1 Secure         │  │   │   TABLE      │ BILITIES    │   │
│ └──────────────────────┘  │   │              │ TIMELINE    │   │
│                            │   │  [Live data] │  [Charts]   │   │
│ ┌──────────────────────┐  │   │              │             │   │
│ │  Scan Status         │  │   └──────────────┴─────────────┘   │
│ │  [Scanning... 65%]   │  │                                     │
│ │  [Progress bar]      │  │   ┌───────────────────────────┐   │
│ └──────────────────────┘  │   │  RECENT ALERTS            │   │
│                            │   │  • Default password found │   │
│ [User Profile]             │   │  • Telnet port open       │   │
│ admin@smartcam.shield      │   │  • Firmware outdated      │   │
└────────────────────────────┴───┴───────────────────────────┘
```

---

## Component Specifications

### 1. **Sidebar Navigation** (`Sidebar.jsx`)

**Dimensions:** 240px wide, full height
**Position:** Fixed left
**Background:** Deep navy with subtle grid pattern

```jsx
<Sidebar>
  <Logo />
  <NavMenu>
    <NavItem icon="⚡" label="Dashboard" active badge="4" />
    <NavItem icon="📹" label="Devices" count="4" />
    <NavItem icon="🛡️" label="Vulnerabilities" alert />
    <NavItem icon="📊" label="Analytics" />
    <NavItem icon="⚙️" label="Settings" />
  </NavMenu>
  <QuickStats>
    <StatItem color="red" count="3" label="Critical" pulsing />
    <StatItem color="amber" count="2" label="High" />
    <StatItem color="emerald" count="1" label="Secure" />
  </QuickStats>
  <ScanStatus progress={65} status="Scanning..." />
  <UserProfile />
</Sidebar>
```

**Features:**
- Active item glows with cyan border
- Badge indicators for counts/alerts
- Pulsing red dot for critical items
- Collapsible on mobile (hamburger menu)

---

### 2. **Overview Stats Bar** (`StatsBar.jsx`)

**Layout:** 4-column grid (responsive: 2x2 on tablet, stack on mobile)
**Height:** ~120px

```jsx
<StatsBar>
  <StatCard
    icon={<Camera />}
    label="Total Devices"
    value="4"
    subtitle="Connected"
    color="cyan"
  />
  <StatCard
    icon={<AlertTriangle />}
    label="Critical Issues"
    value="3"
    subtitle="Requires attention"
    color="red"
    pulsing
  />
  <StatCard
    icon={<Shield />}
    label="Avg Health Score"
    value="36/100"
    subtitle="Below threshold"
    color="amber"
  />
  <StatCard
    icon={<Activity />}
    label="Last Scan"
    value="2m ago"
    subtitle="Auto-refresh: ON"
    color="emerald"
  />
</StatsBar>
```

**Visual Design:**
- Card with glass morphism effect
- Large number (48px font) with icon
- Subtle gradient overlay
- Hover: lift + cyan glow

---

### 3. **Health Score Overview** (`HealthScoreGrid.jsx`)

**Layout:** Horizontal scrollable row of circular meters
**Height:** ~250px

```jsx
<HealthScoreGrid>
  {devices.map(device => (
    <HealthMeter
      key={device.id}
      score={device.health_score}
      name={device.name}
      model={device.model}
      status={device.risk_level}
      onClick={() => showDeviceDetails(device)}
    />
  ))}
</HealthScoreGrid>
```

**Health Meter Component:**
```
┌─────────────────┐
│                 │
│    ╭───────╮    │
│   │   85   │   │  ← Circular progress (SVG)
│    ╰───────╯    │     Gradient: green→cyan for high
│                 │     Gradient: red→amber for low
│   Camera 1      │  ← Device name
│   AcmeCam A1    │  ← Model
│   [LOW RISK]    │  ← Badge with glow
│                 │
│ [View Details]  │  ← Ghost button
└─────────────────┘
```

**Interaction:**
- Hover: glow effect matching score
- Click: expand to show details modal
- Score animates on load (0→85)

---

### 4. **Device Table** (`DeviceTable.jsx`)

**Features:**
- Sortable columns
- Search/filter
- Row highlighting based on risk
- Expandable rows for details

```jsx
<DeviceTable>
  <TableHeader>
    <Column sortable>Device</Column>
    <Column sortable>IP Address</Column>
    <Column sortable>Health Score</Column>
    <Column sortable>Risk Level</Column>
    <Column>Open Ports</Column>
    <Column>Actions</Column>
  </TableHeader>
  <TableBody>
    {devices.map(device => (
      <TableRow 
        key={device.id}
        riskLevel={device.risk_level}
        expandable
      >
        <Cell>
          <DeviceIcon type={device.model} />
          <div>
            <p className="font-semibold">{device.name}</p>
            <p className="text-sm text-tertiary">{device.model}</p>
          </div>
        </Cell>
        <Cell>
          <code className="font-mono">{device.ip}</code>
        </Cell>
        <Cell>
          <HealthScore value={device.health_score} />
        </Cell>
        <Cell>
          <Badge variant={device.risk_level}>
            {device.risk_level}
          </Badge>
        </Cell>
        <Cell>
          <PortList ports={device.open_ports} />
        </Cell>
        <Cell>
          <ActionMenu device={device} />
        </Cell>
      </TableRow>
    ))}
  </TableBody>
</DeviceTable>
```

**Visual Design:**
- Alternating row backgrounds (very subtle)
- Critical rows have red left border (3px)
- Hover: brighten background + cyan glow
- Expand: smooth accordion animation

---

### 5. **Vulnerability Timeline** (`VulnerabilityTimeline.jsx`)

**Layout:** Vertical timeline with cards
**Height:** Scrollable container

```jsx
<VulnerabilityTimeline>
  {vulnerabilities.map(vuln => (
    <TimelineItem
      key={vuln.id}
      severity={vuln.severity}
      timestamp={vuln.discovered_at}
    >
      <VulnCard
        icon={getVulnIcon(vuln.type)}
        title={vuln.issue}
        description={vuln.description}
        device={vuln.device_name}
        recommendation={vuln.recommendation}
        severity={vuln.severity}
      />
    </TimelineItem>
  ))}
</VulnerabilityTimeline>
```

**Timeline Item Design:**
```
○─── [2m ago] ───────────────────────────────┐
│                                            │
│  🔴 CRITICAL: Default Credentials         │
│  Device: Camera 3 (OldEye Z200)           │
│  root:12345 detected                      │
│                                            │
│  ⚡ Recommendation:                        │
│  Change password immediately              │
│                                            │
│  [Fix Now] [Dismiss] [Details]            │
│                                            │
└────────────────────────────────────────────┘
```

**Features:**
- Color-coded timeline dots (red/amber/green)
- Pulsing animation for new/unread
- Expandable for full details
- Action buttons (Fix, Dismiss, Learn More)

---

### 6. **Vulnerability Distribution Chart** (`VulnChart.jsx`)

**Type:** Donut chart with legend
**Library:** Recharts
**Size:** 300x300px

```jsx
<VulnChart>
  <DonutChart
    data={[
      { name: 'Weak Credentials', value: 3, color: '#EF4444' },
      { name: 'Outdated Firmware', value: 3, color: '#F59E0B' },
      { name: 'Open Ports', value: 2, color: '#FACC15' },
      { name: 'Exposure', value: 1, color: '#F87171' }
    ]}
    innerRadius={60}
    outerRadius={90}
    centerLabel="9 Total"
  />
  <Legend position="right" />
</VulnChart>
```

**Visual:**
- Gradient fills for each segment
- Hover: segment enlarges + shows tooltip
- Center displays total count
- Legend with clickable items to filter

---

### 7. **Recent Alerts Panel** (`AlertsPanel.jsx`)

**Layout:** Stacked alert cards
**Max visible:** 5 items, scrollable

```jsx
<AlertsPanel>
  <AlertCard severity="critical" unread>
    <AlertIcon>🔴</AlertIcon>
    <AlertContent>
      <AlertTitle>Default password detected</AlertTitle>
      <AlertMeta>Camera 3 • 2 minutes ago</AlertMeta>
    </AlertContent>
    <AlertActions>
      <Button size="sm">Fix</Button>
      <IconButton>×</IconButton>
    </AlertActions>
  </AlertCard>
  
  <AlertCard severity="high">
    <AlertIcon>🟡</AlertIcon>
    <AlertContent>
      <AlertTitle>Telnet port open</AlertTitle>
      <AlertMeta>Camera 4 • 5 minutes ago</AlertMeta>
    </AlertContent>
    <AlertActions>
      <Button size="sm">Review</Button>
    </AlertActions>
  </AlertCard>
</AlertsPanel>
```

**Features:**
- Unread alerts have pulsing glow
- Click to expand details
- Swipe to dismiss (mobile)
- Sound notification toggle

---

### 8. **Scan Progress Indicator** (`ScanProgress.jsx`)

**Location:** Sidebar footer
**State:** Idle | Scanning | Complete | Error

```jsx
<ScanProgress status="scanning" progress={65}>
  <ProgressBar value={65} color="cyan" animated />
  <StatusText>Scanning network... (65%)</StatusText>
  <SubText>Camera 3 of 4</SubText>
  <Actions>
    <Button variant="ghost" size="sm">Cancel</Button>
  </Actions>
</ScanProgress>
```

**Visual:**
- Animated progress bar with moving gradient
- Pulsing icon while scanning
- Success checkmark on complete
- Error shake animation on failure

---

### 9. **Device Details Modal** (`DeviceModal.jsx`)

**Trigger:** Click on device card/table row
**Size:** 800px wide, centered overlay

```jsx
<DeviceModal device={selectedDevice} onClose={handleClose}>
  <ModalHeader>
    <DeviceIcon large />
    <div>
      <h2>{device.name}</h2>
      <p className="text-secondary">{device.model}</p>
    </div>
    <HealthBadge score={device.health_score} />
  </ModalHeader>
  
  <ModalTabs>
    <Tab label="Overview" active>
      <DeviceOverview device={device} />
    </Tab>
    <Tab label="Vulnerabilities">
      <VulnerabilityList vulnerabilities={device.vulnerabilities} />
    </Tab>
    <Tab label="Recommendations">
      <RemediationSteps steps={device.recommendations} />
    </Tab>
    <Tab label="History">
      <ScanHistory scans={device.scan_history} />
    </Tab>
  </ModalTabs>
  
  <ModalFooter>
    <Button variant="ghost" onClick={onClose}>Close</Button>
    <Button variant="primary" onClick={handleRescan}>
      <RefreshIcon /> Rescan Device
    </Button>
  </ModalFooter>
</DeviceModal>
```

**Features:**
- Backdrop blur + dark overlay
- Smooth slide-up animation
- Escape to close
- Tab switching with fade transition

---

### 10. **Remediation Checklist** (`RemediationChecklist.jsx`)

**Layout:** Numbered steps with checkboxes
**Interaction:** Mark as complete

```jsx
<RemediationChecklist steps={device.recommendations}>
  {steps.map((step, index) => (
    <ChecklistItem
      key={index}
      number={index + 1}
      priority={step.priority}
      action={step.action}
      steps={step.steps}
      completed={step.completed}
      onToggle={() => handleToggle(index)}
    />
  ))}
</RemediationChecklist>
```

**Checklist Item:**
```
┌─────────────────────────────────────────────┐
│  🔴 1. [CRITICAL] Change Password           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                             │
│  ☐ 1. Access camera admin panel             │
│  ☐ 2. Go to Settings > User Management      │
│  ☐ 3. Change default password               │
│  ☐ 4. Use strong password (12+ chars)       │
│  ☐ 5. Enable 2FA if available               │
│                                             │
│  [Mark as Complete] [Get Help]              │
└─────────────────────────────────────────────┘
```

**Visual:**
- Checkboxes with smooth check animation
- Completed items fade to 50% opacity
- Progress bar shows % completion
- Priority badge glows

---

## Responsive Behavior

### Desktop (1280px+)
- Sidebar visible, full width
- 4-column stat cards
- Side-by-side device table + vulnerability panel

### Tablet (768px - 1279px)
- Sidebar collapsible (hamburger)
- 2x2 stat cards
- Stacked device table + vulnerability panel

### Mobile (< 768px)
- Bottom navigation bar
- Stacked stat cards
- Simplified table (card view)
- Swipeable device cards

---

## Loading States

### Initial Load
```jsx
<LoadingScreen>
  <Logo animated />
  <LoadingSpinner color="cyan" />
  <LoadingText>Initializing SmartCam Shield...</LoadingText>
  <ProgressBar indeterminate />
</LoadingScreen>
```

### Skeleton Loaders
- Device cards: pulsing placeholders
- Table rows: shimmer animation
- Charts: fade-in transition

---

## Empty States

### No Devices Found
```jsx
<EmptyState
  icon={<CameraOff size={64} />}
  title="No cameras detected"
  description="Connect cameras to your network and run a scan"
  action={
    <Button variant="primary">
      <PlusIcon /> Run First Scan
    </Button>
  }
/>
```

### All Secure
```jsx
<EmptyState
  icon={<Shield size={64} color="emerald" />}
  title="All devices secure!"
  description="No vulnerabilities detected. Great job!"
  celebration
/>
```

---

## Interaction Patterns

### Hover Effects
- **Cards:** Lift 2px + cyan glow
- **Buttons:** Scale 1.05 + brighter
- **Table rows:** Brighten + left border
- **Icons:** Rotate slightly

### Click Feedback
- **Buttons:** Scale down momentarily
- **Checkboxes:** Check animation
- **Modals:** Slide up with backdrop fade

### Animations
- **Page load:** Fade in + slide up (staggered)
- **New alert:** Slide in from right + pulse
- **Scan complete:** Success animation (confetti optional)
- **Error:** Shake animation

---

## Performance Optimizations

1. **Lazy Loading:** Load modals/charts only when needed
2. **Virtual Scrolling:** For large device lists
3. **Debounced Search:** 300ms delay on filter input
4. **Memoization:** React.memo for expensive components
5. **Code Splitting:** Route-based chunks

---

This comprehensive component specification provides everything needed to build a professional, futuristic dashboard that will impress evaluators.
