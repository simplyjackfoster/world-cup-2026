import { Team } from '../data/groups';
import { mapEloNameToTeam } from './elo';

export interface DraftKingsOutcome {
  team: Team;
  price: number;
}

export interface DraftKingsOdds {
  asOf: string;
  outcomes: DraftKingsOutcome[];
  source: 'live' | 'fallback';
}

const ODDS_URL =
  'https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup_winner/odds?apiKey=c63fc75d96b9e4e8a1aed5d03f0c5a22&regions=us&markets=outrights&oddsFormat=american&dateFormat=iso';

const FALLBACK_OUTCOMES: { name: string; price: number }[] = [
  { name: 'Spain', price: 450 },
  { name: 'England', price: 550 },
  { name: 'France', price: 750 },
  { name: 'Brazil', price: 800 },
  { name: 'Argentina', price: 800 },
  { name: 'Portugal', price: 1000 },
  { name: 'Germany', price: 1200 },
  { name: 'Netherlands', price: 2000 },
  { name: 'Norway', price: 2800 },
  { name: 'Italy', price: 3000 },
  { name: 'Belgium', price: 4000 },
  { name: 'Colombia', price: 5000 },
  { name: 'Uruguay', price: 6500 },
  { name: 'Switzerland', price: 8000 },
  { name: 'Ecuador', price: 8000 },
  { name: 'Morocco', price: 8000 },
  { name: 'Mexico', price: 8000 },
  { name: 'USA', price: 8000 },
  { name: 'Croatia', price: 10000 },
  { name: 'Japan', price: 10000 },
  { name: 'Senegal', price: 12000 },
  { name: 'Ghana', price: 15000 },
  { name: 'Sweden', price: 15000 },
  { name: 'South Korea', price: 15000 },
  { name: 'Paraguay', price: 15000 },
  { name: 'Australia', price: 15000 },
  { name: 'Denmark', price: 20000 },
  { name: 'Algeria', price: 20000 },
  { name: 'Ukraine', price: 20000 },
  { name: 'Ivory Coast', price: 20000 },
  { name: 'Bolivia', price: 25000 },
  { name: 'Turkey', price: 25000 },
  { name: 'Egypt', price: 25000 },
  { name: 'Scotland', price: 25000 },
  { name: 'Canada', price: 25000 },
  { name: 'Poland', price: 25000 },
  { name: 'Wales', price: 35000 },
  { name: 'Tunisia', price: 40000 },
  { name: 'South Africa', price: 50000 },
  { name: 'Slovakia', price: 50000 },
  { name: 'Romania', price: 50000 },
  { name: 'North Macedonia', price: 50000 },
  { name: 'Czech Republic', price: 50000 },
  { name: 'Iran', price: 50000 },
  { name: 'DR Congo', price: 70000 },
  { name: 'Kosovo', price: 70000 },
  { name: 'Panama', price: 70000 },
  { name: 'Northern Ireland', price: 70000 },
  { name: 'Albania', price: 100000 },
  { name: 'Saudi Arabia', price: 100000 },
  { name: 'Qatar', price: 100000 },
  { name: 'New Zealand', price: 100000 },
  { name: 'Jamaica', price: 100000 },
  { name: 'Iraq', price: 100000 },
  { name: 'Iceland', price: 100000 },
  { name: 'Uzbekistan', price: 200000 },
  { name: 'Cape Verde', price: 200000 },
  { name: 'Suriname', price: 200000 },
  { name: 'Curaçao', price: 200000 },
  { name: 'Jordan', price: 250000 },
  { name: 'Haiti', price: 400000 },
];

let cachedOdds: DraftKingsOdds | null = null;
let inFlightRequest: Promise<DraftKingsOdds> | null = null;

const parseOutcomeName = (name: string): Team | null => {
  if (!name) return null;
  if (name === 'USA') return 'United States';
  return mapEloNameToTeam(name);
};

const toDraftKingsOdds = (outcomes: { name: string; price: number }[], asOf: string, source: 'live' | 'fallback'): DraftKingsOdds => {
  const mapped = outcomes.reduce<Record<Team, number>>((acc, outcome) => {
    const team = parseOutcomeName(outcome.name);
    if (!team) return acc;
    const bestPrice = acc[team];
    acc[team] = typeof bestPrice === 'number' ? Math.min(bestPrice, outcome.price) : outcome.price;
    return acc;
  }, {} as Record<Team, number>);

  const sorted = Object.entries(mapped)
    .map(([team, price]) => ({ team: team as Team, price: Number(price) }))
    .sort((a, b) => a.price - b.price);

  return { asOf, outcomes: sorted, source };
};

const readDraftKingsFromApi = async (): Promise<DraftKingsOdds> => {
  const response = await fetch(ODDS_URL);
  if (!response.ok) {
    throw new Error(`DraftKings feed returned ${response.status}`);
  }

  const payload = await response.json();
  const event = Array.isArray(payload) ? payload[0] : null;
  const draftKings = event?.bookmakers?.find((book: any) => book.key === 'draftkings');
  const outrightMarket = draftKings?.markets?.find((market: any) => market.key === 'outrights');
  const outcomes = outrightMarket?.outcomes as { name: string; price: number }[] | undefined;

  if (!outcomes?.length) {
    throw new Error('DraftKings outrights missing from response');
  }

  return toDraftKingsOdds(outcomes, draftKings.last_update ?? new Date().toISOString(), 'live');
};

export const fetchDraftKingsOdds = async (): Promise<DraftKingsOdds> => {
  if (cachedOdds) return cachedOdds;
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = (async () => {
    try {
      cachedOdds = await readDraftKingsFromApi();
    } catch (error) {
      cachedOdds = toDraftKingsOdds(FALLBACK_OUTCOMES, '2025-12-06T01:20:30Z', 'fallback');
    }

    inFlightRequest = null;
    return cachedOdds;
  })();

  return inFlightRequest;
};

