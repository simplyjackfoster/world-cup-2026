import { useMemo, useState } from 'react';
import { fixtures } from '../data/groups';
import { STADIUMS } from '../data/stadiums';
import MatchModal from './MatchModal';

export default function HostCityExplorer() {
  const [selectedCity, setSelectedCity] = useState(STADIUMS[0]);
  const [activeMatch, setActiveMatch] = useState<string | null>(null);

  const matches = useMemo(() => fixtures.filter((f) => selectedCity.matches.includes(f.id)), [selectedCity]);
  const matchObj = matches.find((m) => m.id === activeMatch);

  return (
    <div className="mt-6 grid lg:grid-cols-[1.1fr_1fr] gap-6">
      <div className="bg-pitch border border-slate-800 rounded-2xl p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Host Cities</p>
        <h3 className="text-2xl font-semibold mb-4">Explore stadiums</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STADIUMS.map((stadium) => (
            <button
              key={stadium.id}
              onClick={() => setSelectedCity(stadium)}
              className={`text-left bg-night border rounded-xl p-3 transition ${
                selectedCity.id === stadium.id ? 'border-accent shadow-card' : 'border-slate-800 hover:border-accent/50'
              }`}
            >
              <p className="text-xs uppercase text-slate-400">{stadium.country}</p>
              <p className="font-semibold">{stadium.city}</p>
              <p className="text-sm text-slate-300">{stadium.stadiumName}</p>
              <p className="text-xs text-slate-500">Capacity {stadium.capacity.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-pitch border border-slate-800 rounded-2xl p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Matches in {selectedCity.city}</p>
        <h3 className="text-xl font-semibold mb-4">{selectedCity.stadiumName}</h3>
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-night border border-slate-800 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-sm">{match.home} vs {match.away}</p>
                <p className="text-xs text-slate-400">Group {match.group} · {new Date(match.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setActiveMatch(match.id)}
                className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
      {matchObj && <MatchModal fixture={matchObj} onClose={() => setActiveMatch(null)} />}
    </div>
  );
}
