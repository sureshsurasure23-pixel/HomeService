import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  MapPin,
  Plus,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Booking, Payment } from '../../types.ts';

interface CustomerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenPayment: (booking: Booking) => void;
  onOpenReview: (booking: Booking) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  onOpenPayment,
  onOpenReview,
}) => {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bks, pays] = await Promise.all([api.getBookings(), api.getPayments()]);
        setBookings(bks);
        setPayments(pays);
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSpent = payments
    .filter((p) => p.payment_status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeBookings = bookings.filter((b) =>
    ['Pending', 'Accepted', 'Confirmed', 'In Progress'].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === 'Completed');
  const upcomingBooking = activeBookings[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              Customer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Customer'}!
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {profile?.address ? `${profile.address}, ${profile.city}` : 'No address on profile'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('services')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Service</span>
            </button>
            <button
              onClick={() => onNavigate('customer-bookings')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 transition-colors cursor-pointer"
            >
              My Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Bookings</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{bookings.length}</div>
            <span className="text-[10px] text-slate-500">Lifetime service requests</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Active Orders</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{activeBookings.length}</div>
            <span className="text-[10px] text-slate-500">In progress / Scheduled</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{completedBookings.length}</div>
            <span className="text-[10px] text-slate-500">Fulfilled services</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Spent</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">₹{totalSpent}</div>
            <span className="text-[10px] text-slate-500">Verified payment total</span>
          </div>
        </div>

        {/* Next Upcoming Booking Highlight (if any) */}
        {upcomingBooking && (
          <div className="rounded-3xl bg-blue-950/20 border border-blue-900/50 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-blue-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Next Scheduled Service
              </div>
              <StatusBadge status={upcomingBooking.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {upcomingBooking.service?.title || 'Professional Service'}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {upcomingBooking.booking_date} at {upcomingBooking.booking_time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {upcomingBooking.location_address}, {upcomingBooking.city}
                  </span>
                  {upcomingBooking.provider && (
                    <span className="text-slate-400">
                      Provider:{' '}
                      <strong className="text-white font-medium">
                        {upcomingBooking.provider.business_name}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
                {(!upcomingBooking.payment || upcomingBooking.payment.payment_status === 'Pending') && (
                  <button
                    onClick={() => onOpenPayment(upcomingBooking)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Online (Razorpay)</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate('customer-bookings')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-center cursor-pointer"
                >
                  Manage Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Bookings Table */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Service Requests</h2>
              <p className="text-xs text-slate-400">Track current status and historical jobs</p>
            </div>
            <button
              onClick={() => onNavigate('customer-bookings')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              View All ({bookings.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-800/20 rounded-2xl border border-slate-800">
              <p className="mb-3">You have not booked any services yet.</p>
              <button
                onClick={() => onNavigate('services')}
                className="px-4 py-2 bg-blue-600 rounded-xl text-white font-semibold cursor-pointer"
              >
                Explore Services
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Booking ID</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Provider</th>
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-blue-400">{b.booking_number}</td>
                      <td className="py-3 font-medium text-white max-w-[180px] truncate">
                        {b.service?.title || 'Service'}
                      </td>
                      <td className="py-3 text-slate-300">
                        {b.provider?.business_name || 'Assigned Pro'}
                      </td>
                      <td className="py-3 text-slate-400">
                        {b.booking_date} {b.booking_time}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3">
                        {b.payment?.payment_status === 'Completed' ? (
                          <span className="text-emerald-400 font-semibold">Paid (₹{b.payment.amount})</span>
                        ) : (
                          <span className="text-amber-400 text-[11px]">Unpaid / Due</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === 'Completed' && !b.review && (
                            <button
                              onClick={() => onOpenReview(b)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Star className="w-3 h-3 fill-amber-400" /> Review
                            </button>
                          )}
                          {(!b.payment || b.payment.payment_status === 'Pending') &&
                            !['Cancelled', 'Rejected'].includes(b.status) && (
                              <button
                                onClick={() => onOpenPayment(b)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] cursor-pointer"
                              >
                                Pay
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
