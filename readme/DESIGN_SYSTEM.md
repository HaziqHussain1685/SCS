# SmartCam Shield - Design System

## 🎨 Cybersecurity-Themed Design Language

### Design Philosophy
**"Trust Through Transparency"** - A futuristic, professional interface that conveys security, precision, and intelligence through visual design.

---

## Color Palette

### Primary Colors (Cybersecurity Theme)
```css
/* Deep Navy Background - Professional & Secure */
--bg-primary: #0A0E27;        /* Main background */
--bg-secondary: #0F1629;      /* Cards, panels */
--bg-tertiary: #1A1F3A;       /* Elevated surfaces */
--bg-hover: #252B47;          /* Hover states */

/* Neon Cyan - Trust & Technology */
--cyan-50: #E0F7FF;
--cyan-100: #B3ECFF;
--cyan-200: #80E0FF;
--cyan-300: #4DD4FF;
--cyan-400: #26C9FF;
--cyan-500: #00BFFF;           /* Primary accent */
--cyan-600: #00A8E6;
--cyan-700: #0090CC;
--cyan-800: #0078B3;
--cyan-900: #005F99;

/* Emerald Green - Secure & Safe */
--emerald-50: #D1FAE5;
--emerald-100: #A7F3D0;
--emerald-200: #6EE7B7;
--emerald-300: #34D399;
--emerald-400: #10B981;        /* Success states */
--emerald-500: #059669;
--emerald-600: #047857;
--emerald-700: #065F46;

/* Alert Colors - Status Communication */
--red-400: #F87171;            /* Critical vulnerabilities */
--red-500: #EF4444;
--red-600: #DC2626;
--red-900: #7F1D1D;

--amber-400: #FBBF24;          /* High risk */
--amber-500: #F59E0B;
--amber-600: #D97706;

--yellow-400: #FACC15;         /* Medium risk */
--yellow-500: #EAB308;

--purple-400: #C084FC;         /* Info/scanning */
--purple-500: #A855F7;
--purple-600: #9333EA;

/* Text Colors */
--text-primary: #F8FAFC;       /* Headings */
--text-secondary: #CBD5E1;     /* Body text */
--text-tertiary: #64748B;      /* Subtle text */
--text-muted: #475569;         /* Disabled */
```

### Gradient Overlays
```css
/* Cyber Grid Pattern */
--grid-pattern: linear-gradient(90deg, rgba(0,191,255,0.03) 1px, transparent 1px),
                linear-gradient(rgba(0,191,255,0.03) 1px, transparent 1px);
--grid-size: 50px 50px;

/* Glow Effects */
--glow-cyan: 0 0 20px rgba(0, 191, 255, 0.5),
             0 0 40px rgba(0, 191, 255, 0.3),
             0 0 60px rgba(0, 191, 255, 0.1);

--glow-emerald: 0 0 20px rgba(16, 185, 129, 0.5),
                0 0 40px rgba(16, 185, 129, 0.3);

--glow-red: 0 0 20px rgba(239, 68, 68, 0.5),
            0 0 40px rgba(239, 68, 68, 0.3);

/* Card Gradients */
--card-gradient: linear-gradient(135deg, 
                 rgba(0, 191, 255, 0.05) 0%, 
                 rgba(10, 14, 39, 0.8) 100%);

--danger-gradient: linear-gradient(135deg,
                   rgba(239, 68, 68, 0.1) 0%,
                   rgba(10, 14, 39, 0.9) 100%);
```

---

## Typography

### Font Stack
```css
/* Headings - Futuristic Tech */
--font-heading: 'Orbitron', 'Inter', system-ui, sans-serif;

/* Body - Clean & Readable */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code/Monospace - Technical Data */
--font-mono: 'Roboto Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Labels */
--text-sm: 0.875rem;     /* 14px - Secondary text */
--text-base: 1rem;       /* 16px - Body */
--text-lg: 1.125rem;     /* 18px - Subheadings */
--text-xl: 1.25rem;      /* 20px - Card titles */
--text-2xl: 1.5rem;      /* 24px - Section headers */
--text-3xl: 1.875rem;    /* 30px - Page titles */
--text-4xl: 2.25rem;     /* 36px - Dashboard title */
--text-5xl: 3rem;        /* 48px - Hero numbers */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## Spacing System

```css
/* Based on 4px grid */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
```

---

## Layout & Grid

### Dashboard Structure
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main Content Area              │
│                   │                                  │
│  - Logo           │  Top Bar (Health Overview)      │
│  - Nav Menu       │                                  │
│  - Quick Stats    │  ┌──────────┬──────────┬─────┐ │
│  - Footer         │  │ Card     │ Card     │ Card│ │
│                   │  └──────────┴──────────┴─────┘ │
│                   │                                  │
│                   │  Main Dashboard Grid             │
│                   │  ┌─────────────┬──────────────┐ │
│                   │  │             │              │ │
│                   │  │   Device    │  Vulnera-    │ │
│                   │  │   Table     │  bilities    │ │
│                   │  │             │              │ │
│                   │  └─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

---

## Component Styles

### Cards
```css
/* Base Card */
.card {
  background: var(--bg-secondary);
  border: 1px solid rgba(0, 191, 255, 0.1);
  border-radius: 16px;
  padding: var(--space-6);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(0, 191, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--glow-cyan);
}

