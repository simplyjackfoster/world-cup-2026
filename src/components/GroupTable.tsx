import { DragEvent, useState } from 'react';
import { GroupId, TeamStanding } from '../data/groups';
import { getTeamMeta, useTournament } from '../context/TournamentContext';

interface Props {
  standings: TeamStanding[];
  compact?: boolean;
  allowFavorites?: boolean;
  groupId?: GroupId;
  enableDrag?: boolean;
}

export default function GroupTable({
  standings,
  compact,
  allowFavorites = true,
  groupId,
  enableDrag,
}: Props) {
  const { favorites, toggleFavorite, updateStandings } = useTournament();
  const [draggingTeam, setDraggingTeam] = useState<string | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);

  const canDrag = Boolean(enableDrag && groupId);

  const reorder = (fromIndex: number, toIndex: number) => {
    if (!groupId || fromIndex === toIndex) return;
    const updated = [...standings];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateStandings(groupId, updated);
  };

  const resetDrag = () => {
    setDraggingTeam(null);
    setDragTargetIndex(null);
  };

  const handleDrop = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    if (!canDrag || !draggingTeam) return;
    event.preventDefault();
    const fromIndex = standings.findIndex((row) => row.team === draggingTeam);
    if (fromIndex === -1) return resetDrag();

    const targetIndex = fromIndex < index ? index - 1 : index;
    reorder(fromIndex, targetIndex);
    resetDrag();
  };

  return (
    <div className="space-y-2">
      {standings.map((row, idx) => {
        const meta = getTeamMeta(row.team);
        const isFavorite = favorites.includes(row.team);
        const isDragging = draggingTeam === row.team;
        const isDropTarget = dragTargetIndex === idx;

        return (
          <div
            key={row.team}
            draggable={canDrag}
            onDragStart={() => canDrag && setDraggingTeam(row.team)}
            onDragEnd={resetDrag}
            onDragOver={(event) => {
              if (!canDrag || !draggingTeam) return;
              event.preventDefault();
              setDragTargetIndex(idx);
            }}
            onDrop={handleDrop(idx)}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
              isDragging
                ? 'border-accent bg-slate-900/80 text-accent'
                : isDropTarget
                  ? 'border-accent/60 border-dashed bg-slate-900'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            } ${canDrag ? 'cursor-grab active:cursor-grabbing select-none' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  isDragging ? 'bg-accent/30 text-accent' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {idx + 1}
              </span>
              <span className="text-lg">{meta?.flag}</span>
              <span className="font-semibold text-slate-100">{row.team}</span>
            </div>
            {allowFavorites && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFavorite(row.team);
                }}
                className={`text-sm ${isFavorite ? 'text-gold' : 'text-slate-500 hover:text-white'}`}
                aria-label={isFavorite ? 'Unstar team' : 'Star team'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            )}
          </div>
        );
      })}
      {canDrag && (
        <div
          onDragOver={(event) => {
            if (!draggingTeam) return;
            event.preventDefault();
            setDragTargetIndex(standings.length);
          }}
          onDrop={handleDrop(standings.length)}
          className={`h-2 rounded transition ${
            dragTargetIndex === standings.length ? 'bg-accent/40' : 'bg-transparent'
          }`}
          aria-hidden
        />
      )}
      {compact && <p className="text-xs text-slate-400">Tap for fixtures to see more details.</p>}
      {canDrag && (
        <p className="text-xs text-slate-400">Drag teams to set your preferred order for this group.</p>
      )}
    </div>
  );
}
