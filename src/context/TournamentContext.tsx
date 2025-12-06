import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BRACKET_SLOTS, Stage, teamMeta } from '../data/bracket';
import { fixtures, GROUPS, GroupId, initialStandings, Team, TeamStanding } from '../data/groups';
import { fetchEloRatings, mapEloNameToTeam } from '../lib/elo';

interface PredictionsState {
  [matchId: string]: Team | null;
}

interface TournamentContextValue {
  standings: Record<GroupId, TeamStanding[]>;
  updateStandings: (group: GroupId, newOrder: TeamStanding[]) => void;
  predictions: PredictionsState;
  setPrediction: (matchId: string, team: Team) => void;
  pickBracketByElo: () => void;
  randomizeBracket: () => void;
  rankStandingsByElo: () => void;
  randomizeStandings: () => void;
  eloRatings: Record<Team, number>;
  eloLoading: boolean;
  eloError: string | null;
  refreshEloRatings: () => void;
  favorites: Team[];
  toggleFavorite: (team: Team) => void;
}

const DEFAULT_ELO = 1200;

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [standings, setStandings] = useState<Record<GroupId, TeamStanding[]>>(initialStandings);
  const [predictions, setPredictions] = useState<PredictionsState>({});
  const [favorites, setFavorites] = useState<Team[]>(['Mexico', 'United States']);
  const [eloRatings, setEloRatings] = useState<Record<Team, number>>({});
  const [eloLoading, setEloLoading] = useState(false);
  const [eloError, setEloError] = useState<string | null>(null);

  const updateStandings = useCallback((group: GroupId, newOrder: TeamStanding[]) => {
    setStandings((prev) => ({ ...prev, [group]: newOrder }));
  }, []);

  const setPrediction = useCallback((matchId: string, team: Team) => {
    setPredictions((prev) => ({ ...prev, [matchId]: team }));
  }, []);

  const getEloRating = useCallback((team: Team) => eloRatings[team] ?? DEFAULT_ELO, [eloRatings]);

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
  const randomizeBracket = useCallback(() => fillBracket((home, away) => (Math.random() < 0.5 ? home : away)), [fillBracket]);

  const refreshEloRatings = useCallback(async () => {
    setEloLoading(true);
    setEloError(null);
    try {
      const data = await fetchEloRatings(mapEloNameToTeam);
      setEloRatings(data);
    } catch (error) {
      setEloError(error instanceof Error ? error.message : 'Unable to load ELO ratings');
    } finally {
      setEloLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEloRatings();
  }, [refreshEloRatings]);

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
      randomizeBracket,
      rankStandingsByElo,
      randomizeStandings,
      eloRatings,
      eloLoading,
      eloError,
      refreshEloRatings,
    }),
    [
      standings,
      updateStandings,
      predictions,
      setPrediction,
      favorites,
      toggleFavorite,
      pickBracketByElo,
      randomizeBracket,
      rankStandingsByElo,
      randomizeStandings,
      eloRatings,
      eloLoading,
      eloError,
      refreshEloRatings,
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
