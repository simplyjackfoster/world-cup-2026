import { useMemo } from 'react';
import { findTeamFixtures, getTeamMeta, useTournament } from '../context/TournamentContext';
import { GroupId, Team } from '../data/groups';

export default function MyTeams() {
  const { favorites, toggleFavorite, standings } = useTournament();

  const cards = useMemo(() => {
    return favorites.map((team) => {
      const meta = getTeamMeta(team);
      const matches = findTeamFixtures(team).slice(0, 2);
      const groupEntry = Object.entries(standings).find(([_, table]) => table.some((row) => row.team === team));
      const position = groupEntry
        ? (groupEntry[1].findIndex((row) => row.team === team) ?? 0) + 1
        : null;
      const groupId = groupEntry ? (groupEntry[0] as GroupId) : null;
      return { team, meta, matches, position, groupId };
    });
  }, [favorites, standings]);

  const renderEmpty = favorites.length === 0;

  return (
    <div className="bg-pitch border border-slate-800 rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Personalize</p>
          <h3 className="text-xl font-semibold">My Teams</h3>
        </div>
        <p className="text-xs text-slate-400">Star up to 3 squads</p>
      </div>
      {renderEmpty ? (
        <p className="text-slate-400 text-sm">Tap stars on teams to see their fixtures here.</p>
      ) : (
        <div className="space-y-3">
          {cards.map(({ team, meta, matches, position, groupId }) => (
            <div key={team} className="bg-night border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta?.flag}</span>
                  <div>
                    <p className="font-semibold">{team}</p>
                    <p className="text-xs text-slate-400">Group {groupId ?? 'TBD'} · Position {position ?? '-'} </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(team as Team)}
                  className="text-gold hover:text-white text-lg"
                  aria-label="Unstar"
                >
                  ★
                </button>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {matches.map((match) => (
                  <p key={match.id} className="text-slate-300">
                    {match.home} vs {match.away} · {new Date(match.date).toLocaleDateString()} ({match.city})
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
