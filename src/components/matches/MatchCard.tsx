import type { Match } from '../../types/match';
import {
  formatBottomLeft,
  statusLabel,
} from '../../utils/formatters';
import StarFull from '../../assets/star-full.png';
import StarEmpty from '../../assets/star-empty.png';

interface MatchCardProps {
  match: Match;
  isNew?: boolean;
  isRemoved?: boolean;
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
  // const isLive = match.status?.toLowerCase().includes('live');

  const statusText = statusLabel(match.status, match.matchTime);
  const statusClass =
    statusText === 'LIVE'
      ? 'text-green-400'
      : statusText === 'UPCOMING'
      ? 'text-yellow-400'
      : 'text-white/50';

  return (
    <article
      className={[
        'border border-white/10 p-4 bg-[#1e253b] transition-all duration-500',
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
        
          {/* favourite toggle with two images */}
          <button
            onClick={onToggleFavourite}
            className="shrink-0 h-5 w-5 flex items-center justify-center transition"
            title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <img
              src={isFavourite ? StarFull : StarEmpty}
              alt="favourite"
              className="h-3.5 w-3.5 object-contain"
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-white font-semibold text-sm">
        <span className="truncate">{match.homeTeam}</span>
        <span className="text-lg tabular-nums">
          {match.homeScore}
        </span>
      </div>

      <div className="flex items-center justify-between text-white font-semibold text-sm">
        <span className="truncate">{match.awayTeam}</span>
        <span className="text-lg tabular-nums">
          {match.awayScore}
        </span>
      </div>

      {/* Bottom row: LEFT full date / minutes / '-' ; RIGHT status text */}
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-white/80 font-medium">
          {formatBottomLeft(match.status, match.matchTime)}
        </span>
        <span className={statusClass}>{statusText}</span>
      </div>
    </article>
  );
}
