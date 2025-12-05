import { useMemo } from 'react';
import { GROUPS, GroupId, TeamStanding } from '../data/groups';
import { useTournament } from '../context/TournamentContext';

interface Props {
  compact?: boolean;
}

export default function PredictionSidebar({ compact }: Props) {
  const { standings, updateStandings, setMode, mode } = useTournament();

  const reorder = (groupId: GroupId, index: number, direction: -1 | 1) => {
    const table = standings[groupId];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= table.length) return;
    const copy: TeamStanding[] = [...table];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    updateStandings(groupId, copy);
  };

  const summary = useMemo(
    () =>
      Object.entries(standings).map(([groupId, table]) => ({
        id: groupId,
        favorite: table[0].team,
      })),
    [standings],
  );

  return (
    <div className="bg-pitch border border-slate-800 rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bracket Challenge</p>
          <h3 className="text-xl font-semibold">Predictions</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setMode('results')}
            className={`px-3 py-1 rounded-full ${mode === 'results' ? 'bg-accent text-night' : 'bg-slate-800'}`}
          >
            Results mode
          </button>
          <button
            onClick={() => setMode('predictions')}
            className={`px-3 py-1 rounded-full ${mode === 'predictions' ? 'bg-gold text-night' : 'bg-slate-800'}`}
          >
            Prediction mode
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-300 mb-3">
        Reorder teams to set your group winners. The knockout bracket updates instantly. Points scoring placeholder lives here for
        the real tournament.
      </p>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {GROUPS.map((group) => (
          <div key={group.id} className="bg-night border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Group {group.id}</p>
              <span className="text-xs text-slate-500">Top to bottom = your ranking</span>
            </div>
            <div className="space-y-1">
              {standings[group.id].map((row, idx) => (
                <div
                  key={row.team}
                  className="flex items-center justify-between bg-slate-900/60 rounded-lg px-2 py-1 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{idx + 1}.</span>
                    <span>{row.team}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="px-2 py-1 bg-slate-800 rounded disabled:opacity-30"
                      onClick={() => reorder(group.id, idx, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="px-2 py-1 bg-slate-800 rounded disabled:opacity-30"
                      onClick={() => reorder(group.id, idx, 1)}
                      disabled={idx === standings[group.id].length - 1}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!compact && (
        <div className="mt-4 bg-slate-900/50 rounded-xl p-3 text-sm text-slate-300">
          <p className="font-semibold">Your current winners</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {summary.map((row) => (
              <span key={row.id} className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                {row.id}: {row.favorite}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
