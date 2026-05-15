'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => { markAsRead(n._id); setOpen(false); }}
                  className={cn('px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-accent transition-colors', !n.isRead && 'bg-primary/5')}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-border">
            <Link href={`/${notifications[0]?.type.includes('admin') ? 'admin' : 'member'}/notifications`} onClick={() => setOpen(false)} className="text-xs text-primary hover:underline">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
