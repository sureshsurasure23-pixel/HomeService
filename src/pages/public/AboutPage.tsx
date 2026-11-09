import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Modern Services
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Connecting High-Standard Customers With Vetted Local Experts
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            ProServe was established to solve the friction of finding dependable, background-checked professionals for urgent repairs, home sanitization, technical support, and lifestyle essentials.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Background Screened</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every provider on ProServe undergoes thorough identity verification, criminal background scrutiny, license validation, and hands-on skill evaluations before activation.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Upfront Transparent Pricing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No surprise call-out charges or unexpected markups. Clear quotes, standardized category rates, and secure milestone payment protection for total peace of mind.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Satisfaction Guarantee</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an accepted job does not meet our verified quality benchmarks, our rapid resolution team guarantees a complimentary re-work or a 100% refund.
            </p>
          </div>
        </div>

        {/* How It Works Workflow */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              Seamless 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How ProServe Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-blue-500/40 mb-3">01</div>
              <h4 className="text-sm font-bold text-white mb-1.5">Discover & Select</h4>
              <p className="text-xs text-slate-400">
                Browse 15 curated categories, compare provider ratings, reviews, and verified skill badges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-blue-500/40 mb-3">02</div>
              <h4 className="text-sm font-bold text-white mb-1.5">Book Available Slot</h4>
              <p className="text-xs text-slate-400">
                Select your preferred date & time. Our engine guarantees zero double-bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-blue-500/40 mb-3">03</div>
              <h4 className="text-sm font-bold text-white mb-1.5">Expert Execution</h4>
              <p className="text-xs text-slate-400">
                Your certified pro arrives promptly with all necessary equipment to perform the job.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-blue-500/40 mb-3">04</div>
              <h4 className="text-sm font-bold text-white mb-1.5">Pay & Rate</h4>
              <p className="text-xs text-slate-400">
                Pay online or via Cash on Service. Submit star ratings to help the community.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <button
            onClick={() => onNavigate('services')}
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-xl shadow-blue-600/30 cursor-pointer"
          >
            Explore Services Now
          </button>
        </div>
      </div>
    </div>
  );
};
