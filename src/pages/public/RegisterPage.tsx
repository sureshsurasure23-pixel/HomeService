import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { ServiceCategory, UserRole } from '../../types.ts';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useNotifications();

  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Metro City');
  const [address, setAddress] = useState('');

  // Provider specific
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [categoryId, setCategoryId] = useState('cat-1');
  const [experienceYears, setExperienceYears] = useState('3');
  const [hourlyRate, setHourlyRate] = useState('499');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        role,
        city,
        address,
      };

      if (role === 'provider') {
        payload.business_name = businessName || `${name}'s Services`;
        payload.bio = bio;
        payload.category_id = categoryId;
        payload.experience_years = Number(experienceYears);
        payload.hourly_rate = Number(hourlyRate);
      }

      await register(payload);
      showToast('success', `Welcome! Your ${role} profile has been initialized.`);
      if (role === 'provider') {
        onNavigate('provider-dashboard');
      } else {
        onNavigate('customer-dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
      showToast('error', err.message || 'Registration error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create ProServe Account</h1>
          <p className="text-xs text-slate-400">Join our marketplace as a customer or certified service provider</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'customer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>I Need Services (Customer)</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'provider'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>I Offer Services (Provider)</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Rachel Green"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="rachel@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 500 Market Street"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Provider specific fields */}
            {role === 'provider' && (
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/40 space-y-3.5 pt-4">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Provider Credentials & Details
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business / Trade Name *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    placeholder="e.g. Apex Electrical Solutions"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Primary Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Years Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      min="10"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business Bio / Experience Summary</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your licenses, certifications, and specialities..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating Account...' : `Register as ${role === 'provider' ? 'Provider' : 'Customer'}`}</span>
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
