import { useEffect } from 'react';
import { Fixture } from '../data/groups';
import { getTeamMeta } from '../context/TournamentContext';

interface Props {
  fixture: Fixture;
  onClose: () => void;
}

export default function MatchModal({ fixture, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const homeMeta = getTeamMeta(fixture.home);
  const awayMeta = getTeamMeta(fixture.away);
  const date = new Date(fixture.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="bg-pitch rounded-3xl border border-slate-800 shadow-card w-full max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white rounded-full px-2"
          aria-label="Close"
        >
          ✕
        </button>
        <p className="text-xs uppercase text-slate-400 tracking-[0.3em]">Match preview</p>
        <h3 className="text-2xl font-bold mb-4">{homeMeta.flag} {fixture.home} vs {fixture.away} {awayMeta.flag}</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="bg-night border border-slate-800 rounded-xl p-3">
              <p className="text-slate-400 text-xs">Kick-off (local)</p>
              <p className="font-semibold">{date.toLocaleString()}</p>
            </div>
            <div className="bg-night border border-slate-800 rounded-xl p-3">
              <p className="text-slate-400 text-xs">Venue</p>
              <p className="font-semibold">{fixture.stadium}</p>
              <p className="text-slate-400">{fixture.city}, {fixture.country}</p>
            </div>
          </div>
          <div className="bg-night border border-slate-800 rounded-xl p-3 space-y-2">
            <p className="text-slate-400 text-xs">Match notes</p>
            <p className="leading-relaxed text-slate-200">
              A bite-sized preview lives here. In production we would pull storylines, tactical notes, and live odds from a
              stats provider. Users could also jump into a live commentary view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
