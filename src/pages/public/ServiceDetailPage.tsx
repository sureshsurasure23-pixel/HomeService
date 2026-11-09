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
import { Review, Service } from '../../types.ts';

interface ServiceDetailPageProps {
  serviceId: string;
  onNavigate: (view: string, params?: any) => void;
  onBookService: (service: Service) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId,
  onNavigate,
  onBookService,
}) => {
  const [service, setService] = useState<
    (Service & { reviews: Review[]; related: Service[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .getServiceById(serviceId)
      .then(setService)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [serviceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading service details...</span>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <h2 className="text-xl font-bold mb-2">Service Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The requested service could not be located or has been deactivated.</p>
        <button
          onClick={() => onNavigate('services')}
          className="px-4 py-2 bg-blue-600 rounded-xl text-white text-xs font-semibold cursor-pointer"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('services')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Service details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="relative h-72 sm:h-96 w-full">
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300 border border-slate-700">
                  {service.category?.name || 'Home Service'}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{service.title}</h1>
                  <div className="text-3xl font-black text-emerald-400">₹{service.price}</div>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 pb-6 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Estimated Duration: {service.duration_mins} minutes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    100% Quality Guaranteed
                  </span>
                </div>

                <div className="py-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                    Service Description
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>

                {/* Features Checklist */}
                {service.features && service.features.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                      What&apos;s Included in this Service
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {service.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Customer Reviews</h3>
                  <p className="text-xs text-slate-400">
                    {service.reviews?.length || 0} verified customer review(s)
                  </p>
                </div>
              </div>

              {!service.reviews || service.reviews.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-800/30 rounded-2xl border border-slate-800">
                  No reviews yet for this service. Book and be the first to review!
                </div>
              ) : (
                <div className="space-y-4">
                  {service.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              rev.customer?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={rev.customer?.name || 'Customer'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-xs font-semibold text-white">
                              {rev.customer?.name || 'Verified Customer'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
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

          {/* Right Col: Booking Card & Provider Info */}
          <div className="space-y-6">
            {/* Instant Booking Card */}
            <div className="sticky top-20 rounded-3xl border border-blue-500/30 bg-slate-900/90 backdrop-blur-md p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Fixed Service Fee</span>
                  <span className="text-3xl font-extrabold text-white">₹{service.price}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 block mb-1">
                    Available Now
                  </span>
                  <span className="text-[11px] text-slate-400">No hidden charges</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Choose date and convenient time slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Double-booking prevention guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Pay online via Razorpay or Cash on Service</span>
                </div>
              </div>

              <button
                onClick={() => onBookService(service)}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Book This Service Now
              </button>

              <p className="text-[11px] text-slate-400 text-center mt-3">
                Free cancellation up until technician departure.
              </p>

              {/* Provider Snapshot Card */}
              {service.provider && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Assigned Provider
                  </div>
                  <div
                    onClick={() => onNavigate('provider-detail', { id: service.provider?.id })}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <img
                      src={
                        service.provider.user?.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={service.provider.business_name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {service.provider.business_name}
                        </span>
                        {service.provider.id_verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{service.provider.user?.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {service.provider.rating}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{service.provider.experience_years} yrs exp</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
