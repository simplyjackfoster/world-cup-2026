import { GroupId } from '../data/groups';
import GroupTable from './GroupTable';
import { useTournament } from '../context/TournamentContext';

interface Props {
  id: GroupId;
  onClick: () => void;
}

export default function GroupCard({ id, onClick }: Props) {
  const { standings } = useTournament();
  const table = standings[id];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className="w-full text-left rounded-xl border border-border bg-pitch hover:border-accent/60 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Group</p>
          <h3 className="text-2xl font-bold text-gold">{id}</h3>
        </div>
        <div className="px-3 py-1 rounded-md border border-border text-accent text-xs font-semibold">View fixtures</div>
      </div>
      <div className="px-4 py-3">
        <GroupTable standings={table} compact groupId={id} enableDrag />
      </div>
    </div>
  );
}
