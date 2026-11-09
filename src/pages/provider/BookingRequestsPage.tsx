import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  PlayCircle,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Booking, BookingStatus } from '../../types.ts';

const TABS = ['All', 'Pending', 'Accepted', 'Confirmed', 'In Progress', 'Completed'];

export const BookingRequestsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rejection modal
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleUpdateStatus = async (
    id: string,
    status: BookingStatus,
    reason?: string,
    msg?: string
  ) => {
    try {
      await api.updateBookingStatus(id, status, reason);
      showToast('success', msg || `Booking status updated to ${status}.`);
      fetchBookings();
    } catch (err: any) {
      showToast('error', err.message || 'Status update failed.');
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingBooking) return;
    setIsSubmitting(true);
    try {
      await api.updateBookingStatus(
        rejectingBooking.id,
        'Rejected',
        rejectReason || 'Provider is unavailable at the requested time.'
      );
      showToast('info', `Booking #${rejectingBooking.booking_number} rejected.`);
      setRejectingBooking(null);
      setRejectReason('');
      fetchBookings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reject booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered =
    selectedTab === 'All'
      ? bookings
      : bookings.filter((b) => b.status === selectedTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Booking Requests & Job Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accept or reject incoming requests, coordinate customer arrivals, and complete services.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {TABS.map((tab) => {
            const count =
              tab === 'All' ? bookings.length : bookings.filter((b) => b.status === tab).length;
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

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading booking records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No bookings in &quot;{selectedTab}&quot;</h3>
            <p className="text-xs text-slate-400 mt-1">No bookings match this filter currently.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row gap-6 justify-between"
              >
                {/* Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/40 border border-blue-900/50 px-2.5 py-0.5 rounded-lg">
                      {b.booking_number}
                    </span>
                    <StatusBadge status={b.status} />
                    <span className="text-[11px] text-slate-500">
                      Requested {new Date(b.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{b.service?.title}</h3>
                    <p className="text-xs text-slate-400">Category: {b.category?.name}</p>
                  </div>

                  {/* Customer Info Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                        Customer Info
                      </span>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        {b.customer?.name}
                      </div>
                      <div className="text-slate-300 mt-0.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {b.customer?.phone || 'No phone recorded'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                        Schedule & Location
                      </span>
                      <div className="text-white flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {b.booking_date} at {b.booking_time}
                      </div>
                      <div className="text-slate-300 mt-0.5 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{b.location_address}, {b.city}</span>
                      </div>
                    </div>
                  </div>

                  {b.requirements && (
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-slate-400">Special Requirements: </strong>
                      {b.requirements}
                    </div>
                  )}

                  {b.cancellation_reason && (
                    <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300">
                      <strong>Cancellation / Rejection Note: </strong>
                      {b.cancellation_reason}
                    </div>
                  )}
                </div>

                {/* Status action controller */}
                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 shrink-0 lg:w-64">
                  <div>
                    <span className="text-xs text-slate-400 block">Service Payout</span>
                    <span className="text-2xl font-bold text-emerald-400">₹{b.service?.price}</span>
                    <div className="text-[11px] mt-1">
                      Payment Status:{' '}
                      <span className="font-semibold text-white">
                        {b.payment?.payment_status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    {/* Pending state -> Accept or Reject */}
                    {b.status === 'Pending' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              b.id,
                              'Accepted',
                              undefined,
                              `Booking #${b.booking_number} accepted!`
                            )
                          }
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => setRejectingBooking(b)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Decline Request</span>
                        </button>
                      </div>
                    )}

                    {/* Accepted / Confirmed state -> Mark In Progress */}
                    {(b.status === 'Accepted' || b.status === 'Confirmed') && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            b.id,
                            'In Progress',
                            undefined,
                            `Technician arrival started! Status updated to In Progress.`
                          )
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-md shadow-violet-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Job (In Progress)</span>
                      </button>
                    )}

                    {/* In Progress state -> Mark as Completed */}
                    {b.status === 'In Progress' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            b.id,
                            'Completed',
                            undefined,
                            `Congratulations! Booking marked as Completed.`
                          )
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Service as Completed</span>
                      </button>
                    )}

                    {/* Completed state indicator */}
                    {b.status === 'Completed' && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Job Completed & Fulfilled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject reason dialog */}
        {rejectingBooking && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setRejectingBooking(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-white mb-1">Decline Booking Request</h3>
              <p className="text-xs text-slate-400 mb-4">
                Decline request #{rejectingBooking.booking_number} from {rejectingBooking.customer?.name}.
              </p>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Reason for Declining (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Schedule already committed, outside travel radius, required tool undergoing repair..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingBooking(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white cursor-pointer"
                  >
                    {isSubmitting ? 'Declining...' : 'Confirm Decline'}
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
