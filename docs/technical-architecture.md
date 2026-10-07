# Technical Architecture — CAMPUS
*Frontend architecture, component boundaries, state synchronization, and reactive patterns.*

---

## 1. System Topology

CAMPUS is engineered as a high-performance, responsive React application built upon Vite, utilizing bespoke **Vanilla CSS** tokens and components to guarantee zero build-overhead, maximum aesthetic precision, and instantaneous load times.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Viewport                       │
│  ┌──────────────────────┐  ┌─────────────────────────────┐  │
│  │ Mobile Fluid Island  │  │ Desktop Sidebar & Omnibar   │  │
│  └──────────┬───────────┘  └──────────────┬──────────────┘  │
│             └──────────────┬──────────────┘                 │
│                            ▼                                │
│                   React 19 Core Engine                      │
│      ┌───────────────────────────────────────────────┐      │
│      │               State Management                │      │
│      │  • Active Persona Context (Student/Faculty/Admin)    │
│      │  • Persistent Local Storage (Theme, Cache, State)     │
│      │  • Command Palette Global Event Dispatcher    │      │
│      │  • Toast Notification & Sound Synthesis Queue │      │
│      └──────────────────────┬────────────────────────┘      │
│                             ▼                               │
│              Pure Vanilla CSS Design System                 │
│  ┌───────────────────┬───────────────────┬────────────────┐ │
│  │ CSS Design Tokens │ Component Classes │ Dark/Light Engine│
│  │ (tokens.css)      │ (components.css)  │ (app.css)      │ │
│  └───────────────────┴───────────────────┴────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Key Technical Decisions

### Why Vite + React?
- **Instant HMR & Lightning Bundle:** Millisecond hot module reloading for rapid iteration.
- **Predictable Reactive State:** Allows instant switching between complex demo roles (Student, Faculty, Admin) and dynamic calculations without DOM race conditions.

### Why Bespoke Vanilla CSS?
- In accordance with Tetravate design taste standards, generic utility frameworks can lead to cookie-cutter aesthetics. Handcrafted CSS variables enable strict double-bezel concentric curves, physics-tuned easing curves, and dark mode palette coherence.

### State Persistence & Offline Readiness
- `localStorage` synchronization for user theme (`dark` / `light`), role switching, task completion toggles, and attendance logs.
- Simulated offline status banner showcasing resilience when network drops are detected.
