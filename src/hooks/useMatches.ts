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

// 👇 Stable alphabetical comparator (A–Z) with sensible tie-breakers
function cmpAlphaAsc(a: Match, b: Match) {
  let cmp = a.homeTeam.localeCompare(b.homeTeam);
  if (cmp) return cmp;
  cmp = a.awayTeam.localeCompare(b.awayTeam);
  if (cmp) return cmp;
  cmp = (a.league ?? '').localeCompare(b.league ?? '');
  if (cmp) return cmp;
  return String(a.id).localeCompare(String(b.id));
}

// 👇 Helper: build composite key (id + matchTime)
function compositeKey(m: Match | { id: string | number; matchTime?: string }) {
  const id = String(m.id);
  const t = m.matchTime ? new Date(m.matchTime).toISOString() : '';
  return `${id}_${t}`;
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('alpha');
  const [loading, setLoading] = useState(true);

  // Favourites stored as composite keys
  const [favMatchKeysRaw, setFavMatchKeysRaw] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAV_MATCHES_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const prevIdsRef = useRef<string[]>([]);
  const newMatchIdsRef = useRef<string[]>([]);
  const [removalIds, setRemovalIds] = useState<string[]>([]);
  const lastGoodRef = useRef<Match[]>([]);
  const pollRef = useRef<number | null>(null);

  // Persist favourites
  useEffect(() => {
    localStorage.setItem(FAV_MATCHES_KEY, JSON.stringify(favMatchKeysRaw));
  }, [favMatchKeysRaw]);

  // --- Toggle favourite ---
  const toggleFavourite = useCallback((match: Match) => {
    const key = compositeKey(match);
    setFavMatchKeysRaw(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  // --- Polling logic ---
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
      if (Array.isArray(data.matches)) data = data.matches;
      else if (Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data)) data = [];

      const incomingMatches: Match[] = data;

      if (incomingMatches.length > 0) {
        const incomingIds = incomingMatches.map(m => String(m.id));
        const prevIds = prevIdsRef.current;
        const newOnes = incomingIds.filter(id => !prevIds.includes(id));
        const goneOnes = prevIds.filter(id => !incomingIds.includes(id));
        prevIdsRef.current = incomingIds;

        // NEW (green)
        if (newOnes.length > 0) {
          newMatchIdsRef.current = [...newMatchIdsRef.current, ...newOnes];
          setTimeout(() => {
            newMatchIdsRef.current = newMatchIdsRef.current.filter(
              id => !newOnes.includes(id)
            );
          }, 1000);
        }

        // REMOVED (red)
        if (goneOnes.length > 0) {
          setRemovalIds(goneOnes);
          setTimeout(() => {
            setRemovalIds([]);
            setMatches([...incomingMatches].sort(cmpAlphaAsc));
          }, 1000);
        } else {
          setMatches([...incomingMatches].sort(cmpAlphaAsc));
        }

        lastGoodRef.current = incomingMatches;
        
        if (!selectedSport && incomingMatches.length > 0) {
          const firstFootball = incomingMatches.find(m => isFootball(m.sport));
          setSelectedSport(
            firstFootball
              ? firstFootball.sport
              : incomingMatches[0]?.sport ?? null
          );
        }
      } else {
        setMatches(
          lastGoodRef.current.length
            ? [...lastGoodRef.current].sort(cmpAlphaAsc)
            : []
        );
      }

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  }, [selectedSport]);

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

  // Build live key set for visible matches
  const liveKeySet = useMemo(() => {
    return new Set(matches.map(m => compositeKey(m)));
  }, [matches]);

  // Filter favourites that are still visible
  const favMatchKeys = useMemo(() => {
    return favMatchKeysRaw.filter(k => liveKeySet.has(k));
  }, [favMatchKeysRaw, liveKeySet]);

  // Prune old favourites
  useEffect(() => {
    if (favMatchKeys.length !== favMatchKeysRaw.length) {
      setFavMatchKeysRaw(favMatchKeys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favMatchKeys]);

  // --- SPORTS (football first) ---
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
        if (match.status?.toLowerCase().includes('live')) found.live += 1;
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

    const list = acc.map(s => ({
      key: s.key,
      label: s.label,
      badge: String(s.total),
      live: s.live > 0,
      icon: s.icon,
    }));

    const footballIndex = list.findIndex(s =>
      s.key.toLowerCase().includes('foot')
    );
    if (footballIndex > 0) {
      const [footballItem] = list.splice(footballIndex, 1);
      list.unshift(footballItem);
    }

    return list;
  }, [matches]);

  // --- LEAGUES (A–Z, "All" first) ---
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

    leagueStats.sort((a, b) => a.label.localeCompare(b.label));

    return [
      { key: '__ALL__', label: 'All', count: filtered.length },
      ...leagueStats,
    ];
  }, [matches, selectedSport]);

  // --- VISIBLE MATCHES ---
  const visibleMatches = useMemo(() => {
    let base = matches;

    if (selectedSport === FAV_KEY) {
      base = base.filter(m => favMatchKeys.includes(compositeKey(m)));
    } else {
      if (selectedSport) base = base.filter(m => m.sport === selectedSport);
      if (selectedLeague && selectedLeague !== '__ALL__') {
        base = base.filter(m => m.league === selectedLeague);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter(
        m =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          (m.league ?? '').toLowerCase().includes(q)
      );
    }

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
        sorted.sort(cmpAlphaAsc);
        break;
      case 'alphaDesc':
        sorted.sort((a, b) => -cmpAlphaAsc(a, b));
        break;
      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    return sorted;
  }, [
    matches,
    favMatchKeys,
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
    selectedSport,
    setSelectedSport,
    selectedLeague,
    setSelectedLeague,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    newMatchIdsRef,
    removalIds,
    favMatchKeys,
    toggleFavourite,
  };
}
