import { useMemo, useState } from 'react';
import HostCityCard from './hostCities/HostCityCard';
import HostCityDetail from './hostCities/HostCityDetail';
import HostCityFilters from './hostCities/HostCityFilters';
import { getAllHostCities } from '../lib/hostCities';
import type { GroupId, HostCity, HostMatch, Stage } from '../types/hostCities';

const CITIES = getAllHostCities();

export default function HostCityExplorer() {
  const [selectedCity, setSelectedCity] = useState<HostCity>(CITIES[0]);
  const [stageFilter, setStageFilter] = useState<Stage | 'ALL'>('ALL');
  const [groupFilter, setGroupFilter] = useState<GroupId | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const matches = useMemo(() => {
    const cityMatches = selectedCity.matches || [];
    return cityMatches.filter((match) => {
      const matchesStage = stageFilter === 'ALL' || match.stage === stageFilter;
      const matchesGroup = groupFilter === 'ALL' || match.group === groupFilter;
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        match.homeTeamName.toLowerCase().includes(normalizedSearch) ||
        match.awayTeamName.toLowerCase().includes(normalizedSearch) ||
        match.homeTeamCode.toLowerCase() === normalizedSearch ||
        match.awayTeamCode.toLowerCase() === normalizedSearch;
      return matchesStage && matchesGroup && matchesSearch;
    });
  }, [groupFilter, search, selectedCity.matches, stageFilter]);

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-pitch border border-slate-800 rounded-2xl p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Host Cities</p>
        <h3 className="text-2xl font-semibold mb-4">Explore every venue</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CITIES.map((city) => (
            <HostCityCard key={city.id} city={city} isActive={city.id === selectedCity.id} onSelect={setSelectedCity} />
          ))}
        </div>
      </div>

      <HostCityFilters
        stage={stageFilter}
        group={groupFilter}
        search={search}
        onStageChange={setStageFilter}
        onGroupChange={setGroupFilter}
        onSearchChange={setSearch}
      />

      <HostCityDetail city={selectedCity} filteredMatches={matches as HostMatch[]} />
    </div>
  );
}
