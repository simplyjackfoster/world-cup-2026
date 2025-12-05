import type { HostCity } from '../../types/hostCities';

interface Props {
  city: HostCity;
  isActive: boolean;
  onSelect: (city: HostCity) => void;
}

function getFlagEmoji(country: HostCity['country']) {
  switch (country) {
    case 'USA':
      return '🇺🇸';
    case 'MEX':
      return '🇲🇽';
    case 'CAN':
      return '🇨🇦';
    default:
      return '🏳️';
  }
}

export default function HostCityCard({ city, isActive, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(city)}
      className={`text-left rounded-2xl border transition shadow-card ${
        isActive ? 'border-accent bg-accent/10' : 'border-slate-800 bg-pitch hover:border-accent/50'
      }`}
    >
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              {getFlagEmoji(city.country)}
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{city.country}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-night border border-slate-700 text-slate-300">
            {city.region}
          </span>
        </div>
        <h3 className="text-lg font-semibold leading-tight">{city.label}</h3>
        <p className="text-sm text-slate-300">{city.stadiumGenericName}</p>
        <p className="text-xs text-slate-400">{city.stadiumTraditionalName}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Capacity {city.capacity.toLocaleString()}</span>
          <span>{city.matches.length} matches</span>
        </div>
      </div>
    </button>
  );
}
