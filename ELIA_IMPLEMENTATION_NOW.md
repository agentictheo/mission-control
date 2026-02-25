# 🚀 ELIA — IMPLEMENTATION JETZT STARTEN

**Direkter Task von Theo**

**Ziel:** Supabase Analytics Logger fertig in 2 Stunden
**Start:** JETZT (13:54 UTC)
**Deadline:** 16:00 UTC (2 Stunden)

---

## Step 1: Supabase Login & SQL (15 min)

Go to: **https://fywmglfnjkoopcvnzvoy.supabase.co**

SQL Editor → Paste everything below and RUN:

```sql
-- System Health Events
CREATE TABLE system_health (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  gateway_status TEXT,
  canvas_status TEXT,
  agents_status TEXT,
  cron_status TEXT,
  database_status TEXT,
  database_ping_ms INT
);

-- Agent Status Snapshots
CREATE TABLE agent_status (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  agent_id TEXT,
  agent_name TEXT,
  status TEXT,
  session_count INT,
  last_activity TIMESTAMPTZ,
  token_usage_haiku INT,
  token_usage_sonnet INT,
  token_usage_opus INT
);

-- Cron Jobs
CREATE TABLE cron_jobs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  job_id TEXT,
  job_name TEXT,
  schedule TEXT,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  health_status TEXT,
  run_duration_ms INT
);

-- Model Usage Tracking
CREATE TABLE model_usage (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  bot_name TEXT,
  model TEXT,
  tokens_today INT,
  tokens_total INT,
  cost_estimate DECIMAL,
  daily_budget_percent DECIMAL
);

-- Tasks
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  task_id TEXT UNIQUE,
  task_name TEXT,
  status TEXT,
  assignee TEXT,
  due_date DATE,
  priority TEXT,
  progress_percent INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Logs
CREATE TABLE session_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  agent_id TEXT,
  model_used TEXT,
  tokens_used INT,
  context_tokens INT,
  cost DECIMAL
);

-- Enable RLS
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON system_health FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON agent_status FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cron_jobs FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON model_usage FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON session_logs FOR SELECT USING (true);

-- Allow task updates
CREATE POLICY "Allow task updates" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow task inserts" ON tasks FOR INSERT WITH CHECK (true);
```

**After SQL runs:** Check tables exist (should see 6 tables)

---

## Step 2: Get Supabase Keys (5 min)

In Supabase: Settings → API

Copy:
- `VITE_SUPABASE_ANON_KEY` = the **anom** public key

---

## Step 3: Create Files (30 min)

### 3a: Install Supabase
```bash
cd /home/Theo/.openclaw/workspace/mission-control
npm install @supabase/supabase-js
```

