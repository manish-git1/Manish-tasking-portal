'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, isOverdue } from '@/lib/utils';
import { Task } from '@/store/taskStore';
import { Plus, Search, Trash2, Pencil, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Member {
  _id: string;
  name: string;
  email: string;
}

const emptyForm = {
  title: '',
  description: '',
  assignedTo: '',
  priority: 'medium',
  deadline: '',
  tags: '',
};

export default function AdminTasksPage() {
  const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask, filter, setFilter } = useTasks();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetchTasks({
      status: filter.status === 'all' ? undefined : filter.status,
      priority: filter.priority === 'all' ? undefined : filter.priority,
      search: search || undefined,
    });
  }, [fetchTasks, filter.status, filter.priority, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    axios.get('/api/admin/users?role=member').then((r) => setMembers(r.data.data.users));
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModal('create');
  };

  const openEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : String(task.assignedTo),
      priority: task.priority,
      deadline: task.deadline.slice(0, 10),
      tags: task.tags.join(', '),
    });
    setEditingId(task._id);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.assignedTo || !form.deadline) {
      toast.error('Fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo,
        priority: form.priority,
        deadline: form.deadline,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (modal === 'create') {
        await createTask(payload);
      } else if (editingId) {
        await updateTask(editingId, payload);
      }
      setModal(null);
      load();
    } catch {
      /* toast from hook */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task._id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <motion.div className="flex flex-wrap gap-2 items-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="h-9 pl-9 pr-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary w-52"
            />
          </motion.div>
          {['all', 'todo', 'in_progress', 'review', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter({ status: s })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter.status === s ? 'gradient-brand text-white' : 'bg-accent text-muted-foreground'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </motion.div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <motion.div className="overflow-x-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-accent/30">
              <tr className="text-left text-xs text-muted-foreground font-medium">
                {['Task', 'Assignee', 'Priority', 'Status', 'Deadline', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-accent rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : tasks.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        No tasks yet. Create your first task.
                      </td>
                    </tr>
                  )
                  : tasks.map((task, i) => {
                      const overdue = isOverdue(task.deadline) && task.status !== 'completed';
                      const assignee =
                        typeof task.assignedTo === 'object' ? task.assignedTo.name : '—';
                      return (
                        <motion.tr
                          key={task._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border last:border-0 hover:bg-accent/20"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium line-clamp-1">{task.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                              {task.description}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs">{assignee}</td>
                          <td className="px-4 py-3">
                            <Badge variant={task.priority}>{task.priority}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`flex items-center gap-1 text-xs ${overdue ? 'text-rose-500 font-medium' : 'text-muted-foreground'}`}
                            >
                              {overdue && <AlertCircle className="w-3 h-3" />}
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.deadline)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEdit(task)}
                                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(task)}
                                className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
            </tbody>
          </table>
        </motion.div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-bold mb-4">{modal === 'create' ? 'Create Task' : 'Edit Task'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <motion.div>
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </motion.div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Assignee *</label>
                  <select
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm"
                  >
                    <option value="">Select member</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm"
                  >
                    {['low', 'medium', 'high', 'urgent'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Deadline *</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="frontend, urgent"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : modal === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
