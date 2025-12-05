import type { GroupId, Stage } from '../../types/hostCities';

interface Props {
  stage: Stage | 'ALL';
  group: GroupId | 'ALL';
  search: string;
  onStageChange: (stage: Stage | 'ALL') => void;
  onGroupChange: (group: GroupId | 'ALL') => void;
  onSearchChange: (value: string) => void;
}

const stageOptions: { value: Stage | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All stages' },
  { value: 'GROUP', label: 'Group stage' },
  { value: 'ROUND_OF_32', label: 'Round of 32' },
  { value: 'ROUND_OF_16', label: 'Round of 16' },
  { value: 'QUARTER_FINAL', label: 'Quarter-final' },
  { value: 'SEMI_FINAL', label: 'Semi-final' },
  { value: 'THIRD_PLACE', label: 'Third place' },
  { value: 'FINAL', label: 'Final' },
];

const groups: (GroupId | 'ALL')[] = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function HostCityFilters({
  stage,
  group,
  search,
  onStageChange,
  onGroupChange,
  onSearchChange,
}: Props) {
  return (
    <div className="bg-pitch border border-slate-800 rounded-2xl p-4 shadow-card grid gap-3 md:grid-cols-3">
      <div className="space-y-1">
        <p className="text-xs text-slate-400">Stage</p>
        <select
          value={stage}
          onChange={(e) => onStageChange(e.target.value as Stage | 'ALL')}
          className="w-full bg-night border border-slate-700 rounded-lg px-3 py-2 text-sm"
        >
          {stageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-slate-400">Group</p>
        <select
          value={group}
          onChange={(e) => onGroupChange(e.target.value as GroupId | 'ALL')}
          className="w-full bg-night border border-slate-700 rounded-lg px-3 py-2 text-sm"
        >
          {groups.map((g) => (
            <option key={g} value={g}>
              {g === 'ALL' ? 'All groups' : `Group ${g}`}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-slate-400">Search team</p>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by team name or code"
          className="w-full bg-night border border-slate-700 rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
