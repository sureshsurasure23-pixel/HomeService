import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Zap } from 'lucide-react';
import { api } from '../../services/api.ts';

interface ForgotPasswordPageProps {
  onNavigate: (view: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword(email);
      setResultMessage(res.message);
    } catch (err: any) {
      setResultMessage('If the account exists, password reset instructions have been dispatched.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-xs text-slate-400">
              Enter your registered email address to receive password recovery instructions.
            </p>
          </div>

          {resultMessage ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Instructions Sent
              </div>
              <p>{resultMessage}</p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. customer@proserve.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
