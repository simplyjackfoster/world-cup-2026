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
  const [connections, setConnections] = useState<{ from: string; to: string; d: string }[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { matches, predictions: autoPred } = useMemo(
    () => buildMatchesWithTeams(mode, standings, predictions),
    [mode, standings, predictions],
  );

  const combinedPredictions = mode === 'results' ? autoPred : predictions;

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

          const midX = startX + (endX - startX) / 2;
          const rightAnglePath = `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;

          return { from: match.id, to: nextMatch.id, d: rightAnglePath };
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

  const matchesByStage = useMemo(
    () =>
      stageOrder.reduce<Record<Stage, typeof matches>>(
        (acc, stage) => ({ ...acc, [stage]: matches.filter((m) => m.stage === stage) }),
        { R32: [], R16: [], QF: [], SF: [], '3P': [], F: [] },
      ),
    [matches],
  );

  const splitStage = (stage: Stage) => {
    const stageMatches = matchesByStage[stage];
    const halfway = Math.ceil(stageMatches.length / 2);
    return { left: stageMatches.slice(0, halfway), right: stageMatches.slice(halfway) };
  };

  const knockoutStages: Stage[] = ['R32', 'R16', 'QF', 'SF'];

  const handleTeamClick = (matchId: string, team: Team | null) => {
    if (!team) return;
    if (mode === 'predictions') {
      setPrediction(matchId, team);
    }
    openTeamInfo(team);
  };

  const renderStageColumn = (stage: Stage, stageMatches: typeof matches) => (
    <div key={stage} className="flex-1 min-w-[220px] space-y-3">
      <p className="inline-block rounded-md border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-100">
        {stageLabel[stage]}
      </p>
      <div className="space-y-4">
        {stageMatches.map((match) => (
          <div
            key={match.id}
            ref={registerMatchRef(match.id)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2 text-[11px] uppercase text-slate-400">
              <p className="font-semibold">{match.id}</p>
              {winningTeam(match.id) && <span className="text-accent font-semibold">Advances →</span>}
            </div>
            {[match.homeTeam, match.awayTeam].map((team, i) => {
              const meta = team ? getTeamMeta(team) : null;
              const isWinner = winningTeam(match.id) === team;
              return (
                <Fragment key={team ?? i}>
                  <button
                    onClick={() => handleTeamClick(match.id, team ?? null)}
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
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Knockout view</p>
          <h2 className="text-2xl font-semibold">Interactive Bracket</h2>
        </div>
        <p className="text-xs text-slate-300">Click a team to advance and tap again for more info.</p>
      </div>
      <div className="overflow-x-auto pb-10">
        <div ref={canvasRef} className="relative inline-block">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            {connections.map((conn) => (
              <path
                key={`${conn.from}-${conn.to}`}
                d={conn.d}
                fill="none"
                stroke="#cbd5f5"
                strokeWidth={2}
                strokeLinejoin="miter"
                strokeLinecap="square"
              />
            ))}
          </svg>
          <div className="flex items-start gap-10 min-w-[1400px]">
            <div className="flex gap-6 items-start">
              {knockoutStages.map((stage) => renderStageColumn(stage, splitStage(stage).left))}
            </div>
            <div className="flex flex-col items-center gap-6 min-w-[240px] px-4">
              {renderStageColumn('F', matchesByStage.F)}
              {renderStageColumn('3P', matchesByStage['3P'])}
            </div>
            <div className="flex gap-6 items-start flex-row-reverse">
              {knockoutStages.map((stage) => renderStageColumn(stage, splitStage(stage).right))}
            </div>
          </div>
        </div>
      </div>
      {activeFixture && <MatchModal fixture={activeFixture} onClose={() => setSelectedTeam(null)} />}
    </div>
  );
}
