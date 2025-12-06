import { useTournament } from '../context/TournamentContext';

export default function GroupControls() {
  const { rankStandingsByElo, randomizeStandings, eloLoading, eloError, refreshEloRatings } = useTournament();

  return (
    <div className="bg-pitch border border-slate-800 rounded-2xl p-4 shadow-card flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Group tools</p>
          <h3 className="text-lg font-semibold">Auto-rank your groups</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-accent text-night text-sm font-semibold disabled:opacity-60"
            onClick={rankStandingsByElo}
            disabled={eloLoading}
          >
            Rank by ELO
          </button>
          <button
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold hover:border-slate-600"
            onClick={randomizeStandings}
          >
            Randomize groups
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        {eloLoading && 'Loading the latest FiveThirtyEight ELO ratings…'}
        {!eloLoading && eloError && (
          <>
            Couldn’t reach the ELO feed.{' '}
            <button className="text-accent underline" onClick={refreshEloRatings}>
              Retry
            </button>
          </>
        )}
        {!eloLoading && !eloError &&
          'Use the buttons above to auto-fill standings. You can still drag teams to adjust after applying.'}
      </p>
    </div>
  );
}
