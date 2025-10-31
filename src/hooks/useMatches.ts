import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Match } from '../types/match';
import { API_URL, FAV_KEY, POLL_INTERVAL } from '../utils/constants';
import { isFootball, pickIconForSport } from '../utils/icons';

export type SortOption =
  | 'timeAsc'
  | 'timeDesc'
  | 'alpha'
  | 'alphaDesc'
  | 'status';

const FAV_MATCHES_KEY = '__FAV_MATCH_IDS__';

export function useMatches() {
  // This is the list you actually render in the UI
  const [matches, setMatches] = useState<Match[]>([]);

  // Filters / UI state
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('timeAsc');

  // Loading / error
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Favourites
  const [favMatchIdsRaw, setFavMatchIdsRaw] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAV_MATCHES_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  // === Animation bookkeeping ===

  // Previous list of IDs from last successful poll
  const prevIdsRef = useRef<string[]>([]);

  // Green "new match" animation: ref is fine (not needed for rerender)
  const newMatchIdsRef = useRef<string[]>([]);

  // Red "about to be removed" animation:
  // this MUST be React state so MatchList/MatchCard re-render with red class
  const [removalIds, setRemovalIds] = useState<string[]>([]);

  // Keep last good data if API returns empty glitch
  const lastGoodRef = useRef<Match[]>([]);

  // Polling interval ref
  const pollRef = useRef<number | null>(null);

  // Persist favourites
  useEffect(() => {
    localStorage.setItem(FAV_MATCHES_KEY, JSON.stringify(favMatchIdsRaw));
  }, [favMatchIdsRaw]);

  // Toggle favourite
  const toggleFavourite = useCallback((matchId: string | number) => {
    const idStr = String(matchId);
    setFavMatchIdsRaw(prev =>
      prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]
    );
  }, []);

  // Polling logic
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          username: 'redlijovan@gmail.com',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let data = await res.json();

      // normalize backend response shape
      if (Array.isArray(data.matches)) data = data.matches;
      else if (Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data)) data = [];

      const incomingMatches: Match[] = data;

      if (incomingMatches.length > 0) {
        const incomingIds = incomingMatches.map(m => String(m.id));
        const prevIds = prevIdsRef.current;

        // Detect new matches
        const newOnes = incomingIds.filter(id => !prevIds.includes(id));

        // Detect removed matches
        const goneOnes = prevIds.filter(id => !incomingIds.includes(id));

        // Snapshot for next diff
        prevIdsRef.current = incomingIds;

        // Handle NEW matches (green flash)
        if (newOnes.length > 0) {
          newMatchIdsRef.current = [...newMatchIdsRef.current, ...newOnes];
          setTimeout(() => {
            newMatchIdsRef.current = newMatchIdsRef.current.filter(
              id => !newOnes.includes(id)
            );
          }, 1000);
        }

        // Handle REMOVED matches (red flash)
        if (goneOnes.length > 0) {
          // 1. Mark these IDs as "removal in progress"
          setRemovalIds(goneOnes);

          // 2. Keep showing the OLD matches array for 1s
          //    so those soon-to-be-removed cards are still rendered.
          //    They will get the red CSS class because removalIds changed.

          // 3. After 1s, actually replace matches with the incoming list,
          //    and clear the red state.
          setTimeout(() => {
            setRemovalIds([]);
            setMatches(incomingMatches);
          }, 1000);
        } else {
          // No removals → we can immediately sync matches
          setMatches(incomingMatches);
        }

        // Save last good for fallback
        lastGoodRef.current = incomingMatches;
        setError(null);

        // Pick default sport on first load
        if (!selectedSport && incomingMatches.length > 0) {
          const firstFootball = incomingMatches.find(m => isFootball(m.sport));
          setSelectedSport(
            firstFootball
              ? firstFootball.sport
              : incomingMatches[0]?.sport ?? null
          );
        }
      } else {
        // API gave empty -> fallback to last good data
        setMatches(lastGoodRef.current);
        setError('Source returned empty data');
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
      setLoading(false);
    }
  }, [selectedSport]);

  // Start/stop polling on mount/unmount
  useEffect(() => {
    fetchMatches();
    pollRef.current = window.setInterval(fetchMatches, POLL_INTERVAL);

    return () => {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [fetchMatches]);

  // Build a set of live IDs for pruning favourites
  const liveIdSet = useMemo(() => {
    return new Set(matches.map(m => String(m.id)));
  }, [matches]);

  // Favourites that are still visible in feed
  const favMatchIds = useMemo(() => {
    return favMatchIdsRaw.filter(id => liveIdSet.has(id));
  }, [favMatchIdsRaw, liveIdSet]);

  // Prune dead favourites so the sidebar count stays accurate
  useEffect(() => {
    if (favMatchIds.length !== favMatchIdsRaw.length) {
      setFavMatchIdsRaw(favMatchIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favMatchIds]);

  // Sidebar data: sports
  const sports = useMemo(() => {
    const acc: {
      key: string;
      label: string;
      total: number;
      live: number;
      icon: string;
    }[] = [];

    for (const match of matches) {
      const sportKey = match.sport;
      const found = acc.find(s => s.key === sportKey);
      if (found) {
        found.total += 1;
        if (match.status?.toLowerCase().includes('live')) {
          found.live += 1;
        }
      } else {
        acc.push({
          key: sportKey,
          label: sportKey,
          total: 1,
          live: match.status?.toLowerCase().includes('live') ? 1 : 0,
          icon: pickIconForSport(sportKey),
        });
      }
    }

    return acc.map(s => ({
      key: s.key,
      label: s.label,
      badge: String(s.total),
      live: s.live > 0,
      icon: s.icon,
    }));
  }, [matches]);

  // Sidebar data: leagues
  const leagues = useMemo(() => {
    if (!selectedSport || selectedSport === FAV_KEY) return [];

    const filtered = matches.filter(m => m.sport === selectedSport);

    const leagueStats: { key: string; label: string; count: number }[] = [];
    for (const match of filtered) {
      const key = match.league;
      const found = leagueStats.find(l => l.key === key);
      if (found) {
        found.count += 1;
      } else {
        leagueStats.push({
          key,
          label: key,
          count: 1,
        });
      }
    }

    return [
      { key: '__ALL__', label: 'All', count: filtered.length },
      ...leagueStats,
    ];
  }, [matches, selectedSport]);

  // UI-visible list (filters + search + sort)
  const visibleMatches = useMemo(() => {
    let base = matches;

    // "Favourites" pseudo-sport
    if (selectedSport === FAV_KEY) {
      base = base.filter(m => favMatchIds.includes(String(m.id)));
    } else {
      // filter by sport
      if (selectedSport) {
        base = base.filter(m => m.sport === selectedSport);
      }

      // filter by league
      if (selectedLeague && selectedLeague !== '__ALL__') {
        base = base.filter(m => m.league === selectedLeague);
      }
    }

    // search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter(
        m =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          (m.league ?? '').toLowerCase().includes(q)
      );
    }

    // apply sort
    const sorted = [...base];
    switch (sortOption) {
      case 'timeAsc':
        sorted.sort(
          (a, b) =>
            new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime()
        );
        break;
      case 'timeDesc':
        sorted.sort(
          (a, b) =>
            new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime()
        );
        break;
      case 'alpha':
        sorted.sort((a, b) => a.homeTeam.localeCompare(b.homeTeam));
        break;
      case 'alphaDesc':
        sorted.sort((a, b) => b.homeTeam.localeCompare(a.homeTeam));
        break;
      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    return sorted;
  }, [
    matches,
    favMatchIds,
    selectedSport,
    selectedLeague,
    searchQuery,
    sortOption,
  ]);

  return {
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

    // animations/indicators
    newMatchIdsRef, // green flash list (ref)
    removalIds, // red flash list (state)

    // favourites
    favMatchIds,
    toggleFavourite,
  };
}
