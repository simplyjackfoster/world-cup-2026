import { Fixture } from '../data/groups';
import { getTeamMeta } from '../context/TournamentContext';

interface Props {
  fixtures: Fixture[];
  onSelect: (fixture: Fixture) => void;
}

export default function FixtureList({ fixtures, onSelect }: Props) {
  return (
    <div className="space-y-2">
      {fixtures.map((fixture) => {
        const homeMeta = getTeamMeta(fixture.home);
        const awayMeta = getTeamMeta(fixture.away);
        const date = new Date(fixture.date);
        return (
          <button
            key={fixture.id}
            onClick={() => onSelect(fixture)}
            className="w-full bg-night border border-slate-800 hover:border-accent/50 rounded-xl p-3 flex items-center justify-between text-left"
          >
            <div>
              <p className="text-sm font-semibold">
                {homeMeta.flag} {fixture.home} vs {fixture.away} {awayMeta.flag}
              </p>
              <p className="text-xs text-slate-400">{fixture.city}, {fixture.country}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{date.toLocaleDateString()}</p>
              <p className="text-xs text-slate-400">{date.toLocaleTimeString()}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