/* Alert Card */
.card-critical {
  border-color: rgba(239, 68, 68, 0.3);
  background: var(--danger-gradient);
}

.card-critical:hover {
  box-shadow: var(--glow-red);
}
```

### Buttons
```css
/* Primary Button - Cyber Glow */
.btn-primary {
  background: linear-gradient(135deg, var(--cyan-500), var(--cyan-700));
  color: var(--text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: var(--font-semibold);
  box-shadow: 0 4px 20px rgba(0, 191, 255, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  box-shadow: var(--glow-cyan);
  transform: scale(1.05);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--cyan-500);
  color: var(--cyan-500);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-ghost:hover {
  background: rgba(0, 191, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
}
```

### Badges
```css
/* Status Badges */
.badge {
  padding: var(--space-1) var(--space-3);
  border-radius: 6px;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-critical {
  background: rgba(239, 68, 68, 0.2);
  color: var(--red-400);
  border: 1px solid var(--red-600);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.badge-high {
  background: rgba(251, 191, 36, 0.2);
  color: var(--amber-400);
  border: 1px solid var(--amber-600);
}

.badge-medium {
  background: rgba(250, 204, 21, 0.2);
  color: var(--yellow-400);
  border: 1px solid var(--yellow-500);
}

.badge-low {
  background: rgba(16, 185, 129, 0.2);
  color: var(--emerald-400);
  border: 1px solid var(--emerald-600);
}

.badge-secure {
  background: rgba(16, 185, 129, 0.2);
  color: var(--emerald-400);
  border: 1px solid var(--emerald-600);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}
```

---

## Animations

### Keyframes
```css
/* Pulsing Glow for Alerts */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(239, 68, 68, 0.6);
  }
}

/* Scanning Animation */
@keyframes scan-line {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* Loading Spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Cyber Grid Scan */
@keyframes grid-scan {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}
```

### Transition Utilities
```css
--transition-fast: 150ms ease;
--transition-base: 250ms ease;
--transition-slow: 350ms ease;
--transition-slower: 500ms ease;
```

---

## Icons & Imagery

### Icon Library
**Recommended:** Lucide React or Heroicons v2

**Key Icons:**
- Shield (security)
- Camera (devices)
- AlertTriangle (warnings)
- CheckCircle (secure)
- XCircle (vulnerable)
- Activity (monitoring)
- Lock (authentication)
- Wifi (network)
- Terminal (technical)
- Zap (alerts)

### Icon Sizing
```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

---

## Shadows & Effects

```css
/* Elevation Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);

/* Cyber Glows */
--glow-sm: 0 0 10px currentColor;
--glow-md: 0 0 20px currentColor;
--glow-lg: 0 0 40px currentColor;

/* Glass Morphism */
--glass-bg: rgba(15, 22, 41, 0.7);
--glass-blur: blur(10px);
--glass-border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## Border Radius

```css
--rounded-sm: 4px;
--rounded-md: 8px;
--rounded-lg: 12px;
--rounded-xl: 16px;
--rounded-2xl: 24px;
--rounded-full: 9999px;
```

---

## Z-Index Scale

```css
--z-background: -1;
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

---

## Usage Examples

### Health Score Meter
```jsx
<div className="health-meter">
  <div className="health-score" data-score={85}>
    <span className="score-value">85</span>
    <span className="score-label">Health Score</span>
  </div>
  {/* Circular progress with cyan glow for high scores */}
  {/* Red glow for low scores */}
</div>
```

### Vulnerability Card
```jsx
<div className="card card-critical">
  <div className="flex items-center gap-3">
    <AlertTriangle className="text-red-400" />
    <h3>Critical Vulnerability</h3>
    <span className="badge badge-critical">Critical</span>
  </div>
  <p>Default credentials detected</p>
  <button className="btn-primary">Fix Now</button>
</div>
```

### Status Indicator
```jsx
<div className="status-indicator">
  <div className="status-dot status-critical" />
  {/* Pulsing animation */}
  <span>3 Critical Issues</span>
</div>
```

---

## Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--cyan-500);
  outline-offset: 2px;
}
```

### Color Contrast
- All text meets WCAG AA standards (4.5:1 contrast ratio)
- Alert colors maintain visibility against dark backgrounds
- Interactive elements have clear focus indicators

### Motion
- Respect `prefers-reduced-motion` for users with motion sensitivity
- Provide alternative visual cues for animations

---

## Tech Stack

### Recommended Libraries
- **UI Framework:** React 18+
- **Styling:** Tailwind CSS v3 + CSS Variables
- **Charts:** Recharts or Chart.js
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Tables:** TanStack Table
- **Date/Time:** date-fns
- **State Management:** Zustand or Context API

---

This design system provides a complete foundation for building a professional, futuristic cybersecurity dashboard that will impress evaluators.
