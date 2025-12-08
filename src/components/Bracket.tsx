import { useEffect, useMemo, useRef, useState } from 'react';
import { buildMatchesWithTeams, useTournament } from '../context/TournamentContext';
import { BRACKET_SLOTS, Stage } from '../data/bracket';
import { Team } from '../data/groups';
import BracketMatchModal from './BracketMatchModal';
import DraftKingsOddsPanel from './DraftKingsOddsPanel';
import MatchCard from './MatchCard';
import TeamChip from './TeamChip';

const stageOrder: Stage[] = ['R32', 'R16', 'QF', 'SF', '3P', 'F'];

export const stageLabel: Record<Stage, string> = {
  R32: 'R32',
  R16: 'R16',
  QF: 'QF',
  SF: 'SF',
  '3P': '3rd',
  F: 'Final',
};

const knockoutStages: Stage[] = ['R32', 'R16', 'QF', 'SF'];

const columnWidthClasses: Record<Stage, string> = {
  R32: 'min-w-[188px] max-w-[204px]',
  R16: 'min-w-[182px] max-w-[198px]',
  QF: 'min-w-[176px] max-w-[190px]',
  SF: 'min-w-[176px] max-w-[190px]',
  '3P': 'min-w-[210px] max-w-[226px]',
  F: 'min-w-[220px] max-w-[236px]',
};

type MatchShape = ReturnType<typeof buildMatchesWithTeams>['matches'][number];

type ColumnMatch = {
  id: string;
};

const RoundColumn = ({
  stage,
  matches,
  renderMatch,
  widthClass = '',
}: {
  stage: Stage;
  matches: ColumnMatch[];
  renderMatch: (matchId: string) => JSX.Element;
  widthClass?: string;
}) => (
  <div className={`flex-1 space-y-2 shrink ${widthClass}`} aria-label={`${stageLabel[stage]} column`}>
    <p className="inline-flex items-center gap-2 rounded-md border border-border bg-pitch px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
      <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
      {stageLabel[stage]}
    </p>
    <div className="space-y-2.5">{matches.map((m) => renderMatch(m.id))}</div>
  </div>
);

const ProgressHeader = ({
  completion,
  waiting,
}: {
  completion: number;
  waiting: number;
}) => (
  <div className="rounded-lg border border-border bg-surface p-3">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-textSecondary">Knockouts</p>
        <h2 className="text-xl font-semibold text-textPrimary">Select winners inline</h2>
      </div>
      <div className="w-full max-w-[260px]" aria-label="Bracket completion">
        <div className="flex items-center justify-between text-[12px] text-textSecondary">
          <span>Completion</span>
          <span>{completion}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-surfaceHover">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completion}%` }} />
        </div>
        {waiting > 0 && (
          <p className="mt-1 text-[11px] text-textSecondary">
            {waiting} waiting on group finish
          </p>
        )}
      </div>
    </div>
  </div>
);

