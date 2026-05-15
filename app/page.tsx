'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Logo } from '@/components/brand/Logo';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Route,
  ShieldCheck,
  Radio,
  Gauge,
  UsersRound,
  CalendarClock,
} from 'lucide-react';

const pillars = [
  {
    icon: Route,
    title: 'Work lanes',
    desc: 'Every assignment has a clear owner, lane, and due window — no mystery tasks in group chats.',
  },
  {
    icon: UsersRound,
    title: 'Crew roles',
    desc: 'Leads run the board. Contributors see only their queue. Permissions stay tight by design.',
  },
  {
    icon: Gauge,
    title: 'Momentum view',
    desc: 'Spot stalled work, overdue items, and who is carrying the heaviest load this week.',
  },
  {
    icon: Radio,
    title: 'Signal alerts',
    desc: 'Assignments, status shifts, and extension requests ping the right person instantly.',
  },
  {
    icon: CalendarClock,
    title: 'Deadline flow',
    desc: 'Members can request more time; leads approve or decline with one click and an audit trail.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    desc: 'Encrypted sessions, hashed passwords, and role gates on every sensitive action.',
  },
];

const metrics = [
  { value: '3×', label: 'faster handoffs' },
  { value: '0', label: 'spreadsheet chaos' },
  { value: '24/7', label: 'cloud access' },
  { value: '100%', label: 'role clarity' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-mesh pattern-dots">
      <nav className="sticky top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-xl">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between"
        >
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2"
            >
              Sign in
            </Link>
            <Link href="/register" className="btn-coral text-sm px-5 py-2.5 rounded-md inline-flex items-center gap-2">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </nav>

      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
            <p className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-secondary mb-4">
              Team operations platform
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mb-6">
              Run your crew&apos;s work on{' '}
              <span className="gradient-text">one honest board.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              {BRAND.shortDescription}
            </p>
            <motion.div className="flex flex-wrap gap-3" whileHover="hover">
              <Link href="/register" className="btn-coral px-7 py-3.5 rounded-md inline-flex items-center gap-2 text-base">
                Open your workspace <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-md border-2 border-foreground/15 font-semibold hover:bg-card transition-colors"
              >
                I have an account
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative hidden lg:block"
          >
            <div className="card-elevated p-6 animate-float">
              <motion.div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today&apos;s board</span>
                <span className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground font-semibold">Live</span>
              </motion.div>
              {[
                { t: 'Ship onboarding flow', s: 'In progress', c: 'bg-secondary/20 text-secondary' },
                { t: 'Review Q2 metrics deck', s: 'Waiting', c: 'bg-muted text-muted-foreground' },
                { t: 'Client sync — Acme Corp', s: 'Due today', c: 'bg-primary/15 text-primary' },
              ].map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between py-3 border-b border-border/60 last:border-0"
                >
                  <span className="font-medium text-sm">{row.t}</span>
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-1 rounded', row.c)}>{row.s}</span>
                </motion.div>
              ))}
            </div>
            <motion.div className="absolute -z-10 -right-8 -bottom-8 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
            <motion.div className="absolute -z-10 -left-6 top-10 w-32 h-32 rounded-full bg-secondary/25 blur-2xl" />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border bg-card/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center md:text-left"
            >
              <div className="font-display text-4xl font-bold text-primary">{m.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for how real teams actually work</h2>
          <p className="text-muted-foreground text-lg">
            Not another generic task list. {BRAND.name} is shaped around handoffs, accountability, and clearing blockers
            before they become fires.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map(({ icon: Icon, title, desc }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="card-elevated p-6 group"
            >
              <div className="w-11 h-11 rounded-md bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto card-elevated p-10 sm:p-14 text-center relative overflow-hidden"
        >
          <motion.div className="absolute inset-0 gradient-brand opacity-[0.06]" />
          <h2 className="relative text-3xl sm:text-4xl font-bold mb-4">Ready to align your crew?</h2>
          <p className="relative text-muted-foreground mb-8 max-w-md mx-auto">
            Spin up a workspace in minutes. Invite your team, assign the first lane, and watch the noise drop.
          </p>
          <Link href="/register" className="relative btn-coral px-8 py-3.5 rounded-md inline-flex items-center gap-2">
            Create workspace <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-border py-10 px-5 text-center">
        <Logo size="sm" className="justify-center mb-3" />
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}</p>
      </footer>
    </div>
  );
}
