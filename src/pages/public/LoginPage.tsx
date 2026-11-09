import React, { useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { UserRole } from '../../types.ts';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickLogin } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      showToast('success', 'Logged in successfully!');
      onNavigate('home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
      showToast('error', err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuick = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await quickLogin(role);
      showToast('success', `Signed in as test ${role}!`);
      if (role === 'admin') onNavigate('admin-dashboard');
      else if (role === 'provider') onNavigate('provider-dashboard');
      else onNavigate('customer-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Sign In to ProServe</h1>
          <p className="text-xs text-slate-400">Access your bookings, provider dashboard, or administration</p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Instant Test Login (Click Any Role)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuick('customer')}
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('provider')}
              className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Provider</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="customer@proserve.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Signing In...' : 'Sign In with Credentials'}</span>
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
