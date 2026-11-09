import { useEffect, useState } from 'react';

const STORAGE_KEY = 'proserve_search_history';
const MAX_HISTORY = 8;

export const POPULAR_SEARCHES = [
  'Deep Cleaning',
  'Emergency Plumbing',
  'AC Repair & Servicing',
  'Smart Switch Wiring',
  'Sofa & Carpet Cleaning',
  'Lawn Mowing & Gardening',
];

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse search history from localStorage', e);
    }
  }, []);

  const addSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      // Remove existing occurrence so it moves to top
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save search history', e);
      }
      return updated;
    });
  };

  const removeSearch = (queryToRemove: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== queryToRemove);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to remove search history item', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear search history', e);
    }
  };

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
    popularSearches: POPULAR_SEARCHES,
  };
}
