import { teamMeta } from '../data/bracket';
import { useTournament } from '../context/TournamentContext';

const formatPrice = (price: number) => (price > 0 ? `+${price.toLocaleString()}` : price.toLocaleString());

const DraftKingsOddsPanel: React.FC<{ limit?: number | null }> = ({ limit = null }) => {
  const { draftKingsOdds, draftKingsLoading, draftKingsError, draftKingsAsOf, refreshDraftKingsOdds } = useTournament();

  const shortlist =
    typeof limit === 'number' && limit > 0 ? draftKingsOdds?.slice(0, limit) ?? [] : draftKingsOdds ?? [];

  return (
    <div className="bg-pitch border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">DraftKings outrights</p>
          <h3 className="text-lg font-semibold text-gold">Who the book has on top</h3>
          <p className="text-xs text-muted">
            Loaded after the page settles and cached until you refresh.
            {draftKingsAsOf && ` Snapshot updated ${new Date(draftKingsAsOf).toLocaleString()}.`}
          </p>
        </div>
        <div className="text-right text-xs text-muted">American odds</div>
      </div>

      {draftKingsLoading && <p className="mt-3 text-sm text-muted">Pulling DraftKings outrights…</p>}
      {!draftKingsLoading && draftKingsError && (
        <div className="mt-3 text-sm text-amber-700">
          Couldn’t load the market right now.
          <button className="ml-2 underline text-accent" onClick={refreshDraftKingsOdds}>
            Retry
          </button>
        </div>
      )}

      {!draftKingsLoading && !draftKingsError && shortlist.length > 0 && (
        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
          {shortlist.map((entry, index) => {
            const meta = teamMeta[entry.team];
            return (
              <div
                key={entry.team}
                className="flex items-center justify-between gap-3 rounded-lg bg-night px-3 py-2 border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted w-6 text-right">{index + 1}</span>
                  <span className="text-lg">{meta?.flag ?? '🏳️'}</span>
                  <div>
                    <p className="font-semibold leading-tight text-gold">{entry.team}</p>
                    <p className="text-xs text-muted">{meta?.confed ?? '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-accent">{formatPrice(entry.price)}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted">to win it all</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DraftKingsOddsPanel;

