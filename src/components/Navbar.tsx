import React, { useState } from 'react';
import {
  Bell,
  Briefcase,
  ChevronDown,
  Compass,
  Layers,
  LogOut,
  Menu,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { UserRole } from '../types.ts';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoSwitchOpen, setIsDemoSwitchOpen] = useState(false);

  const handleQuickSwitch = async (role: UserRole) => {
    setIsDemoSwitchOpen(false);
    await quickLogin(role);
    if (role === 'admin') onNavigate('admin-dashboard');
    else if (role === 'provider') onNavigate('provider-dashboard');
    else onNavigate('customer-dashboard');
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Admin
          </span>
        );
      case 'provider':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Pro Provider
          </span>
        );
      case 'customer':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Customer
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  ProServe
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-blue-400">
                  Marketplace
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'home'
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('services')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'services'
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Find Services
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'about'
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'contact'
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Contact
              </button>

              {/* Role-Specific Direct Navigation */}
              {user && (
                <button
                  onClick={() => {
                    if (user.role === 'admin') onNavigate('admin-dashboard');
                    else if (user.role === 'provider') onNavigate('provider-dashboard');
                    else onNavigate('customer-dashboard');
                  }}
                  className={`ml-2 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold text-blue-300 bg-blue-900/30 border border-blue-500/30 hover:bg-blue-800/40 cursor-pointer`}
                >
                  <Compass className="w-4 h-4" />
                  My Dashboard
                </button>
              )}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher (Instant Test Accounts) */}
            <div className="relative">
              <button
                onClick={() => setIsDemoSwitchOpen(!isDemoSwitchOpen)}
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700/80 cursor-pointer"
                title="Switch test accounts with 1 click"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Test Role</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isDemoSwitchOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Quick Role Switch
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('customer')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-100">Customer</div>
                      <div className="text-[10px] text-slate-400">customer@proserve.com</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('provider')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-semibold text-slate-100">Provider</div>
                      <div className="text-[10px] text-slate-400">provider@proserve.com</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold text-slate-100">Administrator</div>
                      <div className="text-[10px] text-slate-400">admin@proserve.com</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Dropdown (when logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-sm font-semibold text-slate-100">
                        Notifications ({notifications.length})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-400 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link_url) {
                                setIsNotifOpen(false);
                                if (n.link_url.includes('customer')) onNavigate('customer-dashboard');
                                else if (n.link_url.includes('provider')) onNavigate('provider-dashboard');
                                else onNavigate('bookings');
                              }
                            }}
                            className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                              n.is_read
                                ? 'bg-slate-800/30 hover:bg-slate-800/70 opacity-75'
                                : 'bg-blue-950/40 border border-blue-800/40 hover:bg-blue-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer focus:outline-none"
                >
                  <img
                    src={
                      user.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="hidden sm:block text-left text-xs leading-tight pr-1">
                    <div className="font-semibold text-slate-200 truncate max-w-[120px]">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="text-sm font-semibold text-slate-100 truncate">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (user.role === 'admin') onNavigate('admin-dashboard');
                          else if (user.role === 'provider') onNavigate('provider-dashboard');
                          else onNavigate('customer-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4 text-blue-400" />
                        My Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        Edit Profile
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          onNavigate('home');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 rounded-lg cursor-pointer flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('home');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('services');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            Find Services
          </button>
          <button
            onClick={() => {
              onNavigate('about');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            About Us
          </button>
          <button
            onClick={() => {
              onNavigate('contact');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            Contact
          </button>

          {user && (
            <button
              onClick={() => {
                if (user.role === 'admin') onNavigate('admin-dashboard');
                else if (user.role === 'provider') onNavigate('provider-dashboard');
                else onNavigate('customer-dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-400 bg-blue-950/40 rounded-lg"
            >
              My Dashboard
            </button>
          )}

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Switch Test Account
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => {
                  handleQuickSwitch('customer');
                  setIsMobileMenuOpen(false);
                }}
                className="px-2 py-1.5 text-xs text-center bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-medium"
              >
                Customer
              </button>
              <button
                onClick={() => {
                  handleQuickSwitch('provider');
                  setIsMobileMenuOpen(false);
                }}
                className="px-2 py-1.5 text-xs text-center bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400 font-medium"
              >
                Provider
              </button>
              <button
                onClick={() => {
                  handleQuickSwitch('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="px-2 py-1.5 text-xs text-center bg-slate-800 hover:bg-slate-700 rounded-lg text-purple-400 font-medium"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
