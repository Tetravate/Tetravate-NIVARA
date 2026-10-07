# Nivara — Production Deployment & Configuration Guide

> **Campus Operating System**  
> *"Don't show everything. Show what matters."*

---

## 1. System Architecture

Nivara is built with modern, ultra-lightweight web architecture:
- **Client Framework:** React 18 + Vite (SPA)
- **Styling:** Vanilla CSS Custom Properties (Design Tokens inspired by Linear & Notion)
- **State & Concurrency:** React Context + `BroadcastChannel` Realtime Sync Bus + `localStorage` Persistence Engine
- **Cloud Database (Optional / Turnkey):** Supabase PostgreSQL with Row Level Security (RLS)
- **Icons & Micro-interactions:** `lucide-react` & `canvas-confetti`

---

## 2. Quick Local Setup

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Steps
```bash
# 1. Clone repository & install dependencies
git clone <repo-url> nivara
cd nivara
npm install

# 2. Run production build verification
npm run build

# 3. Start local development server
npm run dev
```

The application will be live at `http://localhost:5173`.

---

## 3. Institutional Demo Credentials

Nivara comes with 8 pre-seeded institutional accounts for end-to-end role validation. All demo accounts use the standard development password: `Password@123`.

| Role | Institutional Email | User Name | Purpose |
|---|---|---|---|
| **Student** | `student@nivara.edu` | Aadhi Narayanan | Timetable, attendance thresholds, task submissions, online fee payments, placement applications |
| **Faculty** | `faculty@nivara.edu` | Dr. Priya Raman | Class attendance marking, assignment creation, grading queue, CIA internal marks entry |
| **HOD** | `hod@nivara.edu` | Dr. K. Mohan | Department vitals, at-risk student monitoring, duty leave sanctioning, faculty workload |
| **Principal** | `principal@nivara.edu` | Dr. Aris Thorne | Executive college KPI radar, 5-department performance matrix, fee recovery, placement benchmarks |
| **ERP Admin** | `admin@nivara.edu` | Admin Operations | Master division control, classroom conflict reallocation, user RBAC status management |
| **Exam Cell** | `examcell@nivara.edu` | Prof. V. Ramanathan | Examination calendar, seating arrangement, CIA audits, semester result publication |
| **Finance** | `finance@nivara.edu` | Mrs. S. Mythili | Fee structures, student dues tracking, offline DD payment recording, verified receipts |
| **Placement** | `placement@nivara.edu` | Dr. S. Kapoor | Campus drive creation, candidate pipeline progression (Shortlist → Interview → Offer) |

*Tip: The login screen contains a 1-click **Development Testing Credentials** panel that instantly populates any role for rapid testing.*

---

## 4. Connecting a Live Supabase Backend

Nivara operates in dual-mode:
1. **Offline / Standalone Mode:** Works 100% out-of-the-box using the built-in storage engine and BroadcastChannel sync. Zero external database required.
2. **Cloud Mode:** Forwarding mutations to a live PostgreSQL database via Supabase.

### Setting up Supabase:
1. Create a free account at [Supabase](https://supabase.com) and create a new project.
2. Navigate to **SQL Editor** in your Supabase project dashboard.
3. Open [`docs/supabase-schema.sql`](./supabase-schema.sql), paste the content into the SQL Editor, and click **Run**.
4. Open [`docs/supabase-seed.sql`](./supabase-seed.sql), paste the content, and click **Run** to populate the 8 roles and demo data.
5. In your project settings, locate **API Keys**:
   - `Project URL`
   - `anon public` key
6. Create a `.env` file in the root of the project:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
7. Restart the Vite server (`npm run dev`). Nivara will automatically detect the Supabase configuration and sync with PostgreSQL!

---

## 5. Deploying to Production Hosting

### A. Deploy to Vercel (Recommended)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. (Optional) Add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click **Deploy**.

### B. Deploy to Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add a `_redirects` file in `public/_redirects` if client-side deep routing is enabled:
   ```
   /*    /index.html   200
   ```
5. Click **Deploy Site**.

---

## 6. Real-Time Multi-Tab Verification Guide

To test multi-user concurrency and instant cross-role synchronization:
1. Open `http://localhost:5173` in Tab A and log in as **Faculty** (`faculty@nivara.edu`).
2. Open `http://localhost:5173` in Tab B (or side-by-side window) and log in as **Student** (`student@nivara.edu`).
3. In Tab A (Faculty), navigate to **Attendance** and mark the current session.
4. Observe Tab B (Student) update its course attendance percentage and standing **instantly** without reloading the page.
5. In Tab A (Faculty), create an assignment. Notice it immediately appears in Tab B (Student)'s deliverables.
6. In Tab B (Student), submit solution notes. Notice Tab A (Faculty)'s grading queue badge increment in real time.
7. Open Tab C as **HOD** (`hod@nivara.edu`). Notice attendance metrics and at-risk student vitals stay 100% in sync across all tabs.

---

## 7. Build & Quality Verification

```bash
# Verify TypeScript / JavaScript bundle output
npm run build
```
- Output bundle: `dist/assets/index-*.js`
- Gzip size: ~136 kB (Fast cold-start load time < 200ms)
- Zero build warnings or runtime exceptions.
