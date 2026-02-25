import React, { useState, useEffect } from 'react';

export default function TopBar({ gatewayStatus, lastUpdated }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isOnline = gatewayStatus === 'online';

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-slate-800 border-b border-blue-600 px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🦞</div>
        <div>
          <h1 className="text-xl font-bold text-white">Mission Control</h1>
          <p className="text-xs text-blue-300">OpenClaw System Monitor</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            {currentTime.toLocaleTimeString('de-CH')}
          </p>
          <p className="text-xs text-blue-300">
            Bern (UTC+{new Date().getTimezoneOffset() === -60 ? '1' : '2'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <div>
            <p className="text-sm font-semibold text-white">Gateway</p>
            <p className={`text-xs ${isOnline ? 'text-green-300' : 'text-red-300'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="text-xs text-blue-300 border-l border-blue-500 pl-4">
          Updated: {lastUpdated?.toLocaleTimeString('de-CH') || 'Never'}
        </div>
      </div>
    </div>
  );
}
