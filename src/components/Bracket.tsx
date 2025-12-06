import { Fragment, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { buildMatchesWithTeams, getTeamMeta, useTournament } from '../context/TournamentContext';
import { BRACKET_SLOTS, Stage } from '../data/bracket';
import { Team } from '../data/groups';
import BracketMatchModal from './BracketMatchModal';
import DraftKingsOddsPanel from './DraftKingsOddsPanel';

const stageOrder: Stage[] = ['R32', 'R16', 'QF', 'SF', '3P', 'F'];

export const stageLabel: Record<Stage, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinals',
  SF: 'Semifinals',
  '3P': 'Third Place',
  F: 'Final',
};

export default function Bracket() {
  const {
    standings,
    predictions,
    setPrediction,
    pickBracketByElo,
    pickBracketByDraftKings,
    randomizeBracket,
    eloLoading,
    eloError,
    eloAsOf,
    draftKingsLoading,
    draftKingsError,
    draftKingsAsOf,
    refreshDraftKingsOdds,
  } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState<ReturnType<typeof buildMatchesWithTeams>['matches'][number] | null>(
    null,
  );
  const [connections, setConnections] = useState<{ from: string; to: string; d: string }[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { matches } = useMemo(() => buildMatchesWithTeams(standings, predictions), [standings, predictions]);

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

  const winningTeam = (matchId: string) => predictions[matchId];

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

  const handleTeamClick = (e: MouseEvent, matchId: string, team: Team | null) => {
    e.stopPropagation();
    if (!team) return;
    setPrediction(matchId, team);
  };

  const renderStageColumn = (stage: Stage, stageMatches: typeof matches) => (
    <div key={stage} className="flex-1 min-w-[190px] max-w-[240px] space-y-3 shrink">
      <p className="inline-block rounded-md border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-100">
        {stageLabel[stage]}
      </p>
      <div className="space-y-4">
        {stageMatches.map((match) => (
          <div
            key={match.id}
            ref={registerMatchRef(match.id)}
            onClick={() => setSelectedMatch(match)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-lg hover:border-accent/40 cursor-pointer transition"
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
                    onClick={(e) => handleTeamClick(e, match.id, team ?? null)}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Knockout view</p>
          <h2 className="text-2xl font-semibold">Interactive Bracket</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-accent text-night text-sm font-semibold disabled:opacity-60"
            onClick={pickBracketByElo}
            disabled={eloLoading}
          >
            Select by ELO
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-emerald-400 text-night text-sm font-semibold disabled:opacity-60"
            onClick={pickBracketByDraftKings}
            disabled={draftKingsLoading}
          >
            Select by DraftKings
          </button>
          <button
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold hover:border-slate-600"
            onClick={randomizeBracket}
          >
            Randomize bracket
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] items-start">
        <p className="text-xs text-slate-300">
          {eloLoading && 'Loading ELO snapshot for smart picks…'}
          {!eloLoading && eloError && `ELO snapshot unavailable right now: ${eloError}`}
          {!eloLoading && !eloError &&
            `Tap a team to advance, or auto-pick with ELO (as of ${eloAsOf ?? 'Dec 5, 2025'}) or a full random bracket above.`}
          {draftKingsLoading && ' DraftKings outrights are loading…'}
          {!draftKingsLoading && draftKingsError && (
            <>
              {' '}DraftKings outrights unavailable: {draftKingsError}{' '}
              <button className="underline text-accent" onClick={refreshDraftKingsOdds}>
                Retry
              </button>
            </>
          )}
          {!draftKingsLoading && draftKingsAsOf && ` DraftKings odds as of ${draftKingsAsOf}.`}
        </p>
        <DraftKingsOddsPanel limit={6} />
      </div>
      <div className="overflow-x-auto pb-10">
        <div ref={canvasRef} className="relative w-full">
          <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" aria-hidden>
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
          <div className="flex items-start justify-center gap-8 min-w-max px-2">
            <div className="flex gap-6 items-start flex-shrink-0">
              {knockoutStages.map((stage) => renderStageColumn(stage, splitStage(stage).left))}
            </div>
            <div className="flex flex-col items-center gap-6 min-w-[260px] px-4 flex-shrink-0">
              {renderStageColumn('F', matchesByStage.F)}
              {renderStageColumn('3P', matchesByStage['3P'])}
            </div>
            <div className="flex gap-6 items-start flex-row-reverse flex-shrink-0">
              {knockoutStages.map((stage) => renderStageColumn(stage, splitStage(stage).right))}
            </div>
          </div>
        </div>
      </div>
      {selectedMatch && (
        <BracketMatchModal
          match={selectedMatch}
          stageLabel={stageLabel[selectedMatch.stage]}
          winner={winningTeam(selectedMatch.id)}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
