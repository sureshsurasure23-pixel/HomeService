import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  FileText,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { CategoryIcon } from '../../components/CategoryIcon.tsx';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import {
  AdminStats,
  Booking,
  BookingStatus,
  Payment,
  ProviderProfile,
  Service,
  ServiceCategory,
  User,
} from '../../types.ts';

const ADMIN_TABS = [
  'Overview & Stats',
  'Customers',
  'Service Providers',
  'Service Categories',
  'All Services',
  'All Bookings',
  'Payment Audits',
];

export const AdminDashboard: React.FC = () => {
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<string>('Overview & Stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search filter inside tables
  const [tableSearch, setTableSearch] = useState<string>('');

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Sparkles');
  const [catImage, setCatImage] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [st, u, p, c, s, b, pay] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getProviders({ all: true }),
        api.getCategories(true),
        api.getServices(),
        api.getBookings(),
        api.getPayments(),
      ]);
      setStats(st);
      setUsers(u);
      setProviders(p);
      setCategories(c);
      setServices(s);
      setBookings(b);
      setPayments(pay);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Customer status toggle
  const handleToggleUserStatus = async (userObj: User) => {
    const newStatus = !userObj.is_active;
    try {
      await api.updateUserStatus(userObj.id, newStatus);
      showToast('success', `User account ${newStatus ? 'activated' : 'suspended'}.`);
      loadAllAdminData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update user status.');
    }
  };

  // Provider approval toggle
  const handleToggleProviderApproval = async (prov: ProviderProfile) => {
    const newApproval = !prov.is_approved;
    try {
      await api.updateProviderStatus(prov.id, newApproval);
      showToast('success', `Provider profile ${newApproval ? 'approved & verified' : 'suspended'}.`);
      loadAllAdminData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update provider status.');
    }
  };

  // Category modal submit
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCat(true);

    try {
      const payload = {
        name: catName,
        description: catDesc,
        icon_name: catIcon,
        image_url:
          catImage ||
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      };

      if (editingCat) {
        await api.updateCategory(editingCat.id, payload);
        showToast('success', 'Category updated successfully.');
      } else {
        await api.createCategory(payload);
        showToast('success', 'New service category established.');
      }

      setIsCatModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save category.');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: ServiceCategory) => {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        await api.deleteCategory(cat.id);
        showToast('success', `Category "${cat.name}" deleted.`);
        loadAllAdminData();
      } catch (err: any) {
        showToast('error', err.message || 'Failed to delete category.');
      }
    }
  };

  const handleAdminBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      showToast('success', `Booking status manually updated to ${status}.`);
      loadAllAdminData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update booking status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-blue-950/60 border border-purple-900/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform Administration Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Executive Platform Controls
            </h1>
            <p className="text-xs text-slate-300">
              Manage customers, verify service providers, configure categories, audit bookings & payments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllAdminData}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {ADMIN_TABS.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setTableSearch('');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'Overview & Stats' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Metric KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block mb-1">Customers</span>
                <div className="text-2xl font-bold text-white">
                  {stats?.metrics.totalCustomers || 0}
                </div>
                <span className="text-[10px] text-slate-500">Registered users</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block mb-1">Providers</span>
                <div className="text-2xl font-bold text-blue-400">
                  {stats?.metrics.totalProviders || 0}
                </div>
                <span className="text-[10px] text-slate-500">Service professionals</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block mb-1">Active Services</span>
                <div className="text-2xl font-bold text-purple-400">
                  {stats?.metrics.totalServices || 0}
                </div>
                <span className="text-[10px] text-slate-500">Catalog items</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block mb-1">Total Bookings</span>
                <div className="text-2xl font-bold text-indigo-400">
                  {stats?.metrics.totalBookings || 0}
                </div>
                <span className="text-[10px] text-slate-500">Lifetime volume</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block mb-1">Platform Revenue</span>
                <div className="text-2xl font-bold text-emerald-400">
                  ₹{stats?.metrics.totalRevenue || 0}
                </div>
                <span className="text-[10px] text-slate-500">Fulfilled payments</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-xs block mb-1">Categories</span>
                <div className="text-2xl font-bold text-amber-400">
                  {stats?.metrics.totalCategories || 0}
                </div>
                <span className="text-[10px] text-slate-500">Specializations</span>
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Booking Status Distribution
                </h3>
                <div className="space-y-3">
                  {stats?.statusCounts &&
                    Object.entries(stats.statusCounts).map(([st, cnt]) => {
                      const total = stats.metrics.totalBookings || 1;
                      const pct = Math.round((cnt / total) * 100);
                      return (
                        <div key={st} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-300">{st}</span>
                            <span className="text-slate-400 font-mono">
                              {cnt} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Top Category Distribution
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {stats?.categoryStats.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>{cat.servicesCount} services</span>
                        <span className="text-blue-400 font-semibold">{cat.bookingsCount} bookings</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Bookings Activity */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Latest Platform Activity
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Booking ID</th>
                      <th className="pb-3 font-semibold">Service</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Provider</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats?.recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-mono font-bold text-blue-400">{b.booking_number}</td>
                        <td className="py-3 font-medium text-white">{b.service?.title}</td>
                        <td className="py-3 text-slate-300">{b.customer?.name}</td>
                        <td className="py-3 text-slate-300">{b.provider?.business_name}</td>
                        <td className="py-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-400">
                          ₹{b.service?.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMERS */}
        {activeTab === 'Customers' && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Registered Customer Accounts</h3>
                <p className="text-xs text-slate-400">View and manage customer account permissions</p>
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Joined Date</th>
                    <th className="pb-3 font-semibold">Account Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users
                    .filter(
                      (u) =>
                        u.role === 'customer' &&
                        (u.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(tableSearch.toLowerCase()))
                    )
                    .map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-semibold text-white flex items-center gap-2">
                          <img
                            src={
                              cust.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'
                            }
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span>{cust.name}</span>
                        </td>
                        <td className="py-3 text-slate-300 font-mono text-[11px]">{cust.email}</td>
                        <td className="py-3 text-slate-400">{cust.phone || 'N/A'}</td>
                        <td className="py-3 text-slate-400">
                          {new Date(cust.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              cust.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {cust.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(cust)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              cust.is_active
                                ? 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/60'
                                : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60'
                            }`}
                          >
                            {cust.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICE PROVIDERS */}
        {activeTab === 'Service Providers' && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Provider Verification & Approval</h3>
                <p className="text-xs text-slate-400">
                  Approve, suspend, and monitor credentials of registered professionals
                </p>
              </div>
              <input
                type="text"
                placeholder="Search providers..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Business / Provider</th>
                    <th className="pb-3 font-semibold">City</th>
                    <th className="pb-3 font-semibold">Experience</th>
                    <th className="pb-3 font-semibold">Rating</th>
                    <th className="pb-3 font-semibold">Approval Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {providers
                    .filter((p) =>
                      p.business_name.toLowerCase().includes(tableSearch.toLowerCase())
                    )
                    .map((prov) => (
                      <tr key={prov.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-white">{prov.business_name}</span>
                            {prov.id_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            Contact: {prov.user?.name} ({prov.user?.email})
                          </div>
                        </td>
                        <td className="py-3 text-slate-300">{prov.city}</td>
                        <td className="py-3 text-slate-300">{prov.experience_years} years</td>
                        <td className="py-3 text-amber-400 font-bold">
                          ★ {prov.rating} ({prov.total_reviews})
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              prov.is_approved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {prov.is_approved ? 'Verified & Approved' : 'Pending Approval'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleProviderApproval(prov)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              prov.is_approved
                                ? 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/60'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {prov.is_approved ? 'Suspend Provider' : 'Approve Provider'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICE CATEGORIES */}
        {activeTab === 'Service Categories' && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Service Category Management</h3>
                <p className="text-xs text-slate-400">
                  Manage all 15 default categories and add new specialized marketplace domains.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCat(null);
                  setCatName('');
                  setCatDesc('');
                  setCatIcon('Sparkles');
                  setCatImage('');
                  setIsCatModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <CategoryIcon name={c.icon_name} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{c.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingCat(c);
                        setCatName(c.name);
                        setCatDesc(c.description);
                        setCatIcon(c.icon_name);
                        setCatImage(c.image_url);
                        setIsCatModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ALL SERVICES */}
        {activeTab === 'All Services' && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-white">Master Service Offerings Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Service Title</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Provider</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Duration</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-semibold text-white max-w-[220px] truncate">
                        {s.title}
                      </td>
                      <td className="py-3 text-slate-400">{s.category?.name}</td>
                      <td className="py-3 text-slate-300">{s.provider?.business_name}</td>
                      <td className="py-3 font-bold text-emerald-400">₹{s.price}</td>
                      <td className="py-3 text-slate-400">{s.duration_mins} mins</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={async () => {
                            if (confirm(`Remove service "${s.title}" from catalog?`)) {
                              await api.deleteService(s.id);
                              showToast('success', 'Service deleted.');
                              loadAllAdminData();
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ALL BOOKINGS */}
        {activeTab === 'All Bookings' && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-white">Platform Bookings Master Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Booking ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Provider</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Current Status</th>
                    <th className="pb-3 font-semibold text-right">Override Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-blue-400">{b.booking_number}</td>
                      <td className="py-3 text-white">{b.customer?.name}</td>
                      <td className="py-3 text-slate-300">{b.provider?.business_name}</td>
                      <td className="py-3 text-slate-300 max-w-[160px] truncate">{b.service?.title}</td>
                      <td className="py-3 text-slate-400">
                        {b.booking_date} {b.booking_time}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={b.status}
                          onChange={(e) =>
                            handleAdminBookingStatus(b.id, e.target.value as BookingStatus)
                          }
                          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: PAYMENT AUDITS */}
        {activeTab === 'Payment Audits' && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-white">Payment & Gateway Transaction Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Transaction ID</th>
                    <th className="pb-3 font-semibold">Booking ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Method</th>
                    <th className="pb-3 font-semibold">Gateway</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-blue-400">{p.transaction_id}</td>
                      <td className="py-3 text-slate-300 font-mono">
                        {p.booking?.booking_number || p.booking_id}
                      </td>
                      <td className="py-3 text-white">{p.customer?.name}</td>
                      <td className="py-3 text-slate-300">{p.payment_method}</td>
                      <td className="py-3 text-slate-400">{p.gateway || 'Standard'}</td>
                      <td className="py-3 font-bold text-emerald-400">₹{p.amount}</td>
                      <td className="py-3 text-right">
                        <StatusBadge status={p.payment_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Create/Edit Modal */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-white mb-4">
                {editingCat ? 'Edit Service Category' : 'Create Service Category'}
              </h3>

              <form onSubmit={handleCatSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    required
                    placeholder="e.g. Solar Panel Installation"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    required
                    placeholder="Short summary of services in this category..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Lucide Icon</label>
                    <select
                      value={catIcon}
                      onChange={(e) => setCatIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                    >
                      <option value="Sparkles">Sparkles</option>
                      <option value="Wrench">Wrench</option>
                      <option value="Zap">Zap</option>
                      <option value="Wind">Wind</option>
                      <option value="Paintbrush">Paintbrush</option>
                      <option value="Hammer">Hammer</option>
                      <option value="Scissors">Scissors</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Camera">Camera</option>
                      <option value="Calendar">Calendar</option>
                      <option value="Activity">Activity</option>
                      <option value="BookOpen">BookOpen</option>
                      <option value="ShieldAlert">ShieldAlert</option>
                      <option value="Car">Car</option>
                      <option value="Flower">Flower</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="https://images.unsplash..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCat}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md cursor-pointer"
                  >
                    {isSubmittingCat ? 'Saving...' : 'Save Category'}
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
