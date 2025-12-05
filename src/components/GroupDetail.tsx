import { useMemo, useState } from 'react';
import { fixtures, GroupId } from '../data/groups';
import GroupTable from './GroupTable';
import FixtureList from './FixtureList';
import MatchModal from './MatchModal';
import { useTournament } from '../context/TournamentContext';

interface Props {
  groupId: string;
  onClose: () => void;
}

export default function GroupDetail({ groupId, onClose }: Props) {
  const { standings } = useTournament();
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null);

  const groupFixtures = useMemo(() => fixtures.filter((f) => f.group === groupId), [groupId]);
  const current = groupFixtures.find((f) => f.id === selectedFixture);

  return (
    <div className="bg-pitch border border-slate-800 rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Group detail</p>
          <h3 className="text-xl font-semibold">Group {groupId}</h3>
        </div>
        <button className="text-slate-400 hover:text-white" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-night border border-slate-800 rounded-xl p-4">
          <h4 className="font-semibold mb-2">Standings</h4>
          <GroupTable standings={standings[groupId as GroupId]} />
        </div>
        <div className="bg-night border border-slate-800 rounded-xl p-4">
          <h4 className="font-semibold mb-2">Fixtures</h4>
          <FixtureList fixtures={groupFixtures} onSelect={(f) => setSelectedFixture(f.id)} />
        </div>
      </div>
      {current && <MatchModal fixture={current} onClose={() => setSelectedFixture(null)} />}
    </div>
  );
}
