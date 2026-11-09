import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  MapPin,
  RotateCcw,
  Star,
  X,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Booking, BookingStatus } from '../../types.ts';

interface MyBookingsPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenPayment: (booking: Booking) => void;
  onOpenReview: (booking: Booking) => void;
}

const STATUS_TABS = [
  'All',
  'Pending',
  'Accepted',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
];

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  onNavigate,
  onOpenPayment,
  onOpenReview,
}) => {
  const { showToast } = useNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;
    setIsSubmittingCancel(true);

    try {
      await api.updateBookingStatus(
        cancellingBooking.id,
        'Cancelled',
        cancelReason || 'Customer requested cancellation'
      );
      showToast('success', `Booking #${cancellingBooking.booking_number} has been cancelled.`);
      setCancellingBooking(null);
      setCancelReason('');
      fetchBookings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to cancel booking.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const filteredBookings =
    selectedTab === 'All'
      ? bookings
      : bookings.filter((b) => b.status === selectedTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Service Bookings</h1>
            <p className="text-xs text-slate-400 mt-1">
              Track appointments, review completion status, manage payments, and submit reviews.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/30 cursor-pointer"
          >
            + Book Another Service
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === 'All'
                ? bookings.length
                : bookings.filter((b) => b.status === tab).length;
            const isSelected = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No bookings in &quot;{selectedTab}&quot;</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You do not have any service requests currently matching this filter status.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row gap-6 justify-between"
              >
                {/* Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/40 border border-blue-900/50 px-2.5 py-0.5 rounded-lg">
                      {b.booking_number}
                    </span>
                    <StatusBadge status={b.status} />
                    <span className="text-[11px] text-slate-500">
                      Requested {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {b.service?.title || 'Professional Service'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Category: {b.category?.name || 'Home Service'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{b.booking_date} at {b.booking_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate">{b.location_address}, {b.city}</span>
                    </div>
                  </div>

                  {b.requirements && (
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80 text-xs text-slate-400">
                      <span className="text-slate-300 font-medium">Requirements: </span>
                      {b.requirements}
                    </div>
                  )}

                  {b.cancellation_reason && (
                    <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300">
                      <span className="font-semibold">Cancellation Note: </span>
                      {b.cancellation_reason}
                    </div>
                  )}

                  {/* Provider Info */}
                  {b.provider && (
                    <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-400">
                      <span>Provider: </span>
                      <strong className="text-white">{b.provider.business_name}</strong>
                      <span>•</span>
                      <span>{b.provider.user?.phone || 'Contact via app'}</span>
                    </div>
                  )}
                </div>

                {/* Right side: Pricing & Actions */}
                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0 md:w-60">
                  <div>
                    <div className="text-xs text-slate-400">Total Price</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      ₹{b.service?.price || 499}
                    </div>
                    <div className="text-[11px] mt-1">
                      {b.payment?.payment_status === 'Completed' ? (
                        <span className="text-emerald-400 font-medium">✓ Paid via {b.payment.payment_method}</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Payment Pending</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mt-4">
                    {/* Pay button */}
                    {(!b.payment || b.payment.payment_status === 'Pending') &&
                      !['Cancelled', 'Rejected'].includes(b.status) && (
                        <button
                          onClick={() => onOpenPayment(b)}
                          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now / Checkout</span>
                        </button>
                      )}

                    {/* Review Button */}
                    {b.status === 'Completed' && !b.review && (
                      <button
                        onClick={() => onOpenReview(b)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Write Review</span>
                      </button>
                    )}

                    {/* Already reviewed */}
                    {b.review && (
                      <div className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2 rounded-xl text-center">
                        Reviewed ★ {b.review.rating}/5
                      </div>
                    )}

                    {/* Cancel booking if in eligible state */}
                    {['Pending', 'Accepted', 'Confirmed'].includes(b.status) && (
                      <button
                        onClick={() => setCancellingBooking(b)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/60 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingBooking && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setCancellingBooking(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-white mb-1">Cancel Service Booking?</h3>
              <p className="text-xs text-slate-400 mb-4">
                Are you sure you want to cancel booking #{cancellingBooking.booking_number} ({cancellingBooking.service?.title})?
              </p>

              <form onSubmit={handleCancelBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Reason for Cancellation (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Schedule conflict, problem resolved, found alternate..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCancellingBooking(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCancel}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white cursor-pointer"
                  >
                    {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
