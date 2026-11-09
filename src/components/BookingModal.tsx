import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { Service } from '../types.ts';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState<string>(minDateStr);
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Metro City');
  const [requirements, setRequirements] = useState<string>('');
  const [isCheckingSlot, setIsCheckingSlot] = useState<boolean>(false);
  const [slotStatus, setSlotStatus] = useState<{ available?: boolean; message?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill from customer profile if available
  useEffect(() => {
    if (profile) {
      if (profile.address) setLocationAddress(profile.address);
      if (profile.city) setCity(profile.city);
    }
  }, [profile]);

  // Check slot availability when date or time slot changes
  useEffect(() => {
    if (!service.provider_id || !bookingDate || !bookingTime) return;

    let isMounted = true;
    setIsCheckingSlot(true);
    setSlotStatus(null);
    setErrorMessage(null);

    api
      .checkAvailability({
        provider_id: service.provider_id,
        booking_date: bookingDate,
        booking_time: bookingTime,
      })
      .then((res) => {
        if (isMounted) {
          setSlotStatus(res);
          setIsCheckingSlot(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsCheckingSlot(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [service.provider_id, bookingDate, bookingTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please sign in as a customer to book this service.');
      return;
    }

    if (user.role !== 'customer') {
      setErrorMessage('Only customer accounts can book services. Please switch to a customer account.');
      return;
    }

    if (!locationAddress.trim()) {
      setErrorMessage('Please enter your service delivery address.');
      return;
    }

    if (slotStatus && !slotStatus.available) {
      setErrorMessage('This time slot is already booked. Please choose a different date or time.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newBooking = await api.createBooking({
        service_id: service.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        location_address: locationAddress,
        city,
        requirements,
      });

      showToast('success', `Booking #${newBooking.booking_number} created successfully!`);
      onSuccess(newBooking.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create booking.');
      showToast('error', err.message || 'Double booking conflict or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Book Professional Service
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{service.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <span className="font-bold">₹</span>{service.price}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {service.duration_mins} mins
            </span>
            {service.provider && (
              <span className="text-slate-300">
                by <span className="text-blue-300 font-medium">{service.provider.business_name}</span>
              </span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Select Service Date *
            </label>
            <input
              type="date"
              min={minDateStr}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Select Time Slot *
              </span>
              {isCheckingSlot ? (
                <span className="text-[11px] text-slate-400 animate-pulse">Checking availability...</span>
              ) : slotStatus ? (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    slotStatus.available ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {slotStatus.available ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Available Slot
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Slot Unavailable (Booked)
                    </>
                  )}
                </span>
              ) : null}
            </label>

            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = bookingTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setBookingTime(slot)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 font-semibold'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Service Address *
              </label>
              <input
                type="text"
                placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Specific Instructions or Requirements (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please bring extra ladders, dog at home, gate code #1234..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Pricing Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Total Due Upon Booking / Service:</span>
              <span className="text-white font-medium">Includes standard equipment & labor</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">₹{service.price}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (slotStatus !== null && !slotStatus.available)}
              className="flex-1 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
