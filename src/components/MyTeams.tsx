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
    <div className="bg-pitch border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Personalize</p>
          <h3 className="text-xl font-semibold text-gold">My Teams</h3>
        </div>
        <p className="text-xs text-muted">Star up to 3 squads</p>
      </div>
      {renderEmpty ? (
        <p className="text-muted text-sm">Tap stars on teams to see their fixtures here.</p>
      ) : (
        <div className="space-y-3">
          {cards.map(({ team, meta, matches, position, groupId }) => (
            <div key={team} className="bg-night border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta?.flag}</span>
                  <div>
                    <p className="font-semibold text-gold">{team}</p>
                    <p className="text-xs text-muted">Group {groupId ?? 'TBD'} · Position {position ?? '-'} </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(team as Team)}
                  className="text-accent hover:text-gold text-lg"
                  aria-label="Unstar"
                >
                  ★
                </button>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {matches.map((match) => (
                  <p key={match.id} className="text-muted">
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
