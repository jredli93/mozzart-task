import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer, elementScroll } from '@tanstack/react-virtual';
import type { Match } from '../../types/match';
import LoaderSkeleton from '../common/LoaderSkeleton';
import MatchCard from './MatchCard';

interface Props {
  matches: Match[];
  loading: boolean;
  newMatchIdsRef?: React.MutableRefObject<string[]>;
  removalIds: string[];
  favMatchKeys: string[];
  onToggleFavourite: (match: Match) => void;
}

/** 1 col on mobile, 3 cols on md+ */
function useResponsiveCols() {
  const [cols, setCols] = useState<number>(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches ? 3 : 1
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setCols(mq.matches ? 3 : 1);
    mq.addEventListener?.('change', onChange);
    mq.addListener?.(onChange);
    onChange();
    return () => {
      mq.removeEventListener?.('change', onChange);
      mq.removeListener?.(onChange);
    };
  }, []);

  return cols;
}

function buildRows<T>(items: T[], cols: number): T[][] {
  if (cols <= 1) return items.map(i => [i]);
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return rows;
}

// Mirror composite key used elsewhere
const compositeKey = (m: Match) =>
  `${String(m.id)}_${m.matchTime ? new Date(m.matchTime).toISOString() : ''}`;

export default function MatchList({
  matches,
  loading,
  newMatchIdsRef,
  removalIds,
  favMatchKeys,
  onToggleFavourite,
}: Props) {
  const cols = useResponsiveCols();
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rows = useMemo(() => buildRows(matches ?? [], cols), [matches, cols]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (cols === 1 ? 172 : 168),
    measureElement: el => el.getBoundingClientRect().height,
    scrollToFn: elementScroll,
    overscan: 6,
  });

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
    <div
      ref={parentRef}
      className="relative h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] overflow-auto p-4"
    >
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const rowItems = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 mt-4 md:grid-cols-3 gap-4">
                {rowItems.map(m => {
                  const key = compositeKey(m);
                  const isFav = favMatchKeys.includes(key);
                  return (
                    <MatchCard
                      key={key}
                      match={m}
                      isNew={
                        Array.isArray(newMatchIdsRef?.current) &&
                        newMatchIdsRef!.current.includes(String(m.id))
                      }
                      isRemoved={removalIds.includes(String(m.id))}
                      isFavourite={isFav}
                      onToggleFavourite={() => onToggleFavourite(m)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
