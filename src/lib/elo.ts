import { GROUPS, Team } from '../data/groups';

const ELO_URL = 'https://raw.githubusercontent.com/fivethirtyeight/data/master/soccer-spi/elo_latest.csv';

const TEAM_LOOKUP: Record<string, Team> = Object.fromEntries(
  GROUPS.flatMap((group) => group.teams.map((team) => [normalizeName(team), team])),
) as Record<string, Team>;

const TEAM_ALIASES: Record<string, Team> = {
  usa: 'United States',
  'united states': 'United States',
  'korea republic': 'South Korea',
  'south korea': 'South Korea',
  'cote divoire': 'Ivory Coast',
  "cote d'ivoire": 'Ivory Coast',
  'ivory coast': 'Ivory Coast',
  curacao: 'Curaçao',
  curaçao: 'Curaçao',
  'cape verde islands': 'Cape Verde',
  'cape verde': 'Cape Verde',
  'saudi arabia': 'Saudi Arabia',
  'uae playoff winner 1': 'Intercontinental Playoff 1 winner',
  'uae playoff winner 2': 'Intercontinental Playoff 2 winner',
  'intercontinental playoff 1 winner': 'Intercontinental Playoff 1 winner',
  'intercontinental playoff 2 winner': 'Intercontinental Playoff 2 winner',
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export const mapEloNameToTeam = (rawName: string): Team | null => {
  const normalized = normalizeName(rawName);
  return TEAM_LOOKUP[normalized] ?? TEAM_ALIASES[normalized] ?? null;
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

export const fetchEloRatings = async (
  mapNameToTeam: (name: string) => Team | null,
): Promise<Record<Team, number>> => {
  const response = await fetch(ELO_URL);
  if (!response.ok) {
    throw new Error('Unable to download ELO ratings');
  }

  const text = await response.text();
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  const nameIndex = headers.findIndex((h) => ['team', 'name'].includes(h.toLowerCase()));
  const eloIndex = headers.findIndex((h) => h.toLowerCase() === 'elo');

  if (nameIndex === -1 || eloIndex === -1) {
    throw new Error('ELO feed missing expected columns');
  }

  return rows.reduce<Record<Team, number>>((acc, row) => {
    const cells = parseCsvLine(row);
    const rawName = cells[nameIndex];
    const rating = Number(cells[eloIndex]);

    if (!rawName || Number.isNaN(rating)) return acc;

    const team = mapNameToTeam(rawName);
    if (!team) return acc;

    const existing = acc[team];
    acc[team] = existing ? Math.max(existing, rating) : rating;
    return acc;
  }, {});
};
