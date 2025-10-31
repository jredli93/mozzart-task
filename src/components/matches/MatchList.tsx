import type { Match } from '../../types/match';
import LoaderSkeleton from '../common/LoaderSkeleton';
import MatchCard from './MatchCard';

interface Props {
  matches: Match[];
  loading: boolean;
  newMatchIdsRef?: React.MutableRefObject<string[]>;
  removalIds: string[]; // 👈 NEW
  favMatchIds: string[];
  onToggleFavourite: (id: string) => void;
}

export default function MatchList({
  matches,
  loading,
  newMatchIdsRef,
  removalIds,
  favMatchIds,
  onToggleFavourite,
}: Props) {
  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoaderSkeleton key={i} />
        ))}
      </section>
    );
  }

  if (!matches || matches.length === 0) {
    return <div className="text-white/40 text-sm p-4">No matches found.</div>;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {matches.map(m => (
        <MatchCard
          key={m.id}
          match={m}
          isNew={
            Array.isArray(newMatchIdsRef?.current) &&
            newMatchIdsRef!.current.includes(String(m.id))
          }
          isRemoved={removalIds.includes(String(m.id))} // 👈 RED ANIM FLAG
          isFavourite={favMatchIds.includes(String(m.id))}
          onToggleFavourite={() => onToggleFavourite(String(m.id))}
        />
      ))}
    </section>
  );
}
