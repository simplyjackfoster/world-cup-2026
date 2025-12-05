import type { HostCity, HostMatch, Stage } from '../../types/hostCities';

function formatDateTime(date: string | null, timeZone: string) {
  if (!date) return 'TBD';
  const local = new Date(date);
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(local);
}

function stageLabel(stage: Stage, group?: string | null) {
  if (stage === 'GROUP' && group) return `Group ${group}`;
  switch (stage) {
    case 'ROUND_OF_32':
      return 'Round of 32';
    case 'ROUND_OF_16':
      return 'Round of 16';
    case 'QUARTER_FINAL':
      return 'Quarter-final';
    case 'SEMI_FINAL':
      return 'Semi-final';
    case 'THIRD_PLACE':
      return 'Third place';
    case 'FINAL':
      return 'Final';
    default:
      return stage;
  }
}

interface Props {
  city: HostCity;
  filteredMatches: HostMatch[];
}

export default function HostCityDetail({ city, filteredMatches }: Props) {
  const groupMatches = filteredMatches.filter((m) => m.stage === 'GROUP').length;
  const knockoutMatches = filteredMatches.filter((m) => m.stage !== 'GROUP').length;
  return (
    <div className="bg-pitch border border-slate-800 rounded-2xl shadow-card">
      <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-night to-pitch rounded-t-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Host City</p>
        <h2 className="text-3xl font-semibold">{city.label}</h2>
        <p className="text-sm text-slate-300">{city.stadiumGenericName}</p>
        <p className="text-xs text-slate-400">{city.stadiumTraditionalName} · Capacity {city.capacity.toLocaleString()}</p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-accent/20 text-accent font-semibold">Group matches: {groupMatches}</span>
          <span className="px-3 py-1 rounded-full bg-night border border-slate-700">Knockout: {knockoutMatches}</span>
        </div>
      </div>
      <div className="p-6 space-y-3">
        {filteredMatches.length === 0 && (
          <p className="text-sm text-slate-400">No matches available yet. Run the build script once the official schedule is accessible.</p>
        )}
        {filteredMatches.map((match) => (
          <div key={match.fifaMatchNumber} className="bg-night border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>M{match.fifaMatchNumber}</span>
              <span>{stageLabel(match.stage, match.group)}</span>
            </div>
            <p className="text-sm font-semibold mt-1">{match.homeTeamName} vs {match.awayTeamName}</p>
            <p className="text-xs text-slate-400">{formatDateTime(match.kickoffLocal, match.timeZone)} · {city.timeZone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
