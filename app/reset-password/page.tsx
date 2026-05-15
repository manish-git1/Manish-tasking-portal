'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/brand/Logo';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="inline-flex justify-center mb-8">
          <Logo />
        </Link>
        <div className="card-elevated p-8">
          <div className="w-14 h-14 rounded-md bg-accent flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-secondary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Password reset</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Self-service reset isn&apos;t wired up yet. Ask your crew lead to update your credentials from the roster.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
