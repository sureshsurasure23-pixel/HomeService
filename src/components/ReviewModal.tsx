import React, { useState } from 'react';
import { AlertCircle, Star, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { Booking } from '../types.ts';

interface ReviewModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotifications();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please share a few words about your experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createReview({
        booking_id: booking.id,
        rating,
        comment,
      });

      showToast('success', 'Thank you! Your review and rating have been posted.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
            Rate Service Experience
          </span>
          <h2 className="text-xl font-bold text-white">{booking.service?.title || 'Service Completed'}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Booking #{booking.booking_number} • Completed on {booking.booking_date}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star selector */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs text-slate-400 mb-2 font-medium">Select Star Rating</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(rating)}
                  className="p-1 text-slate-600 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm font-semibold text-amber-300 mt-2">
              {rating === 5
                ? '5 Stars - Exceptional'
                : rating === 4
                ? '4 Stars - Very Good'
                : rating === 3
                ? '3 Stars - Average'
                : rating === 2
                ? '2 Stars - Poor'
                : '1 Star - Terrible'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Your Review & Feedback *
            </label>
            <textarea
              rows={4}
              placeholder="How was the quality of service? Was the technician punctual, polite, and professional?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              {isSubmitting ? 'Posting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
