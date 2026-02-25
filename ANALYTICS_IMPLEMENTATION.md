# 🚀 Analytics Logger Implementation Guide for Elia

**Status:** Ready to Build  
**Supabase Project:** mission-control-analytics (https://fywmglfnjkoopcvnzvoy.supabase.co)  
**Effort:** 4-6 hours  

---

## Step 1️⃣: Get Supabase Keys (15 min)

1. Go to: https://fywmglfnjkoopcvnzvoy.supabase.co
2. Settings → API
3. Copy & save:
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`
4. Add to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://fywmglfnjkoopcvnzvoy.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   ```

---

## Step 2️⃣: Create Supabase Tables (30 min)

Go to SQL Editor in Supabase → Run this:

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

-- Enable RLS (Row Level Security)
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read (anon key can read)
CREATE POLICY "Allow public read" ON system_health FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON agent_status FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cron_jobs FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON model_usage FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON session_logs FOR SELECT USING (true);

-- Allow task updates via anon key
CREATE POLICY "Allow task updates" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow task inserts" ON tasks FOR INSERT WITH CHECK (true);
```

---

## Step 3️⃣: Create Supabase Client (15 min)

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## Step 4️⃣: Create Analytics Logger Service (1 hour)

Create `src/services/analyticsLogger.js`:

```javascript
import { supabase } from '../lib/supabase';

class AnalyticsLogger {
  /**
   * Log system health snapshot
   */
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

  /**
   * Log all agent statuses
   */
  async logAgentStatuses(agents) {
    try {
      const records = agents.map(agent => ({
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

  /**
   * Log cron jobs
   */
  async logCronJobs(jobs) {
    try {
      const records = jobs.map(job => ({
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

  /**
   * Log model usage
   */
  async logModelUsage(usageData) {
    try {
      const records = usageData.map(bot => ({
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

  /**
   * Log all dashboard data
   */
  async logAllData(gatewayData) {
    if (!gatewayData) return false;

    const results = await Promise.all([
      this.logSystemHealth(gatewayData),
      this.logAgentStatuses(gatewayData.agents || []),
      this.logCronJobs(gatewayData.cron || []),
      this.logModelUsage(this.extractModelUsage(gatewayData)),
    ]);

    return results.every(r => r);
  }

  /**
   * Extract model usage from gateway data
   */
  extractModelUsage(data) {
    // Mock data for now (Elia will enhance this)
    return [
      {
        name: 'Theo',
        model: 'haiku',
        tokensToday: 45000,
        tokensTotal: 2500000,
        cost: 0.67,
        budgetPercent: 45,
      },
      // Add other bots...
    ];
  }

  /**
   * Fetch analytics data
   */
  async fetchSystemHealth(limit = 100) {
    const { data, error } = await supabase
      .from('system_health')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    return error ? null : data;
  }

  async fetchAgentHistory(agentId, limit = 50) {
    const { data, error } = await supabase
      .from('agent_status')
      .select('*')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    return error ? null : data;
  }
}

export const analyticsLogger = new AnalyticsLogger();
```

---

## Step 5️⃣: Update useGatewayStatus Hook (30 min)

Modify `src/hooks/useGatewayStatus.js`:

```javascript
import { useState, useEffect } from 'react';
import { analyticsLogger } from '../services/analyticsLogger';

export function useGatewayStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:18789/api/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Gateway returned ${response.status}`);
      }

      const json = await response.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);

      // 🆕 LOG TO SUPABASE
      analyticsLogger.logAllData(json).catch(err => {
        console.error('Failed to log analytics:', err);
      });
    } catch (err) {
      console.error('Gateway status fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, lastUpdated };
}
```

---

## Step 6️⃣: Test Logging (30 min)

1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Wait 30s for first poll
4. Check Supabase:
   - Go to SQL Editor
   - `SELECT * FROM system_health;`
   - Should see data!

---

## Step 7️⃣: Commit & Deploy (15 min)

```bash
git add src/services/ src/lib/ src/hooks/
git commit -m "feat: Add Supabase Analytics Logger

- Created 6 Supabase tables (system_health, agent_status, cron_jobs, model_usage, tasks, session_logs)
- Built analyticsLogger service (insert + fetch)
- Integrated with useGatewayStatus hook
- Logs all Dashboard data every 30s
- RLS policies for secure read/write access
- Environment variables for Supabase keys"

git push origin main
```

---

## ✅ Success Criteria

- [ ] Supabase tables created
- [ ] analyticsLogger.js works
- [ ] Dashboard still loads & functions
- [ ] Data appears in Supabase tables
- [ ] No console errors
- [ ] Git committed
- [ ] Ready for production

---

**LET'S BUILD THIS!** 🚀

Start with Step 1 (Supabase Keys) and work through. Message Theo when done.
