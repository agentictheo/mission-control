# 🚀 BUILD ORDERS FOR ELIA

**START TIME:** 2026-02-25 11:50 AM UTC  
**TARGET:** Mission Control Dashboard MVP  
**DEADLINE:** As soon as possible (aim for <8 hours)

---

## ✅ WHAT'S DONE (Ready to use)

- ✅ React + Vite project scaffold (`npm run dev` on port 5173)
- ✅ Tailwind CSS configured
- ✅ `TopBar.jsx` component (Gateway status, time, sticky header)
- ✅ `SystemHealth.jsx` component (5 health cards)
- ✅ `useGatewayStatus.js` hook (API polling every 30s)

---

## 🏗️ WHAT YOU BUILD NOW (Priority Order)

### 1️⃣ App.jsx Main Layout (15 min)
- Import TopBar, SystemHealth, AgentStatus, CronJobs, Usage, TaskPipeline
- Use useGatewayStatus hook
- Layout: header + grid of cards
- Pass data to all components

### 2️⃣ AgentStatus.jsx Card (30 min)
- Show active/idle/error counts
- List all agents with status badges
- Data from `data.agents` (from Gateway API)
- Make it scrollable if >5 agents

### 3️⃣ CronJobs.jsx Card (30 min)
- List all cron jobs
- Show: name, schedule, lastRun, nextRun, health status
- Color-code by health (green/yellow/red)
- Data from `data.cron`

### 4️⃣ Usage.jsx Card (30 min)
- Show token usage per bot (Theo, Tina, Elia, Sara)
- Show: model used, tokens today, % of daily budget
- Progress bars for each bot
- Hardcode for now (can pull from API later)

### 5️⃣ TaskPipeline.jsx Card (45 min)
- Show personal tasks by status columns
- Statuses: Draft → Review → Approved → Published
- For now: hardcode with example tasks
- Tasks load from localStorage (can extend later)

### 6️⃣ Styling & Polish (30 min)
- Dark theme (already have Tailwind)
- Make cards responsive
- Hover effects, smooth transitions
- Match screenshot aesthetic

### 7️⃣ Testing & Fixes (30 min)
- Test on different screen sizes
- Verify API polling works
- Fix any bugs
- Check console for errors

---

## 📝 Component Skeleton (Copy & Modify)

```jsx
// Example: CronJobs.jsx
import React from 'react';

export default function CronJobs({ data, loading }) {
  if (loading) return <div>Loading...</div>;

  const jobs = data?.cron || [];

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
      <h2 className="text-lg font-bold text-white mb-4">⏱️ Cron Jobs</h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {jobs.map((job) => (
          <div key={job.id} className="bg-slate-800 rounded p-3 flex items-center justify-between text-sm">
            <div>
              <p className="text-white font-semibold">{job.name}</p>
              <p className="text-xs text-gray-400">Next: {new Date(job.nextRun).toLocaleString()}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(job.health)}`}>
              {job.health}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    ok: 'bg-green-500/20 text-green-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    error: 'bg-red-500/20 text-red-300',
  };
  return colors[status] || colors.warning;
}
```

---

## 🎨 Tailwind Classes to Use

- **Dark BG:** `bg-slate-900`, `bg-slate-800`, `bg-slate-700/50`
- **Borders:** `border-slate-600`, `border-blue-500/30`
- **Text:** `text-white`, `text-gray-300`, `text-blue-300`
- **Accent:** `text-cyan-400`, `hover:border-blue-500/50`
- **Status colors:** Green/Yellow/Red with transparency

---

## 🔌 API Data Structure (from Gateway)

```javascript
{
  gateway: { status: 'online', uptime: 3600000 },
  canvas: { status: 'online' },
  agents: [
    { id: 'main', name: 'Theo', status: 'active', sessions: 1, lastActive: Date },
    { id: 'developer', name: 'Elia', status: 'idle', sessions: 0, lastActive: Date },
    // ... more agents
  ],
  cron: [
    { id: 1, name: 'Daily Update', schedule: '0 9 * * *', lastRun: Date, nextRun: Date, health: 'ok' },
    // ... more jobs
  ],
  database: { status: 'online', ping: 5 }
}
```

---

## 🚀 Quick Commands

```bash
# Start dev server (already running on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check console in browser
# Open: http://localhost:5173 in Chrome DevTools
```

---

## 📊 Progress Tracking

- [ ] App.jsx layout
- [ ] AgentStatus component
- [ ] CronJobs component
- [ ] Usage component
- [ ] TaskPipeline component
- [ ] Styling & responsive
- [ ] Testing & bugfixes
- [ ] Final commit & ready for deployment

---

## 💡 Tips

1. **Build incrementally** — Get one component working before moving to next
2. **Commit often** — `git add . && git commit -m "Add AgentStatus card"`
3. **Check console** — Fix errors as they appear
4. **Use browser DevTools** — Network tab to verify API calls work
5. **Ask questions** — If Gateway API data format is different, adapt components

---

## 🎯 Success Criteria

✅ Dashboard loads without errors  
✅ All 6 cards visible (TopBar, SystemHealth, AgentStatus, CronJobs, Usage, TaskPipeline)  
✅ Real data from Gateway API (or mock if offline)  
✅ Auto-refreshes every 30s  
✅ Dark theme matching screenshot  
✅ Responsive on mobile + desktop  
✅ No console errors  

---

## 🔔 When Done

Tell Theo:
```
sessions_send(message="theo: Mission Control Dashboard ready at http://localhost:5173")
```

Or just push to git & Theo will check.

---

**LET'S GO! ⚡ Build fast, commit often, iterate quick.**

Questions? Check the full spec at `/home/Theo/.openclaw/workspace/specs/mission-control-dashboard.md`
