import type { SortOption } from '../../hooks/useMatches';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: SortOption;
  onSortChange: (opt: SortOption) => void;
}

export default function SearchAndSortBar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
}: Props) {
  return (
    <div className="px-4 mt-4 mb-2 flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search by team name..."
        className="w-full md:w-[320px] rounded-lg bg-[#1e253b] border border-white/10 px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow"
      />

      <select
        value={sortOption}
        onChange={e => onSortChange(e.target.value as SortOption)}
        className="rounded-lg bg-[#1e253b] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow"
      >
        <option value="timeAsc">Match Time ↑</option>
        <option value="timeDesc">Match Time ↓</option>
        <option value="alpha">Alphabetical A–Z</option>
        <option value="alphaDesc">Alphabetical Z–A</option>
        <option value="status">Status</option>
      </select>

      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="text-[12px] text-white/60 hover:text-white transition"
        >
          Clear
        </button>
      )}
    </div>
  );
}
