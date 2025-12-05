import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { buildMatchesWithTeams, getTeamMeta, useTournament } from '../context/TournamentContext';
import { BRACKET_SLOTS, Stage } from '../data/bracket';
import { Team } from '../data/groups';
import MatchModal from './MatchModal';
import { fixtures } from '../data/groups';

const stageOrder: Stage[] = ['R32', 'R16', 'QF', 'SF', '3P', 'F'];

const stageLabel: Record<Stage, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinals',
  SF: 'Semifinals',
  '3P': 'Third Place',
  F: 'Final',
};

export default function Bracket() {
  const { standings, predictions, setPrediction, mode } = useTournament();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [scale, setScale] = useState(1);
  const [connections, setConnections] = useState<{ from: string; to: string; d: string }[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { matches, predictions: autoPred } = useMemo(
    () => buildMatchesWithTeams(mode, standings, predictions),
    [mode, standings, predictions],
  );

  const combinedPredictions = mode === 'results' ? autoPred : predictions;

  const grouped = stageOrder.map((stage) => matches.filter((m) => m.stage === stage));

  const findNextMatch = (matchId: string) =>
    BRACKET_SLOTS.find((slot) => slot.home.source === `Winner ${matchId}` || slot.away.source === `Winner ${matchId}`);

  const registerMatchRef = (matchId: string) => (el: HTMLDivElement | null) => {
    matchRefs.current[matchId] = el;
  };

  useEffect(() => {
    const updateConnections = () => {
      if (!canvasRef.current) return;
      const containerRect = canvasRef.current.getBoundingClientRect();

      const updated = matches
        .map((match) => {
          const nextMatch = findNextMatch(match.id);
          if (!nextMatch) return null;

          const fromEl = matchRefs.current[match.id];
          const toEl = matchRefs.current[nextMatch.id];
          if (!fromEl || !toEl) return null;

          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          const startX = fromRect.right - containerRect.left;
          const startY = fromRect.top - containerRect.top + fromRect.height / 2;
          const endX = toRect.left - containerRect.left;
          const endY = toRect.top - containerRect.top + toRect.height / 2;

          const midX = (startX + endX) / 2;
          const curve = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

          return { from: match.id, to: nextMatch.id, d: curve };
        })
        .filter(Boolean) as { from: string; to: string; d: string }[];

      setConnections(updated);
    };

    updateConnections();

    const resizeObserver = new ResizeObserver(() => updateConnections());
    const current = canvasRef.current;
    if (current) resizeObserver.observe(current);

    window.addEventListener('resize', updateConnections);
    return () => {
      window.removeEventListener('resize', updateConnections);
      resizeObserver.disconnect();
    };
  }, [matches]);

  const openTeamInfo = (team: Team | null) => {
    if (!team) return;
    setSelectedTeam(team);
  };

  const winningTeam = (matchId: string) => combinedPredictions[matchId];

  const activeFixture = selectedTeam ? fixtures.find((f) => f.home === selectedTeam || f.away === selectedTeam) : null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Knockout view</p>
          <h2 className="text-2xl font-semibold">Interactive Bracket</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">Zoom</span>
            <input
              type="range"
              min={0.75}
              max={1.4}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="h-1.5 w-32 accent-accent"
            />
            <span className="tabular-nums w-10 text-right">{Math.round(scale * 100)}%</span>
          </div>
          <p className="text-xs text-slate-400">Click a team to advance them through the bracket.</p>
        </div>
      </div>
      <div className="overflow-x-auto pb-6">
        <div
          ref={canvasRef}
          className="relative inline-block"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            <defs>
              <linearGradient id="bracketLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {connections.map((conn) => (
              <path
                key={`${conn.from}-${conn.to}`}
                d={conn.d}
                fill="none"
                stroke="url(#bracketLine)"
                strokeWidth={3}
                className="drop-shadow-[0_2px_6px_rgba(56,189,248,0.25)]"
              />
            ))}
          </svg>
          <div className="min-w-[1200px] flex gap-6 relative">
            {grouped.map((column, idx) => (
              <div key={stageOrder[idx]} className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold mb-3 sticky top-14 bg-night/90 backdrop-blur inline-block px-3 py-1 rounded-full">
                  {stageLabel[stageOrder[idx]]}
                </p>
                <div className="space-y-4">
                  {column.map((match) => (
                    <div
                      key={match.id}
                      ref={registerMatchRef(match.id)}
                      className="bg-pitch/80 border border-slate-800 rounded-xl p-3 shadow-card hover:border-accent/40 transition"
                    >
                      <div className="flex items-center justify-between mb-2 text-xs uppercase text-slate-400">
                        <p>{match.id}</p>
                        {winningTeam(match.id) && <span className="text-accent font-semibold">Advances →</span>}
                      </div>
                      {[match.homeTeam, match.awayTeam].map((team, i) => {
                        const meta = team ? getTeamMeta(team) : null;
                        const isWinner = winningTeam(match.id) === team;
                        return (
                          <Fragment key={team ?? i}>
                            <button
                              onClick={() => team && mode === 'predictions' && setPrediction(match.id, team)}
                              onMouseEnter={() => openTeamInfo(team ?? null)}
                              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                                isWinner
                                  ? 'bg-accent/20 border border-accent text-accent shadow-[0_0_0_1px_rgba(56,189,248,0.35)]'
                                  : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{meta?.flag}</span>
                                <span className="font-semibold text-sm">{team ?? 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>{meta?.confed ?? '—'}</span>
                                {mode === 'predictions' && team && <span className="text-[10px] uppercase tracking-wide">Tap to pick</span>}
                              </div>
                            </button>
                            {i === 0 && <div className="h-2" />}
                          </Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {activeFixture && <MatchModal fixture={activeFixture} onClose={() => setSelectedTeam(null)} />}
    </div>
  );
}
