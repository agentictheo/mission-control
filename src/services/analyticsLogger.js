import { hasSupabaseEnv, supabase, warnMissingSupabaseEnvOnce } from '../lib/supabaseClient';

const MODEL_BUDGETS = {
  haiku: 2_000_000,
  sonnet: 500_000,
  opus: 100_000,
};

function normalizeStatus(value, fallback = 'unknown') {
  if (!value || typeof value !== 'string') {
    return fallback;
  }
  return value.toLowerCase();
}

function safeIsoDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function chunk(items, size = 50) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function insertRows(table, rows) {
  if (!rows?.length) {
    return;
  }

  for (const batch of chunk(rows)) {
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      throw new Error(`[analytics] ${table} insert failed: ${error.message}`);
    }
  }
}

class AnalyticsLogger {
  canLog() {
    if (!hasSupabaseEnv() || !supabase) {
      warnMissingSupabaseEnvOnce();
      return false;
    }

    return true;
  }

  getAgentRows(data) {
    const agents = Array.isArray(data?.agents) ? data.agents : [];

    return agents.map((agent) => {
      const usage = agent?.tokens || {};
      return {
        agent_id: agent?.id ?? null,
        agent_name: agent?.name ?? null,
        status: normalizeStatus(agent?.status),
        session_count: toNumber(agent?.sessions, 0),
        last_activity: safeIsoDate(agent?.lastActive),
        token_usage_haiku: toNumber(usage?.haiku, 0),
        token_usage_sonnet: toNumber(usage?.sonnet, 0),
        token_usage_opus: toNumber(usage?.opus, 0),
      };
    });
  }

  getCronRows(data) {
    const jobs = Array.isArray(data?.cron) ? data.cron : [];

    return jobs.map((job) => ({
      job_id: job?.id ?? null,
      job_name: job?.name ?? null,
      schedule: job?.schedule ?? null,
      last_run: safeIsoDate(job?.lastRun),
      next_run: safeIsoDate(job?.nextRun),
      health_status: normalizeStatus(job?.health),
      run_duration_ms: toNumber(job?.durationMs ?? job?.duration, null),
    }));
  }

  getSystemHealthRow(data) {
    const onlineStatuses = ['online', 'up', 'ok'];
    const agents = Array.isArray(data?.agents) ? data.agents : [];
    const cron = Array.isArray(data?.cron) ? data.cron : [];

    return {
      gateway_status: normalizeStatus(data?.gateway?.status),
      canvas_status: normalizeStatus(data?.canvas?.status),
      agents_status: agents.some((agent) => onlineStatuses.includes(normalizeStatus(agent?.status)))
        ? 'online'
        : agents.length > 0
          ? 'degraded'
          : 'unknown',
      cron_status: cron.length > 0 ? 'online' : 'unknown',
      database_status: normalizeStatus(data?.database?.status),
      database_ping_ms: toNumber(data?.database?.ping, null),
    };
  }

  getModelUsageRows(data) {
    const agents = Array.isArray(data?.agents) ? data.agents : [];

    return agents.flatMap((agent) => {
      const tokens = agent?.tokens || {};
      const models = ['haiku', 'sonnet', 'opus'];

      return models.map((model) => {
        const today = Math.max(toNumber(tokens?.[model], 0), 0);
        const budget = MODEL_BUDGETS[model] || 1;

        return {
          bot_name: agent?.name ?? agent?.id ?? 'unknown',
          model,
          tokens_today: today,
          tokens_total: today,
          cost_estimate: null,
          daily_budget_percent: Number(((today / budget) * 100).toFixed(2)),
        };
      });
    });
  }

  async logSnapshot(gatewayData) {
    if (!gatewayData || !this.canLog()) {
      return;
    }

    try {
      await Promise.all([
        insertRows('system_health', [this.getSystemHealthRow(gatewayData)]),
        insertRows('agent_status', this.getAgentRows(gatewayData)),
        insertRows('cron_jobs', this.getCronRows(gatewayData)),
        insertRows('model_usage', this.getModelUsageRows(gatewayData)),
      ]);
    } catch (error) {
      console.error(error.message || '[analytics] Failed to log snapshot.', error);
    }
  }
}

export const analyticsLogger = new AnalyticsLogger();
