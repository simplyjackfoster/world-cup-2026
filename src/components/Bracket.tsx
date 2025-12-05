import { Fragment, useMemo, useState } from 'react';
import { buildMatchesWithTeams, getTeamMeta, useTournament } from '../context/TournamentContext';
import { Stage } from '../data/bracket';
import { Team } from '../data/groups';
import MatchModal from './MatchModal';
import { fixtures } from '../data/groups';

const stageOrder: Stage[] = ['R32', 'R16', 'QF', 'SF', '3P', 'F'];

const stageLabel: Record<Stage, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinals',
  SF: 'Semifinals',
  '3P': 'Third Place',
  F: 'Final',
};

export default function Bracket() {
  const { standings, predictions, setPrediction, mode } = useTournament();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { matches, predictions: autoPred } = useMemo(
    () => buildMatchesWithTeams(mode, standings, predictions),
    [mode, standings, predictions],
  );

  const combinedPredictions = mode === 'results' ? autoPred : predictions;

  const grouped = stageOrder.map((stage) => matches.filter((m) => m.stage === stage));

  const openTeamInfo = (team: Team | null) => {
    if (!team) return;
    setSelectedTeam(team);
  };

  const winningTeam = (matchId: string) => combinedPredictions[matchId];

  const activeFixture = selectedTeam ? fixtures.find((f) => f.home === selectedTeam || f.away === selectedTeam) : null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Knockout view</p>
          <h2 className="text-2xl font-semibold">Interactive Bracket</h2>
        </div>
        <p className="text-sm text-slate-400">Hover or tap teams for confederation + quick info.</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[1200px] flex gap-6">
          {grouped.map((column, idx) => (
            <div key={stageOrder[idx]} className="flex-1 min-w-[180px]">
              <p className="text-sm font-semibold mb-2 sticky top-14 bg-night/90 backdrop-blur inline-block px-3 py-1 rounded-full">
                {stageLabel[stageOrder[idx]]}
              </p>
              <div className="space-y-3">
                {column.map((match) => (
                  <div
                    key={match.id}
                    className="bg-pitch border border-slate-800 rounded-xl p-3 shadow-card hover:border-accent/40"
                  >
                    <p className="text-xs uppercase text-slate-400 mb-2">{match.id}</p>
                    {[match.homeTeam, match.awayTeam].map((team, i) => {
                      const meta = team ? getTeamMeta(team) : null;
                      const isWinner = winningTeam(match.id) === team;
                      return (
                        <Fragment key={team ?? i}>
                          <button
                            onClick={() => team && mode === 'predictions' && setPrediction(match.id, team)}
                            onMouseEnter={() => openTeamInfo(team ?? null)}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                              isWinner ? 'bg-accent/20 border border-accent text-accent' : 'bg-slate-900 border border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{meta?.flag}</span>
                              <span className="font-semibold text-sm">{team ?? 'TBD'}</span>
                            </div>
                            <span className="text-xs text-slate-400">{meta?.confed}</span>
                          </button>
                          {i === 0 && <div className="h-2" />}
                        </Fragment>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {activeFixture && <MatchModal fixture={activeFixture} onClose={() => setSelectedTeam(null)} />}
    </div>
  );
}
