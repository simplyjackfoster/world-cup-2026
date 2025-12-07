import { HOST_CITIES } from './hostCities';

export type Team =
  | 'Mexico'
  | 'South Africa'
  | 'South Korea'
  | 'Denmark/North Macedonia/Czechia/Republic of Ireland'
  | 'Canada'
  | 'Italy/Northern Ireland/Wales/Bosnia and Herzegovina'
  | 'Qatar'
  | 'Switzerland'
  | 'Brazil'
  | 'Morocco'
  | 'Haiti'
  | 'Scotland'
  | 'United States'
  | 'Paraguay'
  | 'Australia'
  | 'Turkey/Romania/Slovakia/Kosovo'
  | 'Germany'
  | 'Curaçao'
  | 'Ivory Coast'
  | 'Ecuador'
  | 'Netherlands'
  | 'Japan'
  | 'Ukraine/Sweden/Poland/Albania'
  | 'Tunisia'
  | 'Belgium'
  | 'Egypt'
  | 'Iran'
  | 'New Zealand'
  | 'Spain'
  | 'Cape Verde'
  | 'Saudi Arabia'
  | 'Uruguay'
  | 'France'
  | 'Senegal'
  | 'Bolivia/Suriname/Iraq'
  | 'Norway'
  | 'Argentina'
  | 'Algeria'
  | 'Austria'
  | 'Jordan'
  | 'Portugal'
  | 'New Caledonia/Jamaica/DR Congo'
  | 'Uzbekistan'
  | 'Colombia'
  | 'England'
  | 'Croatia'
  | 'Ghana'
  | 'Panama';

export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Group {
  id: GroupId;
  teams: Team[];
}

export const GROUPS: Group[] = [
  {
    id: 'A',
    teams: ['Mexico', 'South Africa', 'South Korea', 'Denmark/North Macedonia/Czechia/Republic of Ireland'],
  },
  {
    id: 'B',
    teams: ['Canada', 'Italy/Northern Ireland/Wales/Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  },
  { id: 'C', teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'] },
  { id: 'D', teams: ['United States', 'Paraguay', 'Australia', 'Turkey/Romania/Slovakia/Kosovo'] },
  { id: 'E', teams: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'] },
  { id: 'F', teams: ['Netherlands', 'Japan', 'Ukraine/Sweden/Poland/Albania', 'Tunisia'] },
  { id: 'G', teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'] },
  { id: 'H', teams: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'] },
  { id: 'I', teams: ['France', 'Senegal', 'Bolivia/Suriname/Iraq', 'Norway'] },
  { id: 'J', teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'] },
  { id: 'K', teams: ['Portugal', 'New Caledonia/Jamaica/DR Congo', 'Uzbekistan', 'Colombia'] },
  { id: 'L', teams: ['England', 'Croatia', 'Ghana', 'Panama'] },
];

export interface TeamStanding {
  team: Team;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
}

export const initialStandings: Record<GroupId, TeamStanding[]> = Object.fromEntries(
  GROUPS.map((group) => [
    group.id,
    group.teams.map((team) => ({
      team,
      mp: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      pts: 0,
    })),
  ]),
) as Record<GroupId, TeamStanding[]>;

export interface Fixture {
  id: string;
  group: GroupId;
  home: Team;
  away: Team;
  date: string;
  city: string;
  stadium: string;
  country: string;
}

const TEAM_ALIASES: Record<string, Team> = {
  usa: 'United States',
  'uefa playoff winner a': 'Italy/Northern Ireland/Wales/Bosnia and Herzegovina',
  'uefa playoff winner b': 'Ukraine/Sweden/Poland/Albania',
  'uefa playoff winner c': 'Turkey/Romania/Slovakia/Kosovo',
  'uefa playoff winner d': 'Denmark/North Macedonia/Czechia/Republic of Ireland',
  'korea republic': 'South Korea',
  'intercontinental playoff winner 1': 'New Caledonia/Jamaica/DR Congo',
  'intercontinental playoff winner 2': 'Bolivia/Suriname/Iraq',
  "cote d'ivoire": 'Ivory Coast',
  "côte d'ivoire": 'Ivory Coast',
  'ir iran': 'Iran',
  'cabo verde': 'Cape Verde',
};

const allTeams: Team[] = GROUPS.flatMap((group) => group.teams);

const normalizeTeamName = (name: string): Team => {
  const normalized = name.trim().toLowerCase();
  if (TEAM_ALIASES[normalized]) return TEAM_ALIASES[normalized];

  const exactMatch = allTeams.find((team) => team.toLowerCase() === normalized);
  if (exactMatch) return exactMatch;

  throw new Error(`Unknown team name in host city data: ${name}`);
};

const hostGroupMatches = Object.values(HOST_CITIES)
  .flatMap((city) => city.matches)
  .filter((match) => match.stage === 'GROUP' && match.group)
  .sort((a, b) => (a.kickoffLocal ?? '').localeCompare(b.kickoffLocal ?? ''));

const usedMatchNumbers = new Set<number>();

export const fixtures: Fixture[] = hostGroupMatches
  .filter((match) => {
    if (usedMatchNumbers.has(match.fifaMatchNumber)) return false;
    usedMatchNumbers.add(match.fifaMatchNumber);
    return true;
  })
  .map((match) => ({
    id: `${match.group}-${match.fifaMatchNumber}`,
    group: match.group as GroupId,
    home: normalizeTeamName(match.homeTeamName),
    away: normalizeTeamName(match.awayTeamName),
    date: match.kickoffLocal ?? '',
    city: match.city,
    stadium: match.stadiumTraditionalName || match.stadiumGenericName,
    country: match.country,
  }));
