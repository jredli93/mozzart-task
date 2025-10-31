import type { Match } from '../../types/match';
import {
  safeScore,
  formatMatchTime,
  shortLastUpdated,
} from '../../utils/formatters';
import Fav from '../../assets/star.png';

interface MatchCardProps {
  match: Match;
  isNew?: boolean;
  isRemoved?: boolean; // 👈 NEW
  isFavourite: boolean;
  onToggleFavourite: () => void;
}

export default function MatchCard({
  match,
  isNew,
  isRemoved,
  isFavourite,
  onToggleFavourite,
}: MatchCardProps) {
  const isLive = match.status?.toLowerCase().includes('live');

  return (
    <article
      className={[
        'border border-white/10 p-4 rounded-xl bg-[#1e253b] transition-all duration-500',
        isNew ? 'new-match-anim' : '',
        isRemoved ? 'removed-match-anim' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[11px] text-white/60 font-medium">
            {match.league || match.sport || 'Unknown League'}
          </div>
          <div className="text-[10px] text-white/30">{match.venue ?? ''}</div>
        </div>

        <div className="flex items-start gap-2">
          <div className="text-[10px] font-semibold leading-[1.2]">
            {isLive ? (
              <span className="text-green-400">LIVE</span>
            ) : (
              <span className="text-white/40">{match.status}</span>
            )}
          </div>

          {/* favourite toggle */}
          <button
            onClick={onToggleFavourite}
            className={`shrink-0 h-5 w-5 rounded flex items-center justify-center border transition
              ${
                isFavourite
                  ? 'border-yellow bg-yellow/20'
                  : 'border-white/20 hover:border-yellow hover:bg-white/10'
              }`}
            title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <img
              src={Fav}
              alt="fav-toggle"
              className={`h-3.5 w-3.5 object-contain ${
                isFavourite ? '' : 'opacity-50'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-white font-semibold text-sm">
        <span className="truncate">{match.homeTeam}</span>
        <span className="text-lg tabular-nums">
          {safeScore(match.homeScore)}
        </span>
      </div>

      <div className="flex items-center justify-between text-white font-semibold text-sm">
        <span className="truncate">{match.awayTeam}</span>
        <span className="text-lg tabular-nums">
          {safeScore(match.awayScore)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-green-400 font-medium">
          {formatMatchTime(match.status, match.matchTime)}
        </span>
        <span className="text-white/30">
          {shortLastUpdated(match.lastUpdated)}
        </span>
      </div>
    </article>
  );
}
