import React, { createContext, useContext, useMemo, useState } from 'react';
import { BRACKET_SLOTS, Stage, teamMeta } from '../data/bracket';
import { fixtures, GroupId, initialStandings, Team, TeamStanding } from '../data/groups';

interface PredictionsState {
  [matchId: string]: Team | null;
}

interface TournamentContextValue {
  standings: Record<GroupId, TeamStanding[]>;
  updateStandings: (group: GroupId, newOrder: TeamStanding[]) => void;
  predictions: PredictionsState;
  setPrediction: (matchId: string, team: Team) => void;
  favorites: Team[];
  toggleFavorite: (team: Team) => void;
  mode: 'results' | 'predictions';
  setMode: (mode: 'results' | 'predictions') => void;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [standings, setStandings] = useState<Record<GroupId, TeamStanding[]>>(initialStandings);
  const [predictions, setPredictions] = useState<PredictionsState>({});
  const [favorites, setFavorites] = useState<Team[]>(['Mexico', 'United States']);
  const [mode, setMode] = useState<'results' | 'predictions'>('results');

  const updateStandings = (group: GroupId, newOrder: TeamStanding[]) => {
    setStandings((prev) => ({ ...prev, [group]: newOrder }));
  };

  const setPrediction = (matchId: string, team: Team) => {
    setPredictions((prev) => ({ ...prev, [matchId]: team }));
  };

  const toggleFavorite = (team: Team) => {
    setFavorites((prev) => {
      if (prev.includes(team)) return prev.filter((t) => t !== team);
      if (prev.length >= 3) return prev;
      return [...prev, team];
    });
  };

  const value = useMemo(
    () => ({ standings, updateStandings, predictions, setPrediction, favorites, toggleFavorite, mode, setMode }),
    [favorites, mode, predictions, standings],
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
    // Derive loser by knowing previous winners; left null until results arrive from a live API.
    return null;
  }
  return null;
};

export const buildMatchesWithTeams = (
  mode: 'results' | 'predictions',
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

  // Auto-fill winners in results mode using higher pts + goal diff as a deterministic tiebreaker
  if (mode === 'results') {
    const autoPredictions: PredictionsState = {};
    matches
      .filter((m) => m.stage === 'R32')
      .forEach((m) => {
        const homeScore = Math.random();
        const awayScore = Math.random();
        autoPredictions[m.id] = (homeScore >= awayScore ? m.homeTeam : m.awayTeam) || null;
      });
    return { matches, predictions: autoPredictions };
  }

  return { matches, predictions };
};

export const findTeamFixtures = (team: Team) => fixtures.filter((f) => f.home === team || f.away === team);
export const getTeamMeta = (team: Team) => teamMeta[team];
