import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Clock,
  History,
  Layers,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Service, ServiceCategory } from '../types.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface SearchHistoryDropdownProps {
  history: string[];
  popularSearches?: string[];
  query: string;
  isOpen: boolean;
  onSelectQuery: (query: string) => void;
  onSelectCategory?: (category: ServiceCategory) => void;
  onSelectService?: (service: Service) => void;
  onRemoveHistory: (query: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const SearchHistoryDropdown: React.FC<SearchHistoryDropdownProps> = ({
  history,
  popularSearches = [],
  query,
  isOpen,
  onSelectQuery,
  onSelectCategory,
  onSelectService,
  onRemoveHistory,
  onClearHistory,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<{
    categories: ServiceCategory[];
    services: Service[];
  }>({ categories: [], services: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch real-time suggestions as user types
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions({ categories: [], services: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.getSuggestions(trimmed);
        setSuggestions(res);
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const isSearching = query.trim().length > 0;
  const hasHistory = history.length > 0;
  const hasCategorySuggestions = suggestions.categories.length > 0;
  const hasServiceSuggestions = suggestions.services.length > 0;
  const hasAnySuggestions = hasCategorySuggestions || hasServiceSuggestions;

  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-blue-400 font-bold bg-blue-500/10 rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 overflow-hidden p-3 text-left animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto"
    >
      {/* 1. REAL-TIME SUGGESTIONS (WHEN USER TYPES) */}
      {isSearching ? (
        <div className="space-y-3">
          {/* Quick Search Action Row */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              onSelectQuery(query.trim());
            }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 hover:bg-blue-900/50 transition-colors cursor-pointer text-xs font-semibold text-blue-300"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              <span>
                Search catalog for &quot;<strong className="text-white">{query}</strong>&quot;
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </div>

          {isLoading ? (
            <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Finding matching services...</span>
            </div>
          ) : !hasAnySuggestions ? (
            <div className="py-5 text-center text-xs text-slate-400">
              No matching service categories or titles found for &quot;{query}&quot;. Press Enter to search all.
            </div>
          ) : (
            <>
              {/* Matched Categories */}
              {hasCategorySuggestions && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 mb-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Suggested Categories
                  </div>
                  <div className="space-y-1">
                    {suggestions.categories.map((cat) => (
                      <div
                        key={cat.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (onSelectCategory) {
                            onSelectCategory(cat);
                          } else {
                            onSelectQuery(cat.name);
                          }
                        }}
                        className="group flex items-center justify-between p-2.5 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <CategoryIcon name={cat.icon_name} className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {highlightMatch(cat.name, query)}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {cat.description}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                          Category
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Service Titles */}
              {hasServiceSuggestions && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Matching Services
                  </div>
                  <div className="space-y-1">
                    {suggestions.services.map((serv) => (
                      <div
                        key={serv.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (onSelectService) {
                            onSelectService(serv);
                          } else {
                            onSelectQuery(serv.title);
                          }
                        }}
                        className="group flex items-center justify-between p-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <img
                            src={serv.image_url}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-700"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-white group-hover:text-blue-300 truncate transition-colors">
                              {highlightMatch(serv.title, query)}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                              <span>{serv.category?.name}</span>
                              {serv.provider && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{serv.provider.business_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-emerald-400">₹{serv.price}</div>
                          {serv.provider?.rating && (
                            <div className="text-[10px] text-amber-400 flex items-center justify-end gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {serv.provider.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* 2. RECENT SEARCHES & POPULAR SUGGESTIONS (WHEN INPUT IS EMPTY) */
        <div className="space-y-3">
          {hasHistory && (
            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onClearHistory();
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-0.5">
                {history.map((q) => (
                  <div
                    key={q}
                    className="group flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <div
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelectQuery(q);
                      }}
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0 transition-colors" />
                      <span className="truncate group-hover:text-white font-medium">{q}</span>
                    </div>
                    <button
                      type="button"
                      title="Remove from history"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveHistory(q);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {popularSearches && popularSearches.length > 0 && (
            <div className={hasHistory ? 'pt-2 border-t border-slate-800/80' : ''}>
              <div className="flex items-center gap-1.5 px-2 py-1 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {popularSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelectQuery(item);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/70 hover:bg-blue-600/20 hover:text-blue-300 border border-slate-700/60 text-slate-300 transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
