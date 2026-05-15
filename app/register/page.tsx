'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/brand/Logo';
import { BRAND } from '@/lib/brand';
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  department: string;
}

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
    } catch {
      /* handled in hook */
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-between p-12 bg-card border-r border-border pattern-dots"
      >
        <Logo size="md" />
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Join the crew in under a minute.
          </h2>
          <p className="text-muted-foreground max-w-sm">
            You&apos;ll start as a contributor. Your lead can promote roles from the roster later.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{BRAND.tagline}</p>
      </motion.div>

      <div className="flex items-center justify-center p-6 gradient-mesh">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <motion.div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </motion.div>
          <h1 className="font-display text-2xl font-bold mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-8">Set up your contributor profile</p>

          <div className="card-elevated p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
                    placeholder="Alex Rivera"
                    className="w-full h-11 pl-10 pr-4 rounded-md bg-background border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('email', {
                      required: 'Email required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })}
                    type="email"
                    placeholder="alex@crew.io"
                    className="w-full h-11 pl-10 pr-4 rounded-md bg-background border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('department')}
                    placeholder="Product, Ops, Design…"
                    className="w-full h-11 pl-10 pr-4 rounded-md bg-background border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
                <motion.div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Uppercase + number"
                    className="w-full h-11 pl-10 pr-10 rounded-md bg-background border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </motion.div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-md btn-coral text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Join {BRAND.name} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already onboard?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
