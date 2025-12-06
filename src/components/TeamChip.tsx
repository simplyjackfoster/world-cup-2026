import { type MouseEvent } from 'react';
import { getTeamMeta } from '../context/TournamentContext';
import { type Team } from '../data/groups';

interface TeamChipProps {
  team: Team | null;
  source?: string;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export default function TeamChip({ team, source, selected = false, onSelect, disabled = false }: TeamChipProps) {
  const meta = team ? getTeamMeta(team) : null;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled) return;
    onSelect?.();
  };

  const baseStyles =
    'w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
  const selectedStyles =
    'bg-accent/15 border-accent text-accent shadow-[0_0_0_1px_rgba(56,189,248,0.4)] hover:border-accent/80 focus-visible:outline-accent';
  const idleStyles = 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-100';
  const disabledStyles = 'opacity-60 cursor-not-allowed';

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={handleClick}
      className={`${baseStyles} ${selected ? selectedStyles : idleStyles} ${disabled ? disabledStyles : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden>
          {meta?.flag ?? '•'}
        </span>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight">{team ?? 'TBD'}</span>
          <span className="text-[11px] uppercase tracking-wide text-slate-400 leading-tight">
            {team ? meta?.confed : source}
          </span>
        </div>
      </div>
      {selected && <span className="text-[11px] font-bold uppercase text-accent">Advancing</span>}
    </button>
  );
}