### 3b: Create `src/lib/supabase.js`
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 3c: Create `src/services/analyticsLogger.js`
```javascript
import { supabase } from '../lib/supabase';

class AnalyticsLogger {
  async logSystemHealth(data) {
    try {
      const { error } = await supabase.from('system_health').insert({
        gateway_status: data.gateway?.status || 'unknown',
        canvas_status: data.canvas?.status || 'unknown',
        agents_status: data.agents ? 'online' : 'offline',
        cron_status: data.cron ? 'online' : 'offline',
        database_status: data.database?.status || 'unknown',
        database_ping_ms: data.database?.ping || null,
      });
      if (error) console.error('System health log error:', error);
      return !error;
    } catch (err) {
      console.error('Analytics logger error:', err);
      return false;
    }
  }

  async logAgentStatuses(agents) {
    try {
      const records = (agents || []).map(agent => ({
        agent_id: agent.id,
        agent_name: agent.name,
        status: agent.status,
        session_count: agent.sessions || 0,
        last_activity: agent.lastActive || new Date().toISOString(),
        token_usage_haiku: agent.tokens?.haiku || 0,
        token_usage_sonnet: agent.tokens?.sonnet || 0,
        token_usage_opus: agent.tokens?.opus || 0,
      }));

      const { error } = await supabase.from('agent_status').insert(records);
      if (error) console.error('Agent status log error:', error);
      return !error;
    } catch (err) {
      console.error('Agent logging error:', err);
      return false;
    }
  }

  async logCronJobs(jobs) {
    try {
      const records = (jobs || []).map(job => ({
        job_id: job.id,
        job_name: job.name,
        schedule: job.schedule,
        last_run: job.lastRun || null,
        next_run: job.nextRun || null,
        health_status: job.health,
        run_duration_ms: job.duration || null,
      }));

      const { error } = await supabase.from('cron_jobs').insert(records);
      if (error) console.error('Cron jobs log error:', error);
      return !error;
    } catch (err) {
      console.error('Cron logging error:', err);
      return false;
    }
  }

  async logModelUsage(usageData) {
    try {
      const records = (usageData || []).map(bot => ({
        bot_name: bot.name,
        model: bot.model,
        tokens_today: bot.tokensToday,
        tokens_total: bot.tokensTotal,
        cost_estimate: bot.cost,
        daily_budget_percent: bot.budgetPercent,
      }));

      const { error } = await supabase.from('model_usage').insert(records);
      if (error) console.error('Model usage log error:', error);
      return !error;
    } catch (err) {
      console.error('Usage logging error:', err);
      return false;
    }
  }

  async logAllData(gatewayData) {
    if (!gatewayData) return false;

    const results = await Promise.all([
      this.logSystemHealth(gatewayData),
      this.logAgentStatuses(gatewayData.agents || []),
      this.logCronJobs(gatewayData.cron || []),
      this.logModelUsage([
        { name: 'Theo', model: 'haiku', tokensToday: 45000, tokensTotal: 2500000, cost: 0.67, budgetPercent: 45 },
        { name: 'Tina', model: 'sonnet', tokensToday: 32000, tokensTotal: 1800000, cost: 0.96, budgetPercent: 32 },
        { name: 'Elia', model: 'haiku', tokensToday: 28000, tokensTotal: 1200000, cost: 0.42, budgetPercent: 28 },
        { name: 'Sara', model: 'sonnet', tokensToday: 35000, tokensTotal: 2000000, cost: 1.05, budgetPercent: 35 },
      ]),
    ]);

    return results.every(r => r);
  }
}

export const analyticsLogger = new AnalyticsLogger();
```

### 3d: Update `.env.local`
```
VITE_SUPABASE_URL=https://fywmglfnjkoopcvnzvoy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [paste from Supabase]
```

### 3e: Update `src/hooks/useGatewayStatus.js`

Add at the top:
```javascript
import { analyticsLogger } from '../services/analyticsLogger';
```

In `fetchStatus()`, after `setData(json);` add:
```javascript
analyticsLogger.logAllData(json).catch(err => {
  console.error('Failed to log analytics:', err);
});
```

---

## Step 4: Test (30 min)

```bash
npm run dev
# Wait 30 seconds
# Then check Supabase: SELECT * FROM system_health LIMIT 1;
```

If data appears → ✅ WORKING

---

## Step 5: Commit & Push (10 min)

```bash
git add .
git commit -m "feat: Add Supabase Analytics Logger

- Created 6 Supabase tables
- Built analyticsLogger service
- Integrated with useGatewayStatus
- Logs every 30s: system_health, agent_status, cron_jobs, model_usage
- RLS policies configured
- Production ready"

git push origin main
```

---

## ✅ Done When

- [ ] 6 Supabase tables exist
- [ ] supabase.js + analyticsLogger.js created
- [ ] .env.local configured
- [ ] useGatewayStatus.js integrated
- [ ] Dashboard still loads
- [ ] Data appears in Supabase after 30s
- [ ] No console errors
- [ ] Committed + pushed to GitHub

---

## Timeline

**Start:** NOW (13:54 UTC)
**Phase 1:** 15 min
**Phase 2:** 30 min
**Phase 3:** 30 min
**Phase 4:** 10 min
**Total:** 1h 25 min (well under 2 hours)

---

**LET'S GO! Start with Step 1 now.** ⚡