export default function Bracket() {
  const {
    standings,
    predictions,
    setPrediction,
    resetPredictions,
    undoLastPrediction,
    canUndoPrediction,
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
  const [selectedMatch, setSelectedMatch] = useState<MatchShape | null>(null);
  const [connections, setConnections] = useState<{ from: string; to: string; d: string; active: boolean }[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { matches } = useMemo(() => buildMatchesWithTeams(standings, predictions), [standings, predictions]);

  const readyMatches = matches.filter((match) => match.homeTeam && match.awayTeam);
  const completed = readyMatches.filter((match) => predictions[match.id]).length;
  const completionPercent = readyMatches.length ? Math.round((completed / readyMatches.length) * 100) : 0;
  const waitingMatches = matches.length - readyMatches.length;

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

          const hasWinner = !!predictions[match.id];
          return { from: match.id, to: nextMatch.id, d: rightAnglePath, active: hasWinner };
        })
        .filter(Boolean) as { from: string; to: string; d: string; active: boolean }[];

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
      stageOrder.reduce<Record<Stage, typeof matches>>( // groups matches so round labels are reusable
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

  const handleTeamClick = (matchId: string, team: Team) => {
    setPrediction(matchId, team);
  };

  const renderMatchCard = (match: MatchShape) => (
    <MatchCard
      key={match.id}
      match={match}
      ref={registerMatchRef(match.id)}
      winner={winningTeam(match.id)}
      onSelectTeam={handleTeamClick}
      onOpenDetails={() => setSelectedMatch(match)}
    />
  );

  return (
    <div className="mt-6 space-y-6">
      <ProgressHeader completion={completionPercent} waiting={waitingMatches} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-surface px-3 py-2.5">
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-textSecondary">
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surfaceHover px-2.5 py-1">Groups synced</span>
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surfaceHover px-2.5 py-1">Knockouts live</span>
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surfaceHover px-2.5 py-1">Share-ready</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-textSecondary">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span>Auto-saves on every pick</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-textPrimary">
          <p className="text-[11px] uppercase tracking-[0.18em] text-textSecondary">Bracket Controls</p>
          <h3 className="text-lg font-semibold">Condensed knockout grid</h3>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Bracket actions">
          <button
            className="px-3 py-1.5 rounded-md bg-accent text-white text-[13px] font-semibold disabled:opacity-60"
            onClick={pickBracketByElo}
            disabled={eloLoading}
          >
            ELO auto-pick
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-accent/10 text-textPrimary text-[13px] font-semibold border border-accent disabled:opacity-60"
            onClick={pickBracketByDraftKings}
            disabled={draftKingsLoading}
          >
            Odds auto-pick
          </button>
          <button
            className="px-3 py-1.5 rounded-md border border-border bg-surface text-[13px] font-semibold hover:border-accent"
            onClick={randomizeBracket}
          >
            Randomize
          </button>
          <button
            className="px-3 py-1.5 rounded-md border border-border bg-surface text-[13px] font-semibold hover:border-accent disabled:opacity-50"
            onClick={undoLastPrediction}
            disabled={!canUndoPrediction}
          >
            Undo
          </button>
          <button
            className="px-3 py-1.5 rounded-md border border-red-500/40 bg-surface text-[13px] font-semibold text-red-700 hover:border-red-500"
            onClick={resetPredictions}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] items-start">
        <div className="space-y-3 text-sm text-textSecondary">
          <div className="flex flex-wrap gap-2 text-[12px]">
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              Winner path live
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
              Awaiting opponent
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
              {eloLoading ? 'Syncing ELO…' : eloError ? `ELO paused (${eloError})` : `ELO ${eloAsOf ?? 'latest'}`}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
              {draftKingsLoading
                ? 'Odds syncing…'
                : draftKingsError
                  ? `Odds paused (${draftKingsError})`
                  : `Odds ${draftKingsAsOf ?? 'latest'}`}
              {!draftKingsLoading && draftKingsError && (
                <button className="text-accent underline" onClick={refreshDraftKingsOdds}>
                  Retry
                </button>
              )}
            </span>
          </div>

          <div className="overflow-x-auto pb-8" aria-label="Knockout bracket">
            <div ref={canvasRef} className="relative w-full">
              <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" aria-hidden>
                {connections.map((conn) => (
                  <path
                    key={`${conn.from}-${conn.to}`}
                    d={conn.d}
                    fill="none"
                    stroke={conn.active ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={conn.active ? 3 : 2}
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                    className={conn.active ? 'transition-all duration-200' : ''}
                  />
                ))}
              </svg>
              <div className="flex items-start justify-center gap-8 min-w-max px-2">
                <div className="flex gap-6 items-start flex-shrink-0">
                  {knockoutStages.map((stage) => (
                    <RoundColumn
                      key={`left-${stage}`}
                      stage={stage}
                      matches={splitStage(stage).left}
                      widthClass={columnWidthClasses[stage]}
                      renderMatch={(id) => renderMatchCard(matches.find((m) => m.id === id)!)}
                    />
                  ))}
                </div>
                <div className="flex flex-col items-center gap-6 min-w-[280px] px-4 flex-shrink-0">
                  <RoundColumn
                    stage="F"
                    matches={matchesByStage.F}
                    widthClass={columnWidthClasses.F}
                    renderMatch={(id) => renderMatchCard(matches.find((m) => m.id === id)!)}
                  />
                  <RoundColumn
                    stage="3P"
                    matches={matchesByStage['3P']}
                    widthClass={columnWidthClasses['3P']}
                    renderMatch={(id) => renderMatchCard(matches.find((m) => m.id === id)!)}
                  />
                  <div className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm text-textSecondary">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-textSecondary">Final four</p>
                    <div className="mt-2 space-y-1.5">
                      {matchesByStage.SF.map((match) => {
                        const champion = winningTeam('F-104');
                        return (
                          <div
                            key={match.id}
                            className="flex items-center justify-between rounded-md border border-border bg-surfaceHover px-3 py-2"
                          >
                            <span className="text-[12px] font-semibold text-textPrimary">{match.id}</span>
                            <span className="text-[12px] text-accent">
                              {champion && winningTeam(match.id) === champion ? 'Champion path' : 'Semifinal'}
                            </span>
                          </div>
                        );
                      })}
                      <div className="rounded-md border border-border bg-surfaceHover px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-textSecondary">Champion</p>
                        <div className="mt-1.5">
                          <TeamChip
                            team={winningTeam('F-104') ?? null}
                            source="Winner of Final"
                            selected={!!winningTeam('F-104')}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 items-start flex-row-reverse flex-shrink-0">
                  {knockoutStages.map((stage) => (
                    <RoundColumn
                      key={`right-${stage}`}
                      stage={stage}
                      matches={splitStage(stage).right}
                      widthClass={columnWidthClasses[stage]}
                      renderMatch={(id) => renderMatchCard(matches.find((m) => m.id === id)!)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DraftKingsOddsPanel limit={6} />
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
