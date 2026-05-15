'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelative } from '@/lib/utils';
import { Bell, CheckCheck, CheckSquare, GitPullRequest, AlertCircle, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  task_assigned: <CheckSquare className="w-4 h-4 text-primary" />,
  task_updated: <CheckSquare className="w-4 h-4 text-blue-500" />,
  status_updated: <CheckCheck className="w-4 h-4 text-emerald-500" />,
  request_submitted: <GitPullRequest className="w-4 h-4 text-amber-500" />,
  request_approved: <CheckCheck className="w-4 h-4 text-emerald-500" />,
  request_rejected: <AlertCircle className="w-4 h-4 text-rose-500" />,
  deadline_reminder: <Calendar className="w-4 h-4 text-orange-500" />,
  comment_added: <MessageSquare className="w-4 h-4 text-violet-500" />,
};

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllRead } = useNotifications();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}><CheckCheck className="w-4 h-4" /> Mark all read</Button>
        )}
      </div>

      {isLoading ? (
        [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-2xl shimmer" />)
      ) : notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground font-medium">You&apos;re all caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={cn('bg-card border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md', !n.isRead ? 'border-primary/30 bg-primary/5' : 'border-border')}>
              <div className="flex items-start gap-4">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', !n.isRead ? 'bg-primary/10' : 'bg-accent')}>
                  {ICON_MAP[n.type] || <Bell className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold', !n.isRead ? 'text-foreground' : 'text-muted-foreground')}>{n.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatRelative(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  {n.relatedTask && <p className="text-xs text-primary mt-1 font-medium">→ {n.relatedTask.title}</p>}
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
