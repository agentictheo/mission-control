import React from 'react';

const MODELS = [
  { key: 'haiku', name: 'Haiku', color: 'text-green-300', bar: 'bg-green-500', budget: 2_000_000 },
  { key: 'sonnet', name: 'Sonnet', color: 'text-blue-300', bar: 'bg-blue-500', budget: 500_000 },
  { key: 'opus', name: 'Opus', color: 'text-purple-300', bar: 'bg-purple-500', budget: 100_000 },
];

const BOTS = [
  { id: 'theo', name: 'Theo', emoji: '🤖', haiku: 12400, sonnet: 3200, opus: 0 },
  { id: 'tina', name: 'Tina', emoji: '⚡', haiku: 8700, sonnet: 5100, opus: 600 },
  { id: 'elia', name: 'Elia', emoji: '👨‍💻', haiku: 6300, sonnet: 18400, opus: 0 },
  { id: 'sara', name: 'Sara', emoji: '📋', haiku: 4100, sonnet: 2900, opus: 0 },
];

function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function ProgressBar({ used, total, colorClass }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const dangerColor = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : colorClass;
  return (
    <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full ${dangerColor} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function Usage() {
  // Use mock data — real token data would need a log parser or stats API
  const bots = BOTS;
  const totals = {
    haiku: bots.reduce((s, b) => s + b.haiku, 0),
    sonnet: bots.reduce((s, b) => s + b.sonnet, 0),
    opus: bots.reduce((s, b) => s + b.opus, 0),
  };

  return (
    <div className="bg-[#242d4a] border border-slate-600/50 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">📊 Model Usage Today</h2>
        <span className="text-xs text-gray-500">Estimated</span>
      </div>

      {/* Global model bars */}
      <div className="flex flex-col gap-3">
        {MODELS.map(m => (
          <div key={m.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className={m.color}>{m.name}</span>
              <span className="text-gray-400">
                {formatTokens(totals[m.key])} / {formatTokens(m.budget)}
              </span>
            </div>
            <ProgressBar used={totals[m.key]} total={m.budget} colorClass={m.bar} />
          </div>
        ))}
      </div>

      <div className="border-t border-slate-600/30 pt-3">
        <p className="text-xs text-gray-500 mb-2">Per bot (all models)</p>
        <div className="flex flex-col gap-2">
          {bots.map(bot => {
            const total = bot.haiku + bot.sonnet + bot.opus;
            const dominant = bot.sonnet > bot.haiku ? 'Sonnet' : 'Haiku';
            return (
              <div key={bot.id} className="flex items-center gap-3 bg-slate-800/40 rounded-lg px-3 py-2">
                <span className="text-base">{bot.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white">{bot.name}</span>
                    <span className="text-gray-400">{formatTokens(total)} tokens</span>
                  </div>
                  <ProgressBar used={total} total={200_000} colorClass="bg-cyan-500" />
                </div>
                <span className="text-xs text-gray-500 min-w-[40px] text-right">{dominant}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
