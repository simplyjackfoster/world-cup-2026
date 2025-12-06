import { forwardRef } from 'react';
import { stageLabel } from './Bracket';
import TeamChip from './TeamChip';
import type { buildMatchesWithTeams } from '../context/TournamentContext';
import { type Team } from '../data/groups';

interface MatchCardProps {
  match: ReturnType<typeof buildMatchesWithTeams>['matches'][number];
  winner: Team | null;
  onSelectTeam: (matchId: string, team: Team) => void;
  onOpenDetails: () => void;
}

const MatchCard = forwardRef<HTMLDivElement, MatchCardProps>(function MatchCard(
  { match, winner, onSelectTeam, onOpenDetails },
  ref,
) {
  const bothTeamsMissing = !match.homeTeam && !match.awayTeam;
  const awaitingOpponent = !match.homeTeam || !match.awayTeam;
  return (
    <div
      ref={ref}
      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-lg transition hover:border-accent/40"
    >
      <div className="flex items-center justify-between mb-2 text-[11px] uppercase text-slate-400">
        <p className="font-semibold tracking-wide">{match.id}</p>
        <div className="flex items-center gap-2">
          {bothTeamsMissing && <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px]">Waiting on groups</span>}
          {!bothTeamsMissing && awaitingOpponent && (
            <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px]">Awaiting opponent</span>
          )}
          {!awaitingOpponent && winner && <span className="text-accent font-semibold">Advances →</span>}
        </div>
      </div>
      <div className="space-y-2" aria-label={`${stageLabel[match.stage]} ${match.id}`}>
        <TeamChip
          team={match.homeTeam}
          source={match.home.source}
          selected={winner === match.homeTeam}
          onSelect={() => match.homeTeam && onSelectTeam(match.id, match.homeTeam)}
          disabled={!match.homeTeam}
        />
        <TeamChip
          team={match.awayTeam}
          source={match.away.source}
          selected={winner === match.awayTeam}
          onSelect={() => match.awayTeam && onSelectTeam(match.id, match.awayTeam)}
          disabled={!match.awayTeam}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-800/70 px-2 py-[2px] uppercase tracking-wide">{stageLabel[match.stage]}</span>
          {!bothTeamsMissing && <span>Tap a team to advance</span>}
          {bothTeamsMissing && <span>Finish group stage first</span>}
        </div>
        <button
          type="button"
          onClick={onOpenDetails}
          className="text-accent hover:text-accent/80 font-semibold"
        >
          Details
        </button>
      </div>
    </div>
  );
});

export default MatchCard;
