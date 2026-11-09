import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { Booking, PaymentMethod } from '../types.ts';

interface PaymentModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotifications();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online Payment');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('Alex Customer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const amount = booking.service?.price || 100;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await api.processPayment({
        booking_id: booking.id,
        payment_method: paymentMethod,
        simulate_failure: simulateFailure,
      });

      if (paymentMethod === 'Online Payment') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast('success', `Payment of ₹${amount} verified & authorized via Razorpay Test Gateway!`);
      } else {
        showToast('success', `Cash on Service confirmed for booking #${booking.booking_number}!`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment transaction failed.');
      showToast('error', err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            Secure Checkout
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Payment & Confirmation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Booking #{booking.booking_number} • {booking.service?.title || 'Professional Service'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setPaymentMethod('Online Payment')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              paymentMethod === 'Online Payment'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Online (Razorpay Test)</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('Cash on Service')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              paymentMethod === 'Cash on Service'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Cash on Service</span>
          </button>
        </div>

        <form onSubmit={handleProcessPayment} className="space-y-4">
          {paymentMethod === 'Online Payment' ? (
            <div className="space-y-3.5 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Razorpay Sandbox Environment
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Test Cards Active
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expires (MM/YY)</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Developer Test Switch */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Test Gateway Decline Scenario</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <Banknote className="w-4 h-4" />
                Pay Directly to Professional on Service Delivery
              </div>
              <p className="text-[11px] leading-relaxed">
                You can pay using cash, local digital payment or UPI directly to your assigned service professional once the job is finished to your complete satisfaction.
              </p>
            </div>
          )}

          {/* Amount Due Bar */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total Payable:</span>
              <span className="text-xs text-slate-300 font-medium">Service Fee & Taxes Included</span>
            </div>
            <div className="text-2xl font-bold text-white">₹{amount}</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                'Processing...'
              ) : paymentMethod === 'Online Payment' ? (
                `Pay ₹${amount} via Razorpay`
              ) : (
                'Confirm Cash on Service'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>256-bit SSL encrypted • Gateway verified</span>
          </div>
        </form>
      </div>
    </div>
  );
};
