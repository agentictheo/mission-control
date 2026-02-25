import React from 'react';

// Fallback mock jobs if gateway doesn't return cron data
const MOCK_JOBS = [
  {
    id: 'tina-daily',
    name: "Tina's Daily Update",
    schedule: '0 7 * * *',
    scheduleLabel: 'Every day at 07:00 UTC',
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
    health: 'success',
    durationMs: 2350,
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat Poll',
    schedule: '*/15 * * * *',
    scheduleLabel: 'Every 15 minutes',
    lastRun: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    nextRun: new Date(Date.now() + 1000 * 60 * 12).toISOString(),
    health: 'success',
    durationMs: 180,
  },
  {
    id: 'memory-compact',
    name: 'Memory Compaction',
    schedule: '0 0 * * 0',
    scheduleLabel: 'Every Sunday at midnight',
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    health: 'success',
    durationMs: 4200,
  },
];

function HealthBadge({ health }) {
  const map = {
    success: { cls: 'bg-green-500/20 text-green-300 border-green-500/40', icon: '✅', label: 'OK' },
    partial: { cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', icon: '⚠️', label: 'Partial' },
    failed: { cls: 'bg-red-500/20 text-red-300 border-red-500/40', icon: '❌', label: 'Failed' },
    unknown: { cls: 'bg-gray-500/20 text-gray-400 border-gray-500/40', icon: '❓', label: 'Unknown' },
  };
  const s = map[health] || map.unknown;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls} flex items-center gap-1`}>
      {s.icon} {s.label}
    </span>
  );
}

function formatRelativeTime(ts) {
  if (!ts) return 'Never';
  const diff = Date.now() - new Date(ts).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatFutureTime(ts) {
  if (!ts) return '—';
  const diff = new Date(ts).getTime() - Date.now();
  if (diff < 0) return 'Overdue';
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `in ${days}d`;
}

function formatDuration(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function CronJobs({ data, loading }) {
  const jobs = (data?.cron?.length > 0 ? data.cron : null) || MOCK_JOBS;

  return (
    <div className="bg-[#242d4a] border border-slate-600/50 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          ⏱️ Scheduled Tasks
        </h2>
        {loading && <span className="text-xs text-blue-400 animate-pulse">Updating...</span>}
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-xs">
        <span className="text-gray-400">{jobs.length} jobs configured</span>
        <span className="text-green-300">
          {jobs.filter(j => j.health === 'success').length} healthy
        </span>
        {jobs.filter(j => j.health === 'failed').length > 0 && (
          <span className="text-red-300">
            {jobs.filter(j => j.health === 'failed').length} failed
          </span>
        )}
      </div>

      {/* Job list */}
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {jobs.map(job => (
          <div
            key={job.id}
            className="bg-slate-800/40 border border-slate-600/30 rounded-lg px-3 py-2.5 hover:border-blue-500/30 transition"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <p className="text-sm font-medium text-white">{job.name}</p>
                <p className="text-xs text-gray-400">{job.scheduleLabel || job.schedule}</p>
              </div>
              <HealthBadge health={job.health} />
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Last: <span className="text-gray-300">{formatRelativeTime(job.lastRun)}</span></span>
              <span>Next: <span className="text-blue-300">{formatFutureTime(job.nextRun)}</span></span>
              {job.durationMs && (
                <span>Duration: <span className="text-gray-300">{formatDuration(job.durationMs)}</span></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
