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
    <button
      onClick={onClick}
      className="w-full text-left bg-pitch rounded-2xl shadow-card border border-slate-800/80 hover:border-accent/50 transition"
    >
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Group</p>
          <h3 className="text-2xl font-bold">{id}</h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">Tap for fixtures</div>
      </div>
      <div className="px-4 pb-4">
        <GroupTable standings={table} compact />
      </div>
    </button>
  );
}
