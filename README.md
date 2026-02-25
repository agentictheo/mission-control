# 🎮 Mission Control Dashboard

**Real-time system monitoring dashboard for OpenClaw**

Monitor your OpenClaw system health, agent status, cron jobs, and token usage at a glance.

## 🎯 Features

- **Sticky Top Bar** — Real-time Gateway status with Bern timezone
- **System Health** — 5 status cards (Gateway, Canvas, Agents, Cron, Database)
- **Agent Status** — Track all agents (active/idle/error counts + list)
- **Cron Jobs** — Monitor scheduled tasks with health status
- **Token Usage** — See which model each bot is using + daily budget
- **Task Pipeline** — Personal task tracking by status (Draft → Review → Approved → Published)
- **Dark Theme** — Professional, minimal aesthetic
- **Real-time Updates** — Auto-refresh every 30 seconds
- **Responsive Design** — Works on desktop, tablet, mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenClaw running locally (`localhost:18789`)

### Installation

```bash
cd mission-control
npm install
```

### Development

```bash
npm run dev
```

Open browser: **http://localhost:5173**

The dashboard will auto-refresh every 30 seconds from the OpenClaw Gateway API.

### Production Build

```bash
npm run build
npm run preview
```

## 📦 Tech Stack

- **React 18** — UI framework
- **Vite** — Lightning-fast build tool
- **Tailwind CSS** — Dark theme styling
- **Fetch API** — Gateway polling

## 📡 API Integration

Dashboard pulls data from OpenClaw Gateway:

```
GET http://localhost:18789/api/status
```

## 🗄️ Supabase Analytics Logging (every 30s)

Mission Control can persist each polling snapshot to Supabase.

### 1) Run SQL schema in Supabase

1. Open Supabase project: `https://fywmglfnjkoopcvnzvoy.supabase.co`
2. Go to **SQL Editor** → **New query**
3. Paste and run: `supabase/analytics_schema.sql`

This creates:
- `system_health`
- `agent_status`
- `cron_jobs`
- `model_usage`
- `tasks`
- `session_logs`

### 2) Configure environment variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required for logging:

- `VITE_SUPABASE_URL` (already set to the project URL)
- `VITE_SUPABASE_ANON_KEY` (from Supabase → Settings → API)

If these are missing, the dashboard still runs normally and logs this warning once:
`[analytics] Supabase logging disabled: missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY.`

### 3) Verify logging

```bash
npm run dev
```

Open `http://localhost:5173`, wait ~30 seconds, then run in Supabase SQL editor:

```sql
select * from system_health order by created_at desc limit 20;
select * from agent_status order by created_at desc limit 20;
```

Returns:
```json
{
  "gateway": { "status": "online", "uptime": ... },
  "canvas": { "status": "online" },
  "agents": [ { "id": "main", "name": "Theo", "status": "active", ... } ],
  "cron": [ { "name": "Daily Update", "schedule": "0 9 * * *", ... } ],
  "database": { "status": "online", "ping": ... }
}
```

## 🛠️ Development

### Project Structure

```
src/
├── components/
│   ├── TopBar.jsx         # Sticky header with status
│   ├── SystemHealth.jsx   # 5 health cards
│   ├── AgentStatus.jsx    # Agent tracking
│   ├── CronJobs.jsx       # Job monitoring
│   ├── Usage.jsx          # Token usage
│   └── TaskPipeline.jsx   # Task tracking
├── hooks/
│   └── useGatewayStatus.js # API polling hook
├── App.jsx                # Main layout
├── main.jsx               # Entry point
└── index.css              # Global styles
```

### Adding a Component

1. Create component in `src/components/`
2. Import in `App.jsx`
3. Add to layout grid
4. Style with Tailwind classes

### Tailwind Dark Theme

Dashboard uses dark theme by default:
- Background: `bg-slate-900`, `bg-slate-800`
- Text: `text-white`, `text-gray-300`
- Accent: `border-blue-500`, `text-cyan-400`

## 🔌 Gateway API

The `useGatewayStatus` hook handles:
- Polling Gateway API every 30 seconds
- Error handling (shows "Offline" gracefully)
- Caching last-known-good data
- Real-time updates

## 📊 Data Flow

```
OpenClaw Gateway
    ↓
useGatewayStatus hook
    ↓
App.jsx (state)
    ↓
Components (TopBar, SystemHealth, etc.)
    ↓
Browser render
```

## ⚠️ Offline Handling

If Gateway is unreachable:
- Dashboard shows red warning banner
- Last-known data is cached & displayed
- Retries automatically every 30s
- No console errors

## 🚢 Deployment

### Local Only
```bash
npm run dev
# Dashboard at http://localhost:5173
```

### GitHub Pages / Vercel (Later)
```bash
npm run build
# Deploy `dist/` folder to hosting
```

## 🐛 Troubleshooting

### Dashboard shows "Gateway unreachable"
- Check OpenClaw is running: `openclaw status`
- Verify Gateway port 18789 is accessible
- Check browser console for CORS errors

### Test from a remote machine via SSH tunnel

If OpenClaw runs on a remote host, forward the API and Vite ports:

```bash
ssh -L 18789:localhost:18789 -L 5173:localhost:5173 <user>@<server>
```

Then on the remote host start Mission Control:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

On your local browser open `http://localhost:5173`.

### Components not rendering
- Check browser DevTools → Console tab
- Verify data structure from `/api/status`
- Check component props in App.jsx

### Styling looks off
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (`npm run dev`)
- Check Tailwind is properly configured

## 📝 License

Private — Nicola's consulting project

## 🔗 Links

- [OpenClaw Docs](https://docs.openclaw.ai)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ⚡ by Elia for Nicola's consulting team**
