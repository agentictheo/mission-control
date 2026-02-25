import React, { useState } from 'react';

const STATUSES = [
  { key: 'draft', label: '📝 Draft', color: 'text-gray-300', border: 'border-gray-500/40', bg: 'bg-gray-500/10' },
  { key: 'review', label: '🔍 Review', color: 'text-yellow-300', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10' },
  { key: 'approved', label: '✅ Approved', color: 'text-blue-300', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
  { key: 'published', label: '🚀 Published', color: 'text-green-300', border: 'border-green-500/40', bg: 'bg-green-500/10' },
];

const PRIORITY_COLORS = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-gray-400',
};

const INITIAL_TASKS = [
  { id: 1, name: 'Mission Control Dashboard', status: 'review', assignee: 'Elia', priority: 'high', due: '2026-03-01' },
  { id: 2, name: 'Tischtennis Tracker', status: 'published', assignee: 'Elia', priority: 'high', due: '2026-02-28' },
  { id: 3, name: 'Power Platform Spec', status: 'approved', assignee: 'Sara', priority: 'medium', due: '2026-03-05' },
  { id: 4, name: 'GitHub Pages Fix', status: 'review', assignee: 'Elia', priority: 'medium', due: '2026-02-27' },
  { id: 5, name: 'Supabase Schema Design', status: 'draft', assignee: 'Elia', priority: 'low', due: '2026-03-10' },
  { id: 6, name: 'Bot Integration Test', status: 'approved', assignee: 'Theo', priority: 'high', due: '2026-03-02' },
];

function TaskCard({ task }) {
  return (
    <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 hover:border-blue-500/30 transition">
      <p className="text-xs font-medium text-white leading-snug mb-1">{task.name}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{task.assignee}</span>
        <div className="flex items-center gap-2">
          <span className={PRIORITY_COLORS[task.priority] || 'text-gray-400'}>{task.priority}</span>
          <span>{task.due}</span>
        </div>
      </div>
    </div>
  );
}

export default function TaskPipeline() {
  const [tasks] = useState(INITIAL_TASKS);

  const byStatus = (key) => tasks.filter(t => t.status === key);

  return (
    <div className="bg-[#242d4a] border border-slate-600/50 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">🗂️ Task Pipeline</h2>
        <span className="text-xs text-gray-500">{tasks.length} tasks</span>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATUSES.map(s => {
          const statusTasks = byStatus(s.key);
          return (
            <div key={s.key} className="flex flex-col gap-2">
              <div className={`flex items-center justify-between px-2 py-1 rounded-lg border ${s.border} ${s.bg}`}>
                <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                <span className={`text-xs font-bold ${s.color}`}>{statusTasks.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {statusTasks.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-2">—</p>
                )}
                {statusTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
