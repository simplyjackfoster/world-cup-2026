import { useTournament } from '../context/TournamentContext';

export default function GroupControls() {
  const {
    rankStandingsByElo,
    rankStandingsByDraftKings,
    randomizeStandings,
    eloLoading,
    eloError,
    refreshEloRatings,
    eloAsOf,
    draftKingsLoading,
    draftKingsError,
    draftKingsAsOf,
    refreshDraftKingsOdds,
  } = useTournament();

  return (
    <div className="bg-pitch border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Group tools</p>
          <h3 className="text-lg font-semibold text-gold">Auto-rank your groups</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-2 rounded-md bg-accent text-white text-sm font-semibold disabled:opacity-60"
            onClick={rankStandingsByElo}
            disabled={eloLoading}
          >
            Rank by ELO
          </button>
          <button
            className="px-3 py-2 rounded-md bg-emerald-500 text-white text-sm font-semibold disabled:opacity-60"
            onClick={rankStandingsByDraftKings}
            disabled={draftKingsLoading}
          >
            Rank by DraftKings
          </button>
          <button
            className="px-3 py-2 rounded-md border border-border bg-night text-sm font-semibold hover:border-accent"
            onClick={randomizeStandings}
          >
            Randomize groups
          </button>
        </div>
      </div>
      <p className="text-xs text-muted">
        {eloLoading && 'Loading the December 5, 2025 ELO snapshot…'}
        {!eloLoading && eloError && (
          <>
            Couldn’t load the stored ELO snapshot.{' '}
            <button className="text-accent underline" onClick={refreshEloRatings}>
              Retry
            </button>
          </>
        )}
        {!eloLoading && !eloError &&
          'Use the buttons above to auto-fill standings. You can still drag teams to adjust after applying.'}
        {!eloLoading && eloAsOf && (
          <span className="block text-[11px] text-muted mt-1">ELO as of {eloAsOf}</span>
        )}
        {draftKingsLoading && <span className="block text-[11px] text-muted mt-1">Loading DraftKings outrights…</span>}
        {!draftKingsLoading && draftKingsError && (
          <span className="block text-[11px] text-amber-700 mt-1">
            DraftKings odds unavailable.{' '}
            <button className="underline" onClick={refreshDraftKingsOdds}>
              Retry
            </button>
          </span>
        )}
        {!draftKingsLoading && draftKingsAsOf && (
          <span className="block text-[11px] text-muted mt-1">DraftKings odds as of {draftKingsAsOf}</span>
        )}
      </p>
    </div>
  );
}
