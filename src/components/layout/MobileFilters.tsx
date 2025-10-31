interface Sport {
  key: string;
  label: string;
  badge: string;
  live: boolean;
  icon: string;
}

interface League {
  key: string;
  label: string;
  count: number;
}

interface Props {
  sports: Sport[];
  leagues: League[];
  selectedSport: string | null;
  selectedLeague: string | null;
  onSelectSport: (sport: string) => void;
  onSelectLeague: (league: string | null) => void;
}

export default function MobileFilters({
  sports,
  leagues,
  selectedSport,
  selectedLeague,
  onSelectSport,
  onSelectLeague,
}: Props) {
  return (
    <div className="fixed top-16 left-0 right-0 z-[55] bg-[#1e253b] border-b border-white/10 md:hidden">
      {/* Sports row */}
      <div className="text-[10px] font-semibold text-white/40 uppercase px-4 pt-2 pb-1">
        Sports
      </div>

      <nav
        className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {sports.map(s => (
          <button
            key={s.key}
            onClick={() => {
              onSelectSport(s.key);
              onSelectLeague(null);
            }}
            className={`flex-shrink-0 flex items-center gap-2 rounded-lg border px-3 py-2 min-w-fit
            transition-colors duration-200 active:scale-[0.98]
            ${
              selectedSport === s.key
                ? 'border-yellow bg-gray/10 text-white font-semibold'
                : 'border-white/10 bg-[#2a314b] text-white/80'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="flex items-center justify-center h-8 w-8">
                {s.icon ? (
                  <img
                    src={s.icon}
                    alt={s.label}
                    className="h-5 w-5 object-contain"
                  />
                ) : null}
              </span>
              <span className="text-[12px] capitalize font-semibold leading-4">
                {s.label}
              </span>
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 text-white min-w-[2rem] text-center"
            >
              {s.badge}
            </span>
          </button>
        ))}
      </nav>

      {/* Leagues row */}
      {leagues.length > 0 && (
        <>
          <div className="text-[10px] font-semibold text-white/40 uppercase px-4 pt-1 pb-1 border-t border-white/10">
            Leagues
          </div>
          <nav
            className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {leagues.map(l => (
              <button
                key={l.key}
                onClick={() =>
                  onSelectLeague(l.key === '__ALL__' ? null : l.key)
                }
                className={`flex-shrink-0 rounded-lg border px-3 py-2 text-left min-w-fit
                text-[12px] font-semibold leading-4
                transition-colors duration-200 active:scale-[0.98]
                ${
                  (selectedLeague ?? '__ALL__') === l.key
                    ? 'bg-gray/10 text-white font-semibold'
                    : 'border-white/10 bg-[#2a314b] text-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[140px]">{l.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[2rem] text-center bg-white/10 text-white/60">
                    {l.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
