'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn, getInitials } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  GitPullRequest,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Command center', icon: LayoutDashboard },
  { href: '/admin/tasks', label: 'Work lanes', icon: CheckSquare },
  { href: '/admin/users', label: 'Crew roster', icon: Users },
  { href: '/admin/requests', label: 'Extension queue', icon: GitPullRequest },
  { href: '/admin/reports', label: 'Insights', icon: BarChart3 },
];

const memberLinks = [
  { href: '/member/my-tasks', label: 'My queue', icon: ListTodo },
  { href: '/member/notifications', label: 'Signals', icon: Bell },
  { href: '/member/profile', label: 'Account', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const links = user?.role === 'admin' ? adminLinks : memberLinks;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 272 : 76 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 sidebar-shell flex overflow-hidden"
    >
      <div className="w-1 shrink-0 sidebar-accent-bar" />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 px-3 h-16 border-b border-border shrink-0">
          <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/member/my-tasks'} className="flex-1 min-w-0">
            <Logo showText={sidebarOpen} size="sm" />
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {sidebarOpen && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {user?.role === 'admin' ? 'Lead tools' : 'Your space'}
            </p>
          )}
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn('sidebar-link', active ? 'sidebar-link-active' : 'sidebar-link-inactive')}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.25 : 2} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <motion.div className={cn('flex items-center gap-2', !sidebarOpen && 'justify-center')}>
            <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold shrink-0">
              {user ? getInitials(user.name) : '?'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {user?.role === 'admin' ? 'Crew lead' : 'Contributor'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarOpen && (
              <button
                onClick={logout}
                className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}
