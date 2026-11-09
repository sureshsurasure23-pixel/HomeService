import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { CategoryIcon } from '../../components/CategoryIcon.tsx';
import { SearchHistoryDropdown } from '../../components/SearchHistoryDropdown.tsx';
import { useSearchHistory } from '../../hooks/useSearchHistory.ts';
import { api } from '../../services/api.ts';
import { ProviderProfile, Service, ServiceCategory } from '../../types.ts';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
  onBookService: (service: Service) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onBookService }) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [topProviders, setTopProviders] = useState<ProviderProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { history, addSearch, removeSearch, clearHistory, popularSearches } = useSearchHistory();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, servs, provs] = await Promise.all([
          api.getCategories(),
          api.getServices({ sort_by: 'rating' }),
          api.getProviders(),
        ]);
        setCategories(cats);
        setFeaturedServices(servs.slice(0, 6));
        setTopProviders(provs.slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearch(searchQuery.trim());
    }
    setIsHistoryOpen(false);
    onNavigate('services', {
      search: searchQuery,
      category: selectedCategory,
    });
  };

  const handleSelectHistoryItem = (query: string) => {
    setSearchQuery(query);
    addSearch(query);
    setIsHistoryOpen(false);
    onNavigate('services', {
      search: query,
      category: selectedCategory,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Professionals On-Demand
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Expert Home & Commercial{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Services at Your Doorstep
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Book certified plumbers, deep cleaners, electricians, carpenters, tutors, and beauty specialists with instant scheduling, transparent pricing, and 100% satisfaction guarantee.
            </p>

            {/* Quick Search & Category Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-2.5 sm:p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-950/50 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
            >
              <div className="flex-1 relative">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60 focus-within:border-blue-500 transition-colors">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="What service do you need today? (e.g. AC Repair, Deep Cleaning)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsHistoryOpen(true)}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
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
                  onSelectQuery={handleSelectHistoryItem}
                  onSelectCategory={(cat) => {
                    setIsHistoryOpen(false);
                    onNavigate('services', { category: cat.id });
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

              <div className="sm:w-48 flex items-center px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-200">
                    All Categories
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-200">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick stat highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Background Checked Pros
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                4.9/5 Average Service Rating
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-blue-400" />
                Real-Time Availability
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              Explore Our Expertise
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">All 15 Service Categories</h2>
            <p className="text-sm text-slate-400 mt-1">Browse dedicated categories tailored to your home and office needs.</p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('services', { category: cat.id })}
              className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <CategoryIcon name={cat.icon_name} className="w-5 h-5" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Top Rated
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Popular Verified Services</h2>
              <p className="text-sm text-slate-400 mt-1">Book highly rated services with guaranteed satisfaction.</p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              Browse Full Catalog <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
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
                    {service.category?.name || 'Home Service'}
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

                    <button
                      onClick={() => onBookService(service)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Providers Spotlight */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            Certified Partners
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Meet Our Top Rated Providers</h2>
          <p className="text-sm text-slate-400 mt-2">
            Every provider is insured, identity-verified, and evaluated by real customer reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProviders.map((prov) => (
            <div
              key={prov.id}
              onClick={() => onNavigate('provider-detail', { id: prov.id })}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src={
                    prov.user?.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={prov.business_name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {prov.business_name}
                    </h3>
                    {prov.id_verified && (
                      <span title="Verified Provider">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{prov.user?.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {prov.rating}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{prov.experience_years} yrs exp</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {prov.bio}
              </p>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{prov.city}</span>
                <span className="font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Statistics Banner */}
      <section className="py-14 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">15+</div>
              <div className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">Service Categories</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">1,200+</div>
              <div className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">Verified Bookings</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">99.4%</div>
              <div className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">On-Time Arrival</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">4.9 ★</div>
              <div className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Provider CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950/60 border border-blue-800/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              For Technicians & Service Professionals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Grow Your Business With ProServe
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join hundreds of vetted service providers. Receive high-intent local customer bookings, manage your schedule with double-booking protection, and get paid quickly and reliably.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Register as Provider
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm text-slate-200 transition-colors cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
