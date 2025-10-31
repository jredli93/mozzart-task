import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileFilters from './components/layout/MobileFilters';
import SearchAndSortBar from './components/matches/SearchAndSortBar';
import MatchList from './components/matches/MatchList';
import { useMatches } from './hooks/useMatches';

export default function App() {
  const {
    visibleMatches,
    sports,
    leagues,
    loading,
    error,
    selectedSport,
    setSelectedSport,
    selectedLeague,
    setSelectedLeague,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    newMatchIdsRef,

    // 🔴 this is new from the updated hook:
    removalIds,

    // favourites
    favMatchIds,
    toggleFavourite,
  } = useMatches();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden">
      <Header error={error} />

      <MobileFilters
        sports={sports}
        leagues={leagues}
        selectedSport={selectedSport}
        selectedLeague={selectedLeague}
        onSelectSport={(sportKey: string) => {
          setSelectedSport(sportKey);
          setSelectedLeague(null);
        }}
        onSelectLeague={setSelectedLeague}
      />

      <Sidebar
        sports={sports}
        leagues={leagues}
        selectedSport={selectedSport}
        selectedLeague={selectedLeague}
        onSelectSport={(sportKey: string) => {
          setSelectedSport(sportKey);
          setSelectedLeague(null);
        }}
        onSelectLeague={setSelectedLeague}
        favouriteCount={favMatchIds.length}
      />

      <main className="pt-[4rem] md:pt-16 md:ml-[240px] relative z-10">
        <div className="md:hidden h-[160px]" />

        <SearchAndSortBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        <MatchList
          matches={visibleMatches}
          loading={loading}
          newMatchIdsRef={newMatchIdsRef}
          removalIds={removalIds} // 👈 pass the red-flash ids
          favMatchIds={favMatchIds}
          onToggleFavourite={toggleFavourite}
        />
      </main>
    </div>
  );
}
