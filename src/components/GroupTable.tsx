import { TeamStanding } from '../data/groups';
import { getTeamMeta, useTournament } from '../context/TournamentContext';

interface Props {
  standings: TeamStanding[];
  compact?: boolean;
  allowFavorites?: boolean;
}

export default function GroupTable({ standings, compact, allowFavorites = true }: Props) {
  const { favorites, toggleFavorite } = useTournament();

  return (
    <div className="space-y-2">
      {standings.map((row, idx) => {
        const meta = getTeamMeta(row.team);
        const isFavorite = favorites.includes(row.team);

        return (
          <div
            key={row.team}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-200">
                {idx + 1}
              </span>
              <span className="text-lg">{meta?.flag}</span>
              <span className="font-semibold text-slate-100">{row.team}</span>
            </div>
            {allowFavorites && (
              <button
                onClick={() => toggleFavorite(row.team)}
                className={`text-sm ${isFavorite ? 'text-gold' : 'text-slate-500 hover:text-white'}`}
                aria-label={isFavorite ? 'Unstar team' : 'Star team'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            )}
          </div>
        );
      })}
      {compact && <p className="text-xs text-slate-400">Tap for fixtures to see more details.</p>}
    </div>
  );
}
