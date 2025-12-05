export type Team =
  | 'Mexico'
  | 'South Africa'
  | 'South Korea'
  | 'European Playoff D winner'
  | 'Canada'
  | 'European Playoff A winner'
  | 'Qatar'
  | 'Switzerland'
  | 'Brazil'
  | 'Morocco'
  | 'Haiti'
  | 'Scotland'
  | 'United States'
  | 'Paraguay'
  | 'Australia'
  | 'European Playoff C winner'
  | 'Germany'
  | 'Curaçao'
  | 'Ivory Coast'
  | 'Ecuador'
  | 'Netherlands'
  | 'Japan'
  | 'European Playoff B winner'
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
  | 'Intercontinental Playoff 2 winner'
  | 'Norway'
  | 'Argentina'
  | 'Algeria'
  | 'Austria'
  | 'Jordan'
  | 'Portugal'
  | 'Intercontinental Playoff 1 winner'
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
  { id: 'A', teams: ['Mexico', 'South Africa', 'South Korea', 'European Playoff D winner'] },
  { id: 'B', teams: ['Canada', 'European Playoff A winner', 'Qatar', 'Switzerland'] },
  { id: 'C', teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'] },
  { id: 'D', teams: ['United States', 'Paraguay', 'Australia', 'European Playoff C winner'] },
  { id: 'E', teams: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'] },
  { id: 'F', teams: ['Netherlands', 'Japan', 'European Playoff B winner', 'Tunisia'] },
  { id: 'G', teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'] },
  { id: 'H', teams: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'] },
  { id: 'I', teams: ['France', 'Senegal', 'Intercontinental Playoff 2 winner', 'Norway'] },
  { id: 'J', teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'] },
  { id: 'K', teams: ['Portugal', 'Intercontinental Playoff 1 winner', 'Uzbekistan', 'Colombia'] },
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
    group.teams.map((team, index) => ({
      team,
      mp: 3,
      w: 1 + (index % 2),
      d: index % 2 === 0 ? 1 : 0,
      l: index === 0 ? 0 : 1,
      gf: 2 + index,
      ga: 1 + (index % 2),
      pts: 3 * (1 + (index % 2)) + (index % 2 === 0 ? 1 : 0),
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

export const fixtures: Fixture[] = GROUPS.flatMap((group, idx) => {
  const [a, b, c, d] = group.teams;
  return [
    {
      id: `${group.id}-1`,
      group: group.id,
      home: a,
      away: b,
      date: new Date(2026, 5, 10 + idx, 16).toISOString(),
      city: 'New York',
      stadium: 'MetLife Stadium',
      country: 'USA',
    },
    {
      id: `${group.id}-2`,
      group: group.id,
      home: c,
      away: d,
      date: new Date(2026, 5, 12 + idx, 14).toISOString(),
      city: 'Los Angeles',
      stadium: 'SoFi Stadium',
      country: 'USA',
    },
  ];
});
