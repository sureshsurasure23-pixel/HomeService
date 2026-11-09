import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  PlayCircle,
  Plus,
  Power,
  RotateCcw,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Booking, ProviderStats } from '../../types.ts';

interface ProviderDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();

  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, bks] = await Promise.all([
        api.getProviderStats(),
        api.getBookings('Pending'),
      ]);
      setStats(s);
      setPendingBookings(bks);
      setIsAvailable(s.metrics.isAvailable);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const res = await api.toggleProviderAvailability();
      setIsAvailable(res.is_available);
      showToast(
        'info',
        `Your status is now ${res.is_available ? 'ONLINE (Accepting Bookings)' : 'OFFLINE (Unavailable)'}`
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to toggle availability.');
    }
  };

  const handleAcceptBooking = async (id: string, bookingNumber: string) => {
    try {
      await api.updateBookingStatus(id, 'Accepted');
      showToast('success', `Booking #${bookingNumber} accepted! Customer notified.`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to accept booking.');
    }
  };

  const handleRejectBooking = async (id: string, bookingNumber: string) => {
    try {
      await api.updateBookingStatus(id, 'Rejected', 'Provider unavailable at this time slot');
      showToast('info', `Booking #${bookingNumber} rejected.`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reject booking.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              Verified Service Provider Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {profile?.business_name || user?.name}&apos;s Workspace
            </h1>
            <p className="text-xs text-slate-300">
              Manage incoming customer requests, service offerings, and track completed job revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Availability Toggle */}
            <button
              onClick={handleToggleAvailability}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>Status: {isAvailable ? 'Online (Accepting)' : 'Offline (Busy)'}</span>
            </button>

            <button
              onClick={() => onNavigate('provider-services')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Pending Requests Alert Banner (if any) */}
        {pendingBookings.length > 0 && (
          <div className="rounded-3xl bg-amber-500/10 border border-amber-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Action Required: {pendingBookings.length} New Booking Request(s)</span>
              </div>
              <button
                onClick={() => onNavigate('provider-requests')}
                className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                View in Requests Page →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingBookings.slice(0, 2).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {b.booking_number}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">₹{b.service?.price}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.service?.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customer: <strong className="text-slate-200">{b.customer?.name}</strong> •{' '}
                      {b.location_address}, {b.city}
                    </p>
                    <div className="text-[11px] text-blue-300 mt-1">
                      Scheduled for: {b.booking_date} at {b.booking_time}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleRejectBooking(b.id, b.booking_number)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAcceptBooking(b.id, b.booking_number)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer shadow-md shadow-emerald-600/30"
                    >
                      Accept Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              ₹{stats?.metrics.totalEarnings || 0}
            </div>
            <span className="text-[10px] text-slate-500">Collected from completed jobs</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Completed Jobs</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.metrics.completedJobs || 0}
            </div>
            <span className="text-[10px] text-slate-500">Total jobs fulfilled</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Pending Requests</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {stats?.metrics.pendingRequests || 0}
            </div>
            <span className="text-[10px] text-slate-500">Awaiting your response</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>My Active Services</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats?.metrics.servicesCount || 0}
            </div>
            <span className="text-[10px] text-slate-500">Listed in directory</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Client Rating</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {stats?.metrics.rating || 5.0} ★
            </div>
            <span className="text-[10px] text-slate-500">
              {stats?.metrics.totalReviews || 0} verified review(s)
            </span>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('provider-requests')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
          >
            <Clock className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white">Booking Requests & Operations</h3>
            <p className="text-xs text-slate-400 mt-1">
              Accept requests, update in-progress status, and mark jobs as completed.
            </p>
          </button>

          <button
            onClick={() => onNavigate('provider-services')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
          >
            <Layers className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white">Service Catalog Management</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create, edit prices, descriptions, and feature checklists for your offerings.
            </p>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
          >
            <UserCheck className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white">Provider Profile & Credentials</h3>
            <p className="text-xs text-slate-400 mt-1">
              Update company bio, license details, city coverage, and hourly rates.
            </p>
          </button>
        </div>

        {/* Recent Operations Activity */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Customer Bookings</h2>
            <button
              onClick={() => onNavigate('provider-requests')}
              className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Manage All Requests →
            </button>
          </div>

          {!stats?.recentBookings || stats.recentBookings.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No bookings received yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Booking #</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Date & Slot</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-blue-400">{b.booking_number}</td>
                      <td className="py-3 font-medium text-white">{b.service?.title}</td>
                      <td className="py-3 text-slate-300">{b.customer?.name}</td>
                      <td className="py-3 text-slate-400">
                        {b.booking_date} {b.booking_time}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 font-semibold text-emerald-400">
                        ₹{b.service?.price || 499}
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
