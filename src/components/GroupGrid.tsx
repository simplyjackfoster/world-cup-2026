import { GROUPS } from '../data/groups';
import GroupCard from './GroupCard';

interface Props {
  onSelectGroup: (id: string) => void;
}

export default function GroupGrid({ onSelectGroup }: Props) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {GROUPS.map((group) => (
        <GroupCard key={group.id} id={group.id} onClick={() => onSelectGroup(group.id)} />
      ))}
    </div>
  );
}
