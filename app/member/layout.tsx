'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useUIStore } from '@/store/uiStore';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      axios.get('/api/auth/me').then(({ data }) => {
        setUser(data.data.user);
        if (data.data.user.role === 'admin') router.push('/admin/dashboard');
      }).catch(() => router.push('/login'));
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [user, setUser, router]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className="transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: sidebarOpen ? 272 : 76 }}
      >
        <Header title="My queue" subtitle="Your assignments and progress updates" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
