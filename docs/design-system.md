# Design System Specification — CAMPUS
*Bespoke design tokens, typography, component geometry, and haptic interactions for the Tetravate college management flagship.*

---

## 1. Aesthetic Foundations & Anti-Slop Directive

CAMPUS rejects generic dashboard aesthetics:
- **No artificial neon glowing gradients** or muddy dark meshes.
- **No generic Bootstrap 3-card equal grids** or rigid administrative grey tables.
- **No unstyled Lucide thick lines:** Precise 1.25px / 1.5px hairline geometry only.
- **No harsh drop shadows:** Physics-modeled, ultra-soft diffused ambient elevation (`rgba(0,0,0,0.03)` to `rgba(0,0,0,0.08)`).
- **Physical "Double-Bezel" (Doppelrand) Architecture:** Outer machined tray with concentric inner card radii (`rounded-2xl` outer, `rounded-xl` inner).

---

## 2. Color Palette & State Hierarchy

CAMPUS uses a calm, academic, trustworthy palette anchored by refined slate and warm neutral undertones:

```css
:root {
  /* Surface & Base Canvas */
  --bg-app: #F8F9FA;
  --bg-canvas: #FFFFFF;
  --bg-surface: #FFFFFF;
  --bg-subtle: #F1F3F5;
  --bg-hover: #E9ECEF;
  --bg-active: #DEE2E6;

  /* Ink & Typography */
  --text-primary: #111827;      /* High contrast primary text */
  --text-secondary: #4B5563;    /* Clear supporting body text */
  --text-muted: #6B7280;        /* Subtle secondary metadata */
  --text-tertiary: #9CA3AF;     /* Hairline labels & timestamps */

  /* Hairlines & Borders */
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-card: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.16);

  /* Academic Accents (Trust & Focus) */
  --accent-primary: #1E293B;       /* Deep obsidian slate */
  --accent-primary-hover: #0F172A;
  --accent-blue: #2563EB;          /* Royal academic cobalt */
  --accent-blue-subtle: #EFF6FF;

  /* State Semantics (Calm urgency, never alarmist) */
  --state-success: #15803D;        /* Sage / Forest Emerald */
  --state-success-bg: #F0FDF4;
  --state-success-border: #BBF7D0;

  --state-warning: #B45309;        /* Terracotta Amber */
  --state-warning-bg: #FFFBEB;
  --state-warning-border: #FDE68A;

  --state-urgent: #BE123C;         /* Muted Cranberry Rose */
  --state-urgent-bg: #FFF1F2;
  --state-urgent-border: #FECDD3;

  --state-info: #0284C7;           /* Sky Blue */
  --state-info-bg: #F0F9FF;
  --state-info-border: #BAE6FD;
}

[data-theme="dark"] {
  --bg-app: #0B0E14;
  --bg-canvas: #111622;
  --bg-surface: #151C2C;
  --bg-subtle: #1D263B;
  --bg-hover: #26334F;
  --bg-active: #2E3E60;

  --text-primary: #F3F4F6;
  --text-secondary: #D1D5DB;
  --text-muted: #9CA3AF;
  --text-tertiary: #6B7280;

  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-card: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.20);

  --accent-primary: #38BDF8;
  --accent-primary-hover: #7DD3FC;
  --accent-blue: #60A5FA;
  --accent-blue-subtle: #172554;

  --state-success: #4ADE80;
  --state-success-bg: rgba(34, 197, 94, 0.12);
  --state-success-border: rgba(34, 197, 94, 0.25);

  --state-warning: #FBBF24;
  --state-warning-bg: rgba(245, 158, 11, 0.12);
  --state-warning-border: rgba(245, 158, 11, 0.25);

  --state-urgent: #FB7185;
  --state-urgent-bg: rgba(244, 63, 94, 0.12);
  --state-urgent-border: rgba(244, 63, 94, 0.25);

  --state-info: #38BDF8;
  --state-info-bg: rgba(56, 189, 248, 0.12);
  --state-info-border: rgba(56, 189, 248, 0.25);
}
```

---

## 3. Typography Hierarchy

We adopt a modern geometric Grotesk stack (`Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`):

- **Display (Hero greeting):** 28px – 32px / 1.15 tracking `-0.03em`, SemiBold (600)
- **Section Heading:** 20px – 22px / 1.25 tracking `-0.02em`, Medium (500)
- **Card Title / Subject:** 15px – 16px / 1.3 tracking `-0.01em`, SemiBold (600)
- **Body / Content:** 14px / 1.5 tracking `0`, Regular (400)
- **Supporting / Metadata:** 12px – 13px / 1.4 tracking `0`, Regular (400) / Medium (500)
- **Eyebrow Badges:** 10px – 11px uppercase tracking `0.08em`, SemiBold (600)

---

## 4. Component Patterns

### A. The Double-Bezel Card (`.double-bezel-card`)
An outer enclosure tray (`p-1.5`, subtle rim) encasing an inner content surface with concentric corner rounding (`border-radius: 16px` outer, `12px` inner). Produces a physical hardware feel reminiscent of an Apple device or milled aluminium slate.

### B. Island Navigation & Floating Pills
- **Desktop Sidebar:** Clean, border-right navigation with generous vertical spacing and clear active indicator.
- **Mobile Fluid Island:** Fixed bottom tab navigation (`min-height: 64px`), 44px+ touch targets, single-handed ergonomics.
- **Role Selector Pill:** Prominent top-right quick switch with role avatar and clear indication of demo state.

### C. Urgency Tags
- `.tag-urgent`: Subdued cranberry pill with dot indicator (`● Assignment Due Tonight`).
- `.tag-warning`: Terracotta amber pill (`● Attendance: 78%`).
- `.tag-success`: Mint emerald pill (`✓ 92% Attended`).
- `.tag-neutral`: Slate pill (`Room B204 · 50 min`).

---

## 5. Micro-Interactions & Physics
- Transitions: `all 200ms cubic-bezier(0.16, 1, 0.3, 1)` for snappy, weightless responsiveness.
- Button presses: `transform: scale(0.98)` on `:active`.
- Toggles: Instant visual state flip with subtle haptic color transition.
- Celebrations: Confetti burst upon marking 100% attendance or completing critical assignments.
- Motion respect: Strictly wraps in `@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }`.
