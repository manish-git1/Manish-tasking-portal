'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import { User, Building2, Lock, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'info' | 'security'>('info');

  const save = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = { name: form.name, department: form.department };
      if (tab === 'security' && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const { data } = await axios.patch('/api/profile', payload);
      setUser({ ...user!, name: data.data.user.name, department: data.data.user.department });
      toast.success('Profile updated!');
      if (tab === 'security') setForm(p => ({ ...p, currentPassword: '', newPassword: '' }));
    } catch (e: unknown) {
      toast.error(axios.isAxiosError(e) ? e.response?.data?.message : 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl space-y-5">
      {/* Avatar Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {getInitials(user?.name || '?')}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="status-badge bg-primary/10 text-primary capitalize">{user?.role}</span>
            {user?.department && <span className="status-badge bg-accent text-muted-foreground">{user.department}</span>}
          </div>
        </div>
      </motion.div>

      {/* Settings Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-border">
          {([['info', 'Personal Info'], ['security', 'Security']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === key ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {tab === 'info' ? (
            <>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2"><User className="w-4 h-4" /> Full Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2"><Building2 className="w-4 h-4" /> Department</label>
                <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Engineering"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input value={user?.email || ''} disabled className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-sm text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> Current Password</label>
                <input type="password" value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> New Password</label>
                <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min 6 chars, 1 uppercase, 1 number"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </>
          )}
          <Button isLoading={saving} onClick={save} className="w-full">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
