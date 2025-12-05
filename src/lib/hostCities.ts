import { HOST_CITIES } from '../data/hostCities';
import type { HostCitiesById, HostCity, HostCityId, HostMatch } from '../types/hostCities';

export function getAllHostCities(): HostCity[] {
  return Object.values(HOST_CITIES);
}

export function getHostCityById(id: HostCityId): HostCity {
  return HOST_CITIES[id];
}

export function getHostCitiesById(): HostCitiesById {
  return HOST_CITIES;
}

export function findMatchesByTeam(teamCodeOrName: string): HostMatch[] {
  const q = teamCodeOrName.trim().toLowerCase();
  if (!q) return [];
  return Object.values(HOST_CITIES).flatMap((city) =>
    city.matches.filter(
      (match) =>
        match.homeTeamCode.toLowerCase() === q ||
        match.awayTeamCode.toLowerCase() === q ||
        match.homeTeamName.toLowerCase().includes(q) ||
        match.awayTeamName.toLowerCase().includes(q),
    ),
  );
}
