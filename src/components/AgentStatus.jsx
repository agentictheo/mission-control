import React from 'react';

const KNOWN_AGENTS = [
  { id: 'main', name: 'Theo', emoji: '🤖', role: 'Orchestrator' },
  { id: 'powerplatformexpert', name: 'Tina', emoji: '⚡', role: 'Power Platform' },
  { id: 'developer', name: 'Elia', emoji: '👨‍💻', role: 'Developer' },
  { id: 'requirementsengineer', name: 'Sara', emoji: '📋', role: 'Requirements' },
  { id: 'teacher', name: 'Hans-Ruedi', emoji: '👨‍🏫', role: 'Teacher' },
];

function StatusBadge({ status }) {
  const map = {
    active: { cls: 'bg-green-500/20 text-green-300 border-green-500/40', label: 'Active' },
    idle: { cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', label: 'Idle' },
    error: { cls: 'bg-red-500/20 text-red-300 border-red-500/40', label: 'Error' },
    unknown: { cls: 'bg-gray-500/20 text-gray-400 border-gray-500/40', label: 'Unknown' },
  };
  const s = map[status] || map.unknown;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function StatusDot({ status }) {
  const map = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    error: 'bg-red-500',
    unknown: 'bg-gray-500',
  };
  return (
    <div className={`w-2 h-2 rounded-full ${map[status] || map.unknown} ${status === 'active' ? 'animate-pulse' : ''}`} />
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
  return `${hrs}h ago`;
}

export default function AgentStatus({ data, loading }) {
  // Merge gateway agent data with known agents
  const gatewayAgents = data?.agents || [];
  const agentMap = Object.fromEntries(gatewayAgents.map(a => [a.id, a]));

  const agents = KNOWN_AGENTS.map(known => {
    const live = agentMap[known.id] || {};
    return {
      ...known,
      status: live.status || 'idle',
      lastActive: live.lastActive || null,
      sessions: live.sessions || 0,
    };
  });

  const counts = {
    active: agents.filter(a => a.status === 'active').length,
    idle: agents.filter(a => a.status === 'idle').length,
    error: agents.filter(a => a.status === 'error').length,
  };

  return (
    <div className="bg-[#242d4a] border border-slate-600/50 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          🤖 Agent Status
        </h2>
        {loading && <span className="text-xs text-blue-400 animate-pulse">Updating...</span>}
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-green-300">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{counts.active} Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-300">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>{counts.idle} Idle</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-300">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>{counts.error} Error</span>
        </div>
      </div>

      {/* Agent list */}
      <div className="flex flex-col gap-2">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="flex items-center justify-between bg-slate-800/40 border border-slate-600/30 rounded-lg px-3 py-2 hover:border-blue-500/30 transition"
          >
            <div className="flex items-center gap-2.5">
              <StatusDot status={agent.status} />
              <span className="text-base">{agent.emoji}</span>
              <div>
                <p className="text-sm font-medium text-white">{agent.name}</p>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {agent.sessions > 0 && (
                <span className="text-xs text-blue-300">{agent.sessions} sessions</span>
              )}
              <div className="text-right">
                <StatusBadge status={agent.status} />
                <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(agent.lastActive)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
