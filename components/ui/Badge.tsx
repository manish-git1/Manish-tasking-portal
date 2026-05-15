import { cn } from '@/lib/utils';

export function cn_badge(variant: string) {
  const variants: Record<string, string> = {
    todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    review: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    member: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  };
  return variants[variant] || variants.todo;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant = 'todo', className }: BadgeProps) {
  return (
    <span className={cn('status-badge font-medium capitalize', cn_badge(variant), className)}>
      {children}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-slate-400',
    medium: 'bg-amber-400',
    high: 'bg-orange-500',
    urgent: 'bg-rose-500',
  };
  return <span className={cn('w-2 h-2 rounded-full inline-block', colors[priority] || 'bg-slate-400')} />;
}
