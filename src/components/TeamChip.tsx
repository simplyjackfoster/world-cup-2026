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
    'w-full flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left transition border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
  const selectedStyles =
    'bg-accent/10 border-accent text-accent shadow-none hover:border-accent/80 focus-visible:outline-accent';
  const idleStyles = 'bg-night border-border hover:border-accent/40 text-gold';
  const disabledStyles = 'opacity-60 cursor-not-allowed';
  const statusStyles = selected ? 'text-accent opacity-100' : 'text-transparent opacity-0';

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
          <span className="text-[11px] uppercase tracking-wide text-muted leading-tight">
            {team ? meta?.confed : source}
          </span>
        </div>
      </div>
      <span className={`text-[11px] font-bold uppercase min-w-[80px] text-right ${statusStyles}`} aria-hidden={!selected}>
        Advancing
      </span>
    </button>
  );
}
