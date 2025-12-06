import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BRACKET_SLOTS, Stage, teamMeta } from '../data/bracket';
import { fixtures, GROUPS, GroupId, initialStandings, Team, TeamStanding } from '../data/groups';
import { getStaticEloRatings } from '../lib/elo';
import { fetchDraftKingsOdds } from '../lib/odds';

interface PredictionsState {
  [matchId: string]: Team | null;
}

interface TournamentContextValue {
  standings: Record<GroupId, TeamStanding[]>;
  updateStandings: (group: GroupId, newOrder: TeamStanding[]) => void;
  predictions: PredictionsState;
  setPrediction: (matchId: string, team: Team) => void;
  pickBracketByElo: () => void;
  pickBracketByDraftKings: () => void;
  randomizeBracket: () => void;
  rankStandingsByElo: () => void;
  rankStandingsByDraftKings: () => void;
  randomizeStandings: () => void;
  eloRatings: Record<string, number>;
  eloLoading: boolean;
  eloError: string | null;
  refreshEloRatings: () => void;
  eloAsOf: string | null;
  draftKingsOdds: { team: Team; price: number }[] | null;
  draftKingsLoading: boolean;
  draftKingsError: string | null;
  draftKingsAsOf: string | null;
  refreshDraftKingsOdds: () => void;
  favorites: Team[];
  toggleFavorite: (team: Team) => void;
}

