import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { ProviderProfile, Review, Service } from '../../types.ts';

interface ProviderDetailPageProps {
  providerId: string;
  onNavigate: (view: string, params?: any) => void;
  onBookService: (service: Service) => void;
}

export const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({
  providerId,
  onNavigate,
  onBookService,
}) => {
  const [provider, setProvider] = useState<
    (ProviderProfile & { services: Service[]; reviews: Review[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .getProviderById(providerId)
      .then(setProvider)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading provider profile...</span>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <h2 className="text-xl font-bold mb-2">Provider Not Found</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-blue-600 rounded-xl text-white text-xs font-semibold cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('services')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        {/* Profile Header Banner */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img
              src={
                provider.user?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              }
              alt={provider.business_name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-500/30 shadow-lg"
            />

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {provider.business_name}
                </h1>
                {provider.id_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Provider
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    provider.is_available
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-slate-400 bg-slate-800 border-slate-700'
                  }`}
                >
                  {provider.is_available ? 'Available for Bookings' : 'Currently Unavailable'}
                </span>
              </div>

              <div className="text-sm text-slate-300 font-medium">{provider.user?.name}</div>

              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {provider.rating} ({provider.total_reviews} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {provider.experience_years} Years Experience
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  {provider.city} {provider.address ? `• ${provider.address}` : ''}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  Standard Base: ₹{provider.hourly_rate}/hr
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Us</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-4xl">
              {provider.bio}
            </p>
          </div>
        </div>

        {/* Services Offered by this Provider */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Services Offered ({provider.services?.length || 0})</h2>
            <p className="text-xs text-slate-400">Select any service to book directly with this provider.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {provider.services?.map((service) => (
              <div
                key={service.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-5 flex flex-col justify-between group hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      {service.duration_mins} mins
                    </span>
                    <span className="text-xl font-bold text-emerald-400">₹{service.price}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{service.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => onNavigate('service-detail', { id: service.id })}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onBookService(service)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 text-center"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Reviews */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Customer Reviews</h2>
          {!provider.reviews || provider.reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No reviews recorded yet for this provider.</p>
          ) : (
            <div className="space-y-4">
              {provider.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{rev.customer?.name}</span>
                      <span className="text-[10px] text-slate-400">
                        • {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
