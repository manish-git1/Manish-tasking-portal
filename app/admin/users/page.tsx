'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getInitials, formatDate } from '@/lib/utils';
import { Search, UserPlus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User { _id: string; name: string; email: string; role: string; department?: string; isActive: boolean; createdAt: string; lastLogin?: string; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/users?search=${search}`);
      setUsers(data.data.users);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (u: User) => {
    await axios.patch(`/api/admin/users/${u._id}`, { isActive: !u.isActive });
    toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`);
    fetchUsers();
  };

  const deleteUser = async (u: User) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    await axios.delete(`/api/admin/users/${u._id}`);
    toast.success('User deleted');
    fetchUsers();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="h-9 pl-9 pr-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary w-56" />
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}><UserPlus className="w-4 h-4" /> Add User</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-left text-xs text-muted-foreground font-medium">
              {['User', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(4)].map((_, i) => (
              <tr key={i} className="border-b border-border"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-accent rounded shimmer" /></td></tr>
            )) : users.map((u, i) => (
              <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={u.role}>{u.role}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{u.department || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleActive(u)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteUser(u)} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-muted-foreground hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetchUsers(); }} />}
    </div>
  );
}

function CreateUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: 'Taskflow@123', role: 'member', department: '' });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await axios.post('/api/admin/users', form); toast.success('User created!'); onSaved(); }
    catch (e: unknown) { toast.error(axios.isAxiosError(e) ? e.response?.data?.message : 'Failed'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold mb-5">Add New User</h2>
        <div className="space-y-4">
          {[{ label: 'Full Name', key: 'name', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Password', key: 'password', type: 'text' }, { label: 'Department', key: 'department', type: 'text' }].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium block mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium block mb-1.5">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="member">Team Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" isLoading={saving} onClick={save}>Create User</Button>
        </div>
      </motion.div>
    </div>
  );
}
