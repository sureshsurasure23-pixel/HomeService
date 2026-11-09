import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { Notification } from '../types.ts';
import { useAuth } from './AuthContext.tsx';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
      {/* Toast Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-xl border text-sm transition-all transform animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                : toast.type === 'error'
                ? 'bg-rose-900/90 border-rose-500/40 text-rose-100 shadow-rose-950/30'
                : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-black/40'
            }`}
          >
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
