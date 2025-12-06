import { GROUPS, Team } from '../data/groups';
import { ELO_SNAPSHOT, ELO_SNAPSHOT_DATE } from '../data/eloSnapshot';

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

export const getStaticEloRatings = async () => ({ ratings: ELO_SNAPSHOT, asOf: ELO_SNAPSHOT_DATE });

