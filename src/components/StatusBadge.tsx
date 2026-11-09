import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { BookingStatus, PaymentStatus } from '../types.ts';

interface StatusBadgeProps {
  status: BookingStatus | PaymentStatus;
  type?: 'booking' | 'payment';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (status) {
    case 'Pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    case 'Accepted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 ${sizeClasses}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Accepted
        </span>
      );
    case 'Confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Confirmed
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 ${sizeClasses}`}
        >
          <PlayCircle className="w-3.5 h-3.5 animate-pulse" />
          In Progress
        </span>
      );
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'Rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    case 'Cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 ${sizeClasses}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
    case 'Failed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-500/10 text-slate-300 border border-slate-700 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
};
