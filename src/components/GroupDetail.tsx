import { useEffect, useMemo, useState } from 'react';
import { fixtures } from '../data/groups';
import { getTeamMeta } from '../context/TournamentContext';

interface Props {
  groupId: string;
  onClose: () => void;
}

export default function GroupDetail({ groupId, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const groupFixtures = useMemo(() => fixtures.filter((f) => f.group === groupId), [groupId]);

  useEffect(() => {
    setIsVisible(true);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const { style } = document.body;
    const originalOverflow = style.overflow;
    style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Group ${groupId} fixtures`}
        className={`w-full md:max-w-2xl bg-white text-slate-900 border border-slate-200 rounded-t-2xl md:rounded-2xl shadow-sm max-h-[85vh] overflow-y-auto transform transition-transform duration-200 ease-out ${
          isVisible ? 'translate-y-0 md:scale-100' : 'translate-y-6 md:scale-95'
        }`}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-600">Group {groupId}</p>
            <h3 className="text-xl font-semibold text-slate-900">Fixtures</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-2"
            aria-label="Close fixtures"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="divide-y divide-slate-200">
          {groupFixtures.map((fixture) => {
            const homeMeta = getTeamMeta(fixture.home);
            const awayMeta = getTeamMeta(fixture.away);
            const date = new Date(fixture.date);
            const dateLabel = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              weekday: 'short',
            });
            const timeLabel = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={fixture.id} className="px-5 py-4 flex flex-col gap-2" role="group" aria-label={`${fixture.home} vs ${fixture.away}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {homeMeta.flag} {fixture.home} vs {fixture.away} {awayMeta.flag}
                    </p>
                    <p className="text-xs text-slate-600">{fixture.city}, {fixture.country}</p>
                    <p className="text-xs text-slate-600">{fixture.stadium}</p>
                  </div>
                  <div className="text-right space-y-1 min-w-[120px]">
                    <p className="text-sm font-semibold text-slate-900">{dateLabel}</p>
                    <p className="text-xs text-slate-600">{timeLabel} local</p>
                    <p className="text-[11px] text-slate-500">Group {fixture.group}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
