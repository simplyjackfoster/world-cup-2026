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
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinals',
  SF: 'Semifinals',
  '3P': 'Third Place',
  F: 'Final',
};

const knockoutStages: Stage[] = ['R32', 'R16', 'QF', 'SF'];

const columnWidthClasses: Record<Stage, string> = {
  R32: 'min-w-[210px] max-w-[230px]',
  R16: 'min-w-[200px] max-w-[220px]',
  QF: 'min-w-[190px] max-w-[210px]',
  SF: 'min-w-[190px] max-w-[210px]',
  '3P': 'min-w-[230px] max-w-[250px]',
  F: 'min-w-[240px] max-w-[260px]',
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
  <div className={`flex-1 space-y-3 shrink ${widthClass}`} aria-label={`${stageLabel[stage]} column`}>
    <p className="inline-flex rounded-md border border-border bg-night px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
      {stageLabel[stage]}
    </p>
    <div className="space-y-4">{matches.map((m) => renderMatch(m.id))}</div>
  </div>
);

const ProgressHeader = ({
  completion,
  waiting,
}: {
  completion: number;
  waiting: number;
}) => (
  <div className="rounded-xl border border-border bg-pitch p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Step 2 · Knockouts</p>
        <h2 className="text-2xl font-semibold text-gold">Advance teams through the bracket</h2>
        <p className="mt-1 text-sm text-muted">
          Start with group winners, then tap a team to advance. Your picks automatically flow forward so you always know who is in
          the next round.
        </p>
      </div>
      <div className="w-full max-w-[280px]" aria-label="Bracket completion">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Progress</span>
          <span>{completion}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-night">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completion}%` }} />
        </div>
        {waiting > 0 && (
          <p className="mt-2 text-[11px] text-muted">
            {waiting} match{waiting > 1 ? 'es' : ''} are waiting for group results.
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
  const [connections, setConnections] = useState<{ from: string; to: string; d: string }[]>([]);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-pitch px-4 py-3">
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em] text-muted">
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-night px-3 py-1">Step 1: Finish group tables</span>
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-night px-3 py-1">Step 2: Advance knockouts</span>
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-night px-3 py-1">Step 3: Share picks</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span>Selections auto-save as you go.</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Knockout view</p>
          <h3 className="text-xl font-semibold text-gold">Interactive Bracket</h3>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Bracket actions">
          <button
            className="px-3 py-2 rounded-md bg-accent text-white text-sm font-semibold disabled:opacity-60"
            onClick={pickBracketByElo}
            disabled={eloLoading}
          >
            Select by ELO
          </button>
          <button
            className="px-3 py-2 rounded-md bg-emerald-500 text-white text-sm font-semibold disabled:opacity-60"
            onClick={pickBracketByDraftKings}
            disabled={draftKingsLoading}
          >
            Select by DraftKings
          </button>
          <button
            className="px-3 py-2 rounded-md border border-border bg-night text-sm font-semibold hover:border-accent"
            onClick={randomizeBracket}
          >
            Randomize bracket
          </button>
          <button
            className="px-3 py-2 rounded-md border border-border bg-pitch text-sm font-semibold hover:border-accent"
            onClick={undoLastPrediction}
            disabled={!canUndoPrediction}
          >
            Undo
          </button>
          <button
            className="px-3 py-2 rounded-md border border-red-500/40 bg-white text-sm font-semibold text-red-700 hover:border-red-500"
            onClick={resetPredictions}
          >
            Clear picks
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] items-start">
        <div className="space-y-4 text-sm text-muted">
          <div className="space-y-3">
            <p>
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
            <div className="flex flex-wrap gap-2 text-[12px] text-muted">
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-night px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                Selected winner
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-night px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-muted" aria-hidden />
                Waiting for group finish
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-night px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
                Hover or focus to inspect, click for details
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-10" aria-label="Knockout bracket">
            <div ref={canvasRef} className="relative w-full">
              <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" aria-hidden>
                {connections.map((conn) => (
                  <path
                    key={`${conn.from}-${conn.to}`}
                    d={conn.d}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    strokeLinejoin="miter"
                    strokeLinecap="square"
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
                  <div className="w-full rounded-xl border border-border bg-night p-4 text-sm text-muted">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Final four</p>
                    <div className="mt-3 space-y-2">
                      {matchesByStage.SF.map((match) => {
                        const champion = winningTeam('F-104');
                        return (
                          <div key={match.id} className="flex items-center justify-between rounded-lg bg-pitch px-3 py-2 border border-border">
                            <span className="text-[13px] font-semibold text-gold">{match.id}</span>
                            <span className="text-sm text-accent">
                              {champion && winningTeam(match.id) === champion ? 'Champions path' : 'Semifinal'}
                            </span>
                          </div>
                        );
                      })}
                      <div className="rounded-lg border border-border bg-pitch px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Champion</p>
                        <div className="mt-2">
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
