import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { CategoryIcon } from '../../components/CategoryIcon.tsx';
import { SearchHistoryDropdown } from '../../components/SearchHistoryDropdown.tsx';
import { useSearchHistory } from '../../hooks/useSearchHistory.ts';
import { api } from '../../services/api.ts';
import { Service, ServiceCategory } from '../../types.ts';

interface ServicesPageProps {
  initialCategoryId?: string;
  initialSearch?: string;
  onNavigate: (view: string, params?: any) => void;
  onBookService: (service: Service) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  initialCategoryId,
  initialSearch,
  onNavigate,
  onBookService,
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const { history, addSearch, removeSearch, clearHistory, popularSearches } = useSearchHistory();

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    api
      .getServices({
        category_id: selectedCategory || undefined,
        search: searchQuery || undefined,
        max_price: maxPrice,
        sort_by: sortBy,
      })
      .then((data) => {
        setServices(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Marketplace Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Find Professional Services</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Browse verified services across cleaning, plumbing, electrical, carpentry, beauty, tech repair, and more.
          </p>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <CategoryIcon name={cat.icon_name} className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60 focus-within:border-blue-500 transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by title, keyword, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsHistoryOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    addSearch(searchQuery.trim());
                    setIsHistoryOpen(false);
                  }
                }}
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <SearchHistoryDropdown
              history={history}
              popularSearches={popularSearches}
              query={searchQuery}
              isOpen={isHistoryOpen}
              onSelectQuery={(query) => {
                setSearchQuery(query);
                addSearch(query);
                setIsHistoryOpen(false);
              }}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
                setIsHistoryOpen(false);
              }}
              onSelectService={(serv) => {
                setIsHistoryOpen(false);
                onNavigate('service-detail', { id: serv.id });
              }}
              onRemoveHistory={removeSearch}
              onClearHistory={clearHistory}
              onClose={() => setIsHistoryOpen(false)}
            />
          </div>

          <div className="w-full md:w-auto flex flex-wrap items-center gap-4 text-xs">
            {/* Price Filter Slider */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Max Price:</span>
              <span className="font-semibold text-white w-16">₹{maxPrice}</span>
              <input
                type="range"
                min="300"
                max="3000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated Providers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading available services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
            <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No services found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find any services matching your search or filters. Try adjusting your search query or reset category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setMaxPrice(3000);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-blue-300 border border-slate-700">
                    {service.category?.name || 'Service'}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-emerald-400 border border-slate-700">
                    ₹{service.price}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => onNavigate('service-detail', { id: service.id })}
                      className="text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features list */}
                    {service.features && service.features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {service.features.slice(0, 2).map((f, idx) => (
                          <li key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    {service.provider && (
                      <div
                        onClick={() => onNavigate('provider-detail', { id: service.provider?.id })}
                        className="flex items-center gap-2 cursor-pointer group/prov"
                      >
                        <img
                          src={
                            service.provider.user?.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={service.provider.business_name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-200 group-hover/prov:text-blue-300 block truncate max-w-[110px]">
                            {service.provider.business_name}
                          </span>
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {service.provider.rating} ({service.provider.total_reviews})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('service-detail', { id: service.id })}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-300 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onBookService(service)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
