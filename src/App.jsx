import React from 'react';
import TopBar from './components/TopBar';
import SystemHealth from './components/SystemHealth';
import AgentStatus from './components/AgentStatus';
import CronJobs from './components/CronJobs';
import Usage from './components/Usage';
import TaskPipeline from './components/TaskPipeline';
import { useGatewayStatus } from './hooks/useGatewayStatus';

function App() {
  const { data, loading, error, lastUpdated } = useGatewayStatus();

  const gatewayStatus = error ? 'offline' : (data ? 'online' : 'unknown');

  return (
    <div className="min-h-screen bg-[#1a1f3a] text-gray-100 font-sans">
      {/* Sticky top bar */}
      <TopBar gatewayStatus={gatewayStatus} lastUpdated={lastUpdated} />

      {/* Main content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Offline banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-300 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span>⚠️ OpenClaw Gateway not available</span>
            </div>
            <div className="text-red-400/70 text-xs space-y-1">
              <p>Checking: http://localhost:18789/api/status</p>
              <p>Error: {error}</p>
              <p>Dashboard will auto-retry every 30 seconds. Make sure OpenClaw Gateway is running.</p>
            </div>
          </div>
        )}

        {/* System Health Row */}
        <section>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 px-0.5">System Health</p>
          <SystemHealth data={data} loading={loading} />
        </section>

        {/* Agent + Cron row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentStatus data={data} loading={loading} />
          <CronJobs data={data} loading={loading} />
        </div>

        {/* Usage + Task Pipeline row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Usage data={data} />
          <TaskPipeline />
        </div>

      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-600">
        Mission Control · OpenClaw · Polling every 30s
      </div>
    </div>
  );
}

export default App;
