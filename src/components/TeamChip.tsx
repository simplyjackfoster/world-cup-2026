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
    'relative w-full flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition bg-surface text-textPrimary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
  const selectedStyles =
    'border-accent bg-accent/10 text-textPrimary shadow-none translate-x-[2px] focus-visible:outline-accent';
  const idleStyles = 'border-border hover:bg-surfaceHover';
  const disabledStyles = 'opacity-60 cursor-not-allowed';

  const detail = source ?? meta?.confed ?? 'TBD';

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={handleClick}
      className={`${baseStyles} ${selected ? selectedStyles : idleStyles} ${disabled ? disabledStyles : ''}`}
    >
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-sm font-semibold leading-5">{team ?? 'TBD'}</span>
        <span className="text-[11px] leading-4 text-textSecondary">{detail}</span>
      </div>
      <span
        className={`ml-auto h-2.5 w-2.5 rounded-full border ${selected ? 'border-accent bg-accent/70' : 'border-border bg-surface'}`}
        aria-hidden
      />
    </button>
  );
}
