# NIVARA — Modern College Operating System

> *"Don't show everything. Show what matters."*  
> An institutional campus operating system designed around urgency, role clarity, and multi-user synchronization.

[![Built with React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646cff.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/CSS-Design_Tokens-026AA2.svg)](./src/styles/tokens.css)
[![Architecture](https://img.shields.io/badge/RBAC-8_Roles-027A48.svg)](./docs/roles-and-permissions.md)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E.svg)](./docs/supabase-schema.sql)

---

## 🌟 Overview

Nivara replaces the cluttered, menu-heavy traditional college ERP with a calm, streamlined interface inspired by products like Linear and Notion. Instead of overwhelming students and faculty with 15+ complex menus and raw tables, Nivara focuses on:
- **What is happening right now?** (Active class, room location, attendance safety)
- **What needs attention in the next 48 hours?** (Urgent assignments, upcoming fees, low attendance thresholds)
- **What is coming up next?** (Examinations, placement recruitment deadlines, departmental circulars)

---

## 🏛 The 8 Institutional Roles

Nivara provides 8 distinct, dedicated portals linked by an active institutional RBAC engine:

1. **🎓 Student Portal:** Timetable stream, attendance thresholds with safe bunking calculations, assignment submission, online fee payments & receipts, placement drives, and duty leave requests.
2. **👩‍🏫 Faculty Portal:** Rapid 1-tap attendance marking, assignment creation, grading queue, Continuous Internal Assessment (CIA) marks entry, and student duty leave concurrence.
3. **👔 Head of Department (HOD) Portal:** Department vitals radar, at-risk student monitoring (<75%), duty leave sanctioning with attendance concessions, and faculty workload management.
4. **🏛 Principal & Dean Portal:** Executive college radar, 5-department performance matrix, fee recovery benchmarks, and campus placement metrics.
5. **⚙️ ERP System Administrator Portal:** Master academic divisions, classroom conflict reallocation, user RBAC account management, and system configuration.
6. **📝 Exam Cell Portal:** Examination schedule, hall seating inspection, faculty CIA mark moderation audits, and semester result gazette publication.
7. **💳 Finance & Accounts (Bursar) Portal:** Tuition fee structures, pending student dues tracking, physical bank DD offline payment recording, and verified receipt generation.
8. **💼 Placement Officer (CDC) Portal:** Campus drive creation, candidate eligibility filtering (CGPA & backlogs), recruitment pipeline tracking (Shortlisted → Interview → Offer).

---

## ⚡ Real-Time Multi-Tab Synchronization

Nivara features an institutional data layer that synchronizes mutations instantly across browser sessions without page refreshes:
- Powered by `BroadcastChannel('nivara_realtime_sync')` + local storage persistence.
- Any action performed by one role (e.g. Faculty marking attendance, HOD approving leave, Finance reconciling a fee) reflects **in real time** in the Student and Admin dashboards.

---

## 🚀 Getting Started

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Build for production (verifies all modules)
npm run build

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Institutional Demo Credentials (Password: `Password@123`)
| Role | Email |
|---|---|
| Student | `student@nivara.edu` |
| Faculty | `faculty@nivara.edu` |
| HOD | `hod@nivara.edu` |
| Principal | `principal@nivara.edu` |
| ERP Admin | `admin@nivara.edu` |
| Exam Cell | `examcell@nivara.edu` |
| Finance | `finance@nivara.edu` |
| Placement | `placement@nivara.edu` |

*Use the 1-click **Development Testing Credentials** panel on the login page to sign into any role immediately.*

---

## 📚 Documentation Reference

- **[Project Status & Roadmap](./PROJECT_STATUS.md):** Complete 20-phase checklist and system specifications.
- **[Production Deployment Guide](./docs/DEPLOYMENT_GUIDE.md):** Cloud hosting and Supabase database configuration.
- **[PostgreSQL Database Schema](./docs/supabase-schema.sql):** Production schema with RLS, enums, tables, and foreign keys.
- **[Database Seed Data](./docs/supabase-seed.sql):** SQL script to pre-populate all 8 roles and demo records.
- **[Persona Profiles & Data Matrix](./docs/demo-data.md):** Mathematical consistency checks and profile specifications.
- **[Design System](./docs/design-system.md):** Minimalist tokens, typography, and elevation specs.

---

## 📄 License & Credits

Developed by **Tetravate** for academic institution workflow transformation.
All rights reserved.
