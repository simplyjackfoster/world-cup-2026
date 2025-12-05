import { useEffect } from 'react';
import { type Team } from '../data/groups';
import { getTeamMeta } from '../context/TournamentContext';
import type { buildMatchesWithTeams } from '../context/TournamentContext';

type BracketMatch = ReturnType<typeof buildMatchesWithTeams>['matches'][number];

interface Props {
  match: BracketMatch;
  stageLabel: string;
  winner: Team | null;
  onClose: () => void;
}

export default function BracketMatchModal({ match, onClose, stageLabel, winner }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const renderTeam = (team: Team | null, source: string, isWinner: boolean) => {
    if (!team) {
      return (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-lg">•</span>
          <div>
            <p className="font-semibold">TBD</p>
            <p className="text-xs">{source}</p>
          </div>
        </div>
      );
    }

    const meta = getTeamMeta(team);
    return (
      <div className="flex items-center gap-3">
        <span className="text-xl">{meta.flag}</span>
        <div>
          <p className={`font-semibold ${isWinner ? 'text-accent' : ''}`}>{team}</p>
          <p className="text-xs text-slate-400">{meta.confed}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-pitch p-6 shadow-card">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full px-2 text-slate-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stageLabel}</p>
        <h3 className="mb-4 text-2xl font-bold">{match.id} match details</h3>
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-slate-800 bg-night p-4">
            <div className="flex items-center justify-between text-xs uppercase text-slate-400">
              <span>Teams</span>
              {winner && <span className="font-semibold text-accent">Currently advancing</span>}
            </div>
            <div className="mt-3 space-y-3">
              {renderTeam(match.homeTeam, match.home.source, winner === match.homeTeam)}
              <div className="h-[1px] bg-slate-800" />
              {renderTeam(match.awayTeam, match.away.source, winner === match.awayTeam)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-night p-4">
            <p className="text-xs uppercase text-slate-400">Bracket note</p>
            <p className="mt-2 leading-relaxed text-slate-200">
              Click a team inside the bracket to promote them to the next round. Match-up sources stay visible until both sides
              are locked in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
