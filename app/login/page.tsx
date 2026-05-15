'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/brand/Logo';
import { BRAND } from '@/lib/brand';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
    } catch {
      /* handled in hook */
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-between p-12 gradient-mesh pattern-dots border-r border-border"
      >
        <Logo size="md" />
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Pick up where your crew left off.
          </h2>
          <p className="text-muted-foreground max-w-sm leading-relaxed">{BRAND.tagline}</p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {BRAND.name}</p>
      </motion.div>

      <div className="flex items-center justify-center p-6 gradient-mesh">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <motion.div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </motion.div>
          <h1 className="font-display text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-8">Enter your workspace credentials</p>

          <div className="card-elevated p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })}
                    type="email"
                    placeholder="you@crew.io"
                    className="w-full h-11 pl-10 pr-4 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link href="/reset-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-md btn-coral text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Enter workspace <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 pt-5 border-t border-border text-xs text-center text-muted-foreground">
              Demo lead: <span className="font-mono text-primary">admin@taskflow.com</span> / Admin@123
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create a crew account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
