'use client';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-base' },
  md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-xl' },
  lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-2xl' },
};

export function Logo({ showText = true, size = 'md', className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <motion.div
        whileHover={{ rotate: 0 }}
        className={cn(s.box, 'rounded-md gradient-brand flex items-center justify-center shadow-md shadow-primary/25 rotate-2')}
      >
        <Layers className={cn(s.icon, 'text-white')} strokeWidth={2.25} />
      </motion.div>
      {showText && (
        <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="leading-tight">
          <span className={cn(s.text, 'font-display font-bold tracking-tight')}>{BRAND.name}</span>
          {size === 'lg' && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans font-semibold">
              Crew ops
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
