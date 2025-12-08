import { forwardRef, useMemo } from 'react';
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
  const seedHint = useMemo(
    () => ({
      home: match.home.source,
      away: match.away.source,
    }),
    [match.away.source, match.home.source],
  );
  return (
    <div
      ref={ref}
      className="rounded-lg border border-border bg-surface p-2 text-textPrimary transition hover:bg-surfaceHover"
      role="button"
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      aria-label={`${stageLabel[match.stage]} ${match.id}`}
    >
      <div className="space-y-1.5">
        <TeamChip
          team={match.homeTeam}
          source={seedHint.home}
          selected={winner === match.homeTeam}
          onSelect={() => match.homeTeam && onSelectTeam(match.id, match.homeTeam)}
          disabled={!match.homeTeam}
        />
        <TeamChip
          team={match.awayTeam}
          source={seedHint.away}
          selected={winner === match.awayTeam}
          onSelect={() => match.awayTeam && onSelectTeam(match.id, match.awayTeam)}
          disabled={!match.awayTeam}
        />
      </div>
    </div>
  );
});

export default MatchCard;
