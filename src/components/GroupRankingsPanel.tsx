import { useMemo, useState, type DragEvent } from 'react';
import { GROUPS, GroupId, TeamStanding } from '../data/groups';
import { getTeamMeta, useTournament } from '../context/TournamentContext';

interface DragState {
  group: GroupId;
  team: string;
}

export default function GroupRankingsPanel() {
  const { standings, updateStandings, mode, setMode } = useTournament();
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dragTarget, setDragTarget] = useState<{ group: GroupId; index: number } | null>(null);

  const reorder = (groupId: GroupId, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const table = standings[groupId];
    const updated: TeamStanding[] = [...table];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateStandings(groupId, updated);
  };

  const handleDragOver = (groupId: GroupId, index: number) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dragging || dragging.group !== groupId) return;
    setDragTarget({ group: groupId, index });
  };

  const handleDrop = (groupId: GroupId, index: number) => () => {
    if (!dragging || dragging.group !== groupId) return resetDrag();

    const fromIndex = standings[groupId].findIndex((row) => row.team === dragging.team);
    if (fromIndex === -1) return resetDrag();

    const targetIndex = fromIndex < index ? index - 1 : index;
    reorder(groupId, fromIndex, targetIndex);
    resetDrag();
  };

  const resetDrag = () => {
    setDragging(null);
    setDragTarget(null);
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Group rankings</p>
          <h3 className="text-xl font-semibold">Drag to set the order</h3>
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
        Drag and drop teams inside each group to define your standings. The bracket updates automatically as you reorder.
      </p>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {GROUPS.map((group) => (
          <div key={group.id} className="bg-night border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Group {group.id}</p>
              <span className="text-xs text-slate-500">Top to bottom = your ranking</span>
            </div>
            <div className="space-y-1">
              {standings[group.id].map((row, idx) => {
                const meta = getTeamMeta(row.team);
                const isDragging = dragging?.team === row.team;
                const isDropTarget = dragTarget?.group === group.id && dragTarget.index === idx;

                return (
                  <div key={row.team} className="space-y-1">
                    <div
                      draggable
                      onDragStart={() => setDragging({ group: group.id, team: row.team })}
                      onDragEnd={resetDrag}
                      onDragOver={handleDragOver(group.id, idx)}
                      onDrop={handleDrop(group.id, idx)}
                      className={`flex items-center justify-between rounded-lg px-2 py-2 text-sm border transition ${
                        isDragging
                          ? 'bg-slate-900/80 border-accent text-accent'
                          : isDropTarget
                            ? 'bg-slate-900 border-dashed border-accent/70'
                            : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="cursor-grab" aria-hidden>
                          ≡
                        </span>
                        <span className="text-lg">{meta?.flag}</span>
                        <span className="font-semibold">{row.team}</span>
                      </div>
                      <span className="text-xs text-slate-400">{idx + 1}</span>
                    </div>
                    {isDropTarget && (
                      <div className="h-1 rounded bg-accent/40 transition" aria-hidden />
                    )}
                  </div>
                );
              })}
              <div
                onDragOver={handleDragOver(group.id, standings[group.id].length)}
                onDrop={handleDrop(group.id, standings[group.id].length)}
                className={`h-2 rounded transition ${
                  dragTarget?.group === group.id && dragTarget.index === standings[group.id].length
                    ? 'bg-accent/40'
                    : 'bg-transparent'
                }`}
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
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
    </div>
  );
}
