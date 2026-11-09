import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.tsx';

export const ContactPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does double-booking prevention work on ProServe?',
      a: 'Our database actively locks the selected provider and time slot once a booking is placed. No two customers can book the same technician at identical hours unless a booking is formally rejected or cancelled.',
    },
    {
      q: 'Can I pay in cash instead of paying online?',
      a: 'Yes! ProServe offers full flexibility. During booking checkout you can select "Cash on Service" to settle the invoice directly with your technician upon satisfactory completion.',
    },
    {
      q: 'What if I need to cancel or reschedule my service?',
      a: 'You can cancel any booking in "Pending" or "Accepted" state directly from your Customer Dashboard with no cancellation penalties.',
    },
    {
      q: 'How can I become an approved service provider?',
      a: 'Click "Get Started", select "Service Provider", and submit your business details, credentials, and category experience. Platform administrators review and approve accounts within 24 hours.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    showToast('success', 'Your inquiry has been received! Our support desk will reply within 2 hours.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            24/7 Dedicated Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">We are Here to Help</h1>
          <p className="text-sm text-slate-400">
            Have questions regarding a booking, provider verification, or custom commercial quotes? Reach out to our specialized concierge desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-white">Contact Information</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Toll-Free Phone</span>
                    <span className="text-slate-400">+1 (800) 555-PROS (7767)</span>
                    <span className="text-[10px] text-blue-400 block mt-0.5">24 hours a day, 7 days a week</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Customer Inquiries</span>
                    <span className="text-slate-400">support@proserve.marketplace</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Headquarters</span>
                    <span className="text-slate-400">400 Beacon Plaza, Suite 800, Metro City, NY 10001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Support Note */}
            <div className="p-5 rounded-3xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200/90 space-y-1.5">
              <span className="font-bold text-blue-300 block">ProServe Priority Dispatch</span>
              <p className="text-[11px] leading-relaxed">
                Emergency repair requests (e.g. burst plumbing pipes or main circuit breakers) are triaged with highest priority within 30 minutes.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">Send a Message</h3>
              <p className="text-xs text-slate-400 mb-6">Fill in the form below and an agent will follow up shortly.</p>

              {isSent && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Message delivered successfully! Our representative will contact you via email or phone.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Question regarding booking status or service coverage"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Describe how we can assist you..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10">
          <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-800/40 border border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
