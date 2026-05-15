'use client';
import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore();
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setUser(data.data.user);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      router.push(data.data.user.role === 'admin' ? '/admin/dashboard' : '/member/my-tasks');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Login failed';
      toast.error(msg || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, router]);

  const register = useCallback(async (payload: { name: string; email: string; password: string; role?: string; department?: string }) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', payload);
      setUser(data.data.user);
      toast.success('Account created successfully!');
      router.push(data.data.user.role === 'admin' ? '/admin/dashboard' : '/member/my-tasks');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Registration failed';
      toast.error(msg || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, router]);

  return { user, isLoading, login, register, logout };
}