const DEFAULT_ELO = 1200;

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [standings, setStandings] = useState<Record<GroupId, TeamStanding[]>>(initialStandings);
  const [predictions, setPredictions] = useState<PredictionsState>({});
  const [favorites, setFavorites] = useState<Team[]>(['Mexico', 'United States']);
  const [eloRatings, setEloRatings] = useState<Record<string, number>>({});
  const [eloLoading, setEloLoading] = useState(false);
  const [eloError, setEloError] = useState<string | null>(null);
  const [eloAsOf, setEloAsOf] = useState<string | null>(null);
  const [draftKingsOdds, setDraftKingsOdds] = useState<{ team: Team; price: number }[] | null>(null);
  const [draftKingsAsOf, setDraftKingsAsOf] = useState<string | null>(null);
  const [draftKingsLoading, setDraftKingsLoading] = useState(false);
  const [draftKingsError, setDraftKingsError] = useState<string | null>(null);

  const updateStandings = useCallback((group: GroupId, newOrder: TeamStanding[]) => {
    setStandings((prev) => ({ ...prev, [group]: newOrder }));
  }, []);

  const setPrediction = useCallback((matchId: string, team: Team) => {
    setPredictions((prev) => ({ ...prev, [matchId]: team }));
  }, []);

  const getEloRating = useCallback((team: Team) => eloRatings[team] ?? DEFAULT_ELO, [eloRatings]);
  const getDraftKingsPrice = useCallback(
    (team: Team) => draftKingsOdds?.find((entry) => entry.team === team)?.price ?? Number.POSITIVE_INFINITY,
    [draftKingsOdds],
  );

  const randomizeStandings = useCallback(() => {
    setStandings((prev) => {
      const next: Record<GroupId, TeamStanding[]> = { ...prev };
      GROUPS.forEach((group) => {
        const shuffled = [...prev[group.id]].sort(() => Math.random() - 0.5);
        next[group.id] = shuffled;
      });
      return next;
    });
  }, []);

  const rankStandingsByElo = useCallback(() => {
    setStandings((prev) => {
      const next: Record<GroupId, TeamStanding[]> = { ...prev };
      GROUPS.forEach((group) => {
        const sorted = [...prev[group.id]].sort((a, b) => getEloRating(b.team) - getEloRating(a.team));
        next[group.id] = sorted;
      });
      return next;
    });
  }, [getEloRating]);

  const refreshDraftKingsOdds = useCallback(async () => {
    if (draftKingsOdds || draftKingsLoading) return;
    setDraftKingsLoading(true);
    setDraftKingsError(null);
    try {
      const odds = await fetchDraftKingsOdds();
      setDraftKingsOdds(odds.outcomes);
      setDraftKingsAsOf(odds.asOf);
    } catch (error) {
      setDraftKingsError(error instanceof Error ? error.message : 'Unable to load DraftKings odds');
    } finally {
      setDraftKingsLoading(false);
    }
  }, [draftKingsLoading, draftKingsOdds]);

  const rankStandingsByDraftKings = useCallback(() => {
    if (!draftKingsOdds) {
      refreshDraftKingsOdds();
      return;
    }

    setStandings((prev) => {
      const next: Record<GroupId, TeamStanding[]> = { ...prev };
      GROUPS.forEach((group) => {
        const sorted = [...prev[group.id]].sort((a, b) => getDraftKingsPrice(a.team) - getDraftKingsPrice(b.team));
        next[group.id] = sorted;
      });
      return next;
    });
  }, [draftKingsOdds, getDraftKingsPrice, refreshDraftKingsOdds]);

  const fillBracket = useCallback(
    (chooseWinner: (home: Team, away: Team) => Team) => {
      const orderedStages: Stage[] = ['R32', 'R16', 'QF', 'SF', 'F', '3P'];

      setPredictions((prev) => {
        let nextPredictions: PredictionsState = { ...prev };

        orderedStages.forEach((stage) => {
          const { matches } = buildMatchesWithTeams(standings, nextPredictions);
          matches
            .filter((match) => match.stage === stage)
            .forEach((match) => {
              if (!match.homeTeam || !match.awayTeam) return;
              const winner = chooseWinner(match.homeTeam, match.awayTeam);
              nextPredictions = { ...nextPredictions, [match.id]: winner };
            });
        });

        return nextPredictions;
      });
    },
    [standings],
  );

  const pickBracketByElo = useCallback(
    () => fillBracket((home, away) => (getEloRating(home) >= getEloRating(away) ? home : away)),
    [fillBracket, getEloRating],
  );
  const pickBracketByDraftKings = useCallback(() => {
    if (!draftKingsOdds) {
      refreshDraftKingsOdds();
      return;
    }

    fillBracket((home, away) => (getDraftKingsPrice(home) <= getDraftKingsPrice(away) ? home : away));
  }, [draftKingsOdds, fillBracket, getDraftKingsPrice, refreshDraftKingsOdds]);
  const randomizeBracket = useCallback(() => fillBracket((home, away) => (Math.random() < 0.5 ? home : away)), [fillBracket]);

  const refreshEloRatings = useCallback(async () => {
    setEloLoading(true);
    setEloError(null);
    try {
      const { ratings, asOf } = await getStaticEloRatings();
      setEloRatings(ratings);
      setEloAsOf(asOf);
    } catch (error) {
      setEloError(error instanceof Error ? error.message : 'Unable to load ELO ratings');
    } finally {
      setEloLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEloRatings();
  }, [refreshEloRatings]);

  useEffect(() => {
    const timer = window.setTimeout(() => refreshDraftKingsOdds(), 750);
    return () => window.clearTimeout(timer);
  }, [refreshDraftKingsOdds]);

  const toggleFavorite = useCallback((team: Team) => {
    setFavorites((prev) => {
      if (prev.includes(team)) return prev.filter((t) => t !== team);
      if (prev.length >= 3) return prev;
      return [...prev, team];
    });
  }, []);

  const value = useMemo(
    () => ({
      standings,
      updateStandings,
      predictions,
      setPrediction,
      favorites,
      toggleFavorite,
      pickBracketByElo,
      pickBracketByDraftKings,
      randomizeBracket,
      rankStandingsByElo,
      rankStandingsByDraftKings,
      randomizeStandings,
      eloRatings,
      eloLoading,
      eloError,
      refreshEloRatings,
      eloAsOf,
      draftKingsOdds,
      draftKingsLoading,
      draftKingsError,
      draftKingsAsOf,
      refreshDraftKingsOdds,
    }),
    [
      standings,
      updateStandings,
      predictions,
      setPrediction,
      favorites,
      toggleFavorite,
      pickBracketByElo,
      pickBracketByDraftKings,
      randomizeBracket,
      rankStandingsByElo,
      rankStandingsByDraftKings,
      randomizeStandings,
      eloRatings,
      eloLoading,
      eloError,
      refreshEloRatings,
      eloAsOf,
      draftKingsOdds,
      draftKingsLoading,
      draftKingsError,
      draftKingsAsOf,
      refreshDraftKingsOdds,
    ],
  );

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
};

