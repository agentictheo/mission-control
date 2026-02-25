import React from 'react';

const healthCards = [
  { name: 'Gateway', icon: '🌐', key: 'gateway' },
  { name: 'Canvas', icon: '🎨', key: 'canvas' },
  { name: 'Agents', icon: '🤖', key: 'agents' },
  { name: 'Cron', icon: '⏱️', key: 'cron' },
  { name: 'Database', icon: '💾', key: 'database' },
];

function StatusBadge({ status }) {
  const colors = {
    ok: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };

  const statusMap = {
    'up': 'ok',
    'down': 'error',
    'online': 'ok',
    'offline': 'error',
    'warning': 'warning',
    'ok': 'ok',
    'error': 'error',
  };

  const colorKey = statusMap[status?.toLowerCase()] || 'unknown';
  const text = status || 'Unknown';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[colorKey]}`}>
      {text}
    </span>
  );
}

export default function SystemHealth({ data, loading }) {
  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading system health...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {healthCards.map((card) => {
        const value = data?.[card.key] || {};
        const status = value.status || 'unknown';

        return (
          <div key={card.key} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-blue-500/50 transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-2xl">{card.icon}</p>
                <h3 className="text-sm font-semibold text-white mt-2">{card.name}</h3>
              </div>
              <StatusBadge status={status} />
            </div>

            {value.uptime && (
              <p className="text-xs text-gray-400 mt-2">
                Uptime: {formatUptime(value.uptime)}
              </p>
            )}

            {value.message && (
              <p className="text-xs text-gray-300 mt-2">{value.message}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}
