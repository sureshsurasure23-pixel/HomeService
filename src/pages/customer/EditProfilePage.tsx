import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';

export const EditProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Profile fields (Customer or Provider)
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [postalCode, setPostalCode] = useState(profile?.postal_code || '');

  // Provider fields
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(profile?.hourly_rate || 40);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || '');
    }
    if (profile) {
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setPostalCode(profile.postal_code || '');
      if (user?.role === 'provider') {
        setBusinessName(profile.business_name || '');
        setBio(profile.bio || '');
        setHourlyRate(profile.hourly_rate || 40);
      }
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: any = {
        name,
        phone,
        avatar_url: avatarUrl,
        address,
        city,
        state,
        postal_code: postalCode,
      };

      if (user?.role === 'provider') {
        payload.business_name = businessName;
        payload.bio = bio;
        payload.hourly_rate = Number(hourlyRate);
      }

      await api.updateProfile(payload);
      await refreshProfile();
      showToast('success', 'Profile information updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Manage Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Update personal contact info, service delivery location, and public bio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <img
              src={
                avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt="Avatar preview"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700"
            />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Account Basics */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Account Credentials & Contact
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email (Registered)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Service Delivery Location
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Address / Street</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="742 Evergreen Terrace, Apt 4"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Provider Specific Details */}
          {user?.role === 'provider' && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Provider Business Profile
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hourly Base Rate (₹)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Profile Pitch</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
