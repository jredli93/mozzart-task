import { FAV_KEY } from '../../utils/constants';
import Fav from '../../assets/star.png';

type Sport = {
  key: string;
  label: string;
  badge: string;
  live: boolean;
  icon: string;
};

type League = {
  key: string;
  label: string;
  count: number;
};

interface SidebarProps {
  sports: Sport[];
  leagues: League[];
  selectedSport: string | null;
  selectedLeague: string | null;
  onSelectSport: (sport: string) => void;
  onSelectLeague: (league: string | null) => void;

  // ⬇ make sure this exists
  favouriteCount: number;
}

export default function Sidebar({
  sports,
  leagues,
  selectedSport,
  selectedLeague,
  onSelectSport,
  onSelectLeague,
  favouriteCount,
}: SidebarProps) {
  return (
    <aside className="hidden md:flex fixed top-16 bottom-0 left-0 w-[240px] bg-[#1e253b] border-r border-white/10 flex-col py-4 pr-4 z-40">
      <div className="text-[10px] pl-4 font-semibold text-white/40 uppercase mb-4">
        Sports
      </div>

      <nav className="space-y-4 text-sm pr-2 overflow-y-auto">
        {/* real sports */}
        {sports
          .filter(s => s.key !== FAV_KEY)
          .map((s, idx) => {
            const isActive = selectedSport === s.key;
            return (
              <div key={s.key + idx} className="w-full flex flex-col gap-2">
                <button
                  onClick={() => {
                    onSelectSport(s.key);
                    onSelectLeague(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left  active:scale-[0.99]
                    transition-[border-color,background-color,color] duration-300 ease-in-out border-l-4
                    ${
                      isActive
                        ? 'border-yellow text-white font-semibold bg-[#2a314b]'
                        : 'border-transparent hover:border-yellow text-white/80'
                    }`}
                  style={{
                    borderLeftColor: isActive
                      ? 'rgb(250 204 21)'
                      : 'transparent',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-9 w-9">
                      {s.icon && (
                        <img
                          src={s.icon}
                          alt={s.label}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                    </span>
                    <span className="text-[13px] capitalize font-semibold">{s.label}</span>
                  </span>

                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5  min-w-[2rem] text-center"
                  >
                    {s.badge}
                  </span>
                </button>

                {isActive && leagues.length > 0 && (
                  <div className="ml-3 pl-3 border-l border-white/10 flex flex-col gap-1">
                    {leagues.map(l => (
                      <button
                        key={l.key}
                        onClick={() =>
                          onSelectLeague(l.key === '__ALL__' ? null : l.key)
                        }
                        className={`flex items-center justify-between text-left  px-2 py-1 text-[12px]
                          ${
                            (selectedLeague ?? '__ALL__') === l.key
                              ? 'bg-gray/50 text-white font-semibold'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <span className="truncate pr-2">{l.label}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5  min-w-[2rem] text-center  text-white">
                          {l.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* Favourite row */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              onSelectSport(FAV_KEY);
              onSelectLeague(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left  active:scale-[0.99]
              transition-[border-color,background-color,color] duration-300 ease-in-out border-l-4
              ${
                selectedSport === FAV_KEY
                  ? 'border-yellow text-white font-semibold bg-[#2a314b]'
                  : 'border-transparent hover:border-yellow text-white/80'
              }`}
            style={{
              borderLeftColor:
                selectedSport === FAV_KEY ? 'rgb(250 204 21)' : 'transparent',
            }}
          >
            <span className="flex items-center gap-2">
              <span className="flex items-center justify-center h-9 w-9">
                <img
                  src={Fav}
                  alt="Favourite"
                  className="h-6 w-6 object-contain"
                />
              </span>
              <span className="text-[13px] font-semibold">Favourite</span>
            </span>

            {/* 🔥 THIS BADGE MUST USE favouriteCount */}
            <span className="text-[10px] font-bold px-1.5 py-0.5  min-w-[2rem] text-center  text-white">
              {favouriteCount}
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
