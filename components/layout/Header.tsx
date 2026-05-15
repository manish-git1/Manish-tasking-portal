'use client';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  return (
    <header className="h-[4.25rem] border-b border-border bg-card/80 backdrop-blur-md flex items-center px-5 gap-4 sticky top-0 z-30">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-0.5">Workspace</p>
        <h1 className="font-display text-xl font-semibold leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="hidden md:flex items-center gap-2 bg-muted rounded-md px-3 py-2 w-52 border border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          placeholder="Quick find…"
          className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
        />
      </div>
      <NotificationBell />
      <ThemeToggle />
      <div className="flex items-center gap-2 pl-3 border-l border-border">
        <motion.div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          {user ? getInitials(user.name) : '?'}
        </motion.div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold leading-tight">{user?.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {user?.role === 'admin' ? 'Lead' : 'Member'}
          </p>
        </div>
      </div>
    </header>
  );
}