export const useTournament = () => {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
};

export const computeThirdPlaces = (standings: Record<GroupId, TeamStanding[]>) => {
  return Object.entries(standings)
    .map(([groupId, table]) => ({ group: groupId as GroupId, standing: table[2] }))
    .sort((a, b) => b.standing.pts - a.standing.pts || b.standing.gf - a.standing.gf)
    .slice(0, 8);
};

export const resolveSource = (
  source: string,
  standings: Record<GroupId, TeamStanding[]>,
  predictions: PredictionsState,
): Team | null => {
  const groupWinnerMatch = source.match(/Group ([A-L]) winners?/);
  const groupRunnerMatch = source.match(/Group ([A-L]) runners?-up/);
  const bestThirdMatch = source.match(/Best 3rd place #(\d+)/);
  const groupedThirdMatch = source.match(/Group ([A-L](?:\/[A-L])*) third place/);
  const winnerMatch = source.match(/Winner (R\d{2}|QF|SF|3P)-(\d+)/);
  const loserMatch = source.match(/Loser (SF)-(\d+)/);

  if (groupWinnerMatch) {
    const group = groupWinnerMatch[1] as GroupId;
    return standings[group]?.[0]?.team ?? null;
  }
  if (groupRunnerMatch) {
    const group = groupRunnerMatch[1] as GroupId;
    return standings[group]?.[1]?.team ?? null;
  }
  if (bestThirdMatch) {
    const rank = Number(bestThirdMatch[1]);
    const thirds = computeThirdPlaces(standings);
    return thirds[rank - 1]?.standing.team ?? null;
  }
  if (groupedThirdMatch) {
    const groups = groupedThirdMatch[1].split('/') as GroupId[];
    const thirds = computeThirdPlaces(standings).filter((entry) => groups.includes(entry.group));
    return thirds[0]?.standing.team ?? null;
  }
  if (winnerMatch) {
    const [, stage, index] = winnerMatch;
    const key = `${stage}-${index}`;
    return predictions[key] ?? null;
  }
  if (loserMatch) {
    const [, stage, index] = loserMatch;
    const key = `${stage}-${index}`;
    const match = BRACKET_SLOTS.find((slot) => slot.id === key);

    if (!match) return null;

    const homeTeam = resolveSource(match.home.source, standings, predictions);
    const awayTeam = resolveSource(match.away.source, standings, predictions);
    const winner = predictions[key];

    if (!homeTeam || !awayTeam || !winner) return null;

    return winner === homeTeam ? awayTeam : homeTeam;
  }
  return null;
};

export const buildMatchesWithTeams = (
  standings: Record<GroupId, TeamStanding[]>,
  predictions: PredictionsState,
) => {
  const matches = BRACKET_SLOTS.map((match) => {
    const homeTeam = resolveSource(match.home.source, standings, predictions);
    const awayTeam = resolveSource(match.away.source, standings, predictions);

    return {
      ...match,
      homeTeam,
      awayTeam,
    };
  });

  return { matches, predictions };
};

export const findTeamFixtures = (team: Team) => fixtures.filter((f) => f.home === team || f.away === team);
export const getTeamMeta = (team: Team) => teamMeta[team];
