'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, MailOpen, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-brand-green hover:bg-brand-green-light rounded-xl transition-colors focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] font-black animate-pulse-slow">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-80 bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="font-extrabold text-brand-green text-xs uppercase tracking-wider">Recent Logs</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-brand-gold-dark hover:text-brand-green transition-colors flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-brand-green-light/10">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-brand-foreground/50 space-y-2">
                <MailOpen className="h-8 w-8 text-brand-gold mx-auto" />
                <p className="text-xs font-semibold">No recent notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-4 text-left transition-colors cursor-pointer ${
                    n.isRead ? 'opacity-70 hover:bg-brand-gold-light/10' : 'bg-brand-gold-light/20 hover:bg-brand-gold-light/30'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-xs font-bold ${n.isRead ? 'text-brand-foreground' : 'text-brand-green'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="h-1.5 w-1.5 bg-brand-gold rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-brand-foreground/75 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[8px] text-brand-foreground/45 mt-2 font-semibold uppercase">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
