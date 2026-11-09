import React from 'react';
import { CheckCircle2, Mail, Phone, ShieldCheck, Zap } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Trust Highlights */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Verified & Background Checked</h4>
                <p className="text-xs text-slate-400">All service providers undergo stringent vetting & credential verification.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">100% Quality Guaranteed</h4>
                <p className="text-xs text-slate-400">Complimentary rework or full money back if you are not satisfied.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Instant Online Booking</h4>
                <p className="text-xs text-slate-400">Real-time schedule availability without the back-and-forth phone calls.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ProServe Marketplace</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The premier on-demand service platform connecting residential and commercial clients with verified professionals across 15+ specialized service categories.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+1 (800) 555-PROS (7767) - 24/7 Helpline</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@proserve.marketplace</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Top Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('services', { category: 'cat-1' })} className="hover:text-blue-400 transition-colors">
                  Home Cleaning
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services', { category: 'cat-2' })} className="hover:text-blue-400 transition-colors">
                  Plumbing Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services', { category: 'cat-3' })} className="hover:text-blue-400 transition-colors">
                  Electrical Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services', { category: 'cat-4' })} className="hover:text-blue-400 transition-colors">
                  AC Repair & Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services', { category: 'cat-7' })} className="hover:text-blue-400 transition-colors">
                  Beauty & Salon at Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services', { category: 'cat-9' })} className="hover:text-blue-400 transition-colors">
                  Photography
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-blue-400 transition-colors">
                  Explore Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition-colors">
                  Customer Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-blue-400 transition-colors">
                  Join as Service Provider
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-blue-400 transition-colors">
                  Provider Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Test Accounts & System Status */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Demo Credentials</h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Customer:</span>
                <span className="font-mono text-slate-200">customer@proserve.com</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Provider:</span>
                <span className="font-mono text-slate-200">provider@proserve.com</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Admin:</span>
                <span className="font-mono text-slate-200">admin@proserve.com</span>
              </div>
              <div className="text-[10px] text-blue-400 pt-1 border-t border-slate-800">
                Password: <span className="font-mono font-semibold">&lt;role&gt;123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ProServe Marketplace, Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
