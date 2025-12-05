import { TeamStanding } from '../data/groups';
import { getTeamMeta, useTournament } from '../context/TournamentContext';

interface Props {
  standings: TeamStanding[];
  compact?: boolean;
  allowFavorites?: boolean;
}

const headers = ['Team', 'MP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];

export default function GroupTable({ standings, compact, allowFavorites = true }: Props) {
  const { favorites, toggleFavorite } = useTournament();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400">
            {headers.map((h) => (
              <th key={h} className="py-2 px-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => {
            const meta = getTeamMeta(row.team);
            const isFavorite = favorites.includes(row.team);
            return (
              <tr key={row.team} className="border-t border-slate-800/80">
                <td className="py-2 px-2 flex items-center gap-2">
                  <span className="text-lg">{meta?.flag}</span>
                  <span className="font-semibold text-slate-100 flex-1">
                    {idx + 1}. {row.team}
                  </span>
                  {allowFavorites && (
                    <button
                      onClick={() => toggleFavorite(row.team)}
                      className={`text-sm ${isFavorite ? 'text-gold' : 'text-slate-500 hover:text-white'}`}
                      aria-label={isFavorite ? 'Unstar team' : 'Star team'}
                    >
                      {isFavorite ? '★' : '☆'}
                    </button>
                  )}
                </td>
                <td className="py-2 px-2 text-center">{row.mp}</td>
                <td className="py-2 px-2 text-center">{row.w}</td>
                <td className="py-2 px-2 text-center">{row.d}</td>
                <td className="py-2 px-2 text-center">{row.l}</td>
                <td className="py-2 px-2 text-center">{row.gf}</td>
                <td className="py-2 px-2 text-center">{row.ga}</td>
                <td className="py-2 px-2 text-center">{row.gf - row.ga}</td>
                <td className="py-2 px-2 text-center font-bold text-slate-50">{row.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {compact && <p className="text-xs text-slate-400 mt-2">Drag-to-rank could slot here later.</p>}
    </div>
  );
}
