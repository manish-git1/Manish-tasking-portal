'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatRelative, isOverdue, getInitials } from '@/lib/utils';
import { Task } from '@/store/taskStore';
import { ArrowLeft, Calendar, MessageSquare, Send, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'completed'];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateStatus, addComment, requestReschedule } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ newDeadline: '', reason: '' });
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    axios.get(`/api/tasks/${id}`).then(r => { setTask(r.data.data.task); setLoading(false); }).catch(() => { toast.error('Task not found'); router.push('/member/my-tasks'); });
  }, [id, router]);

  const handleStatusChange = async (status: string) => {
    if (!task) return;
    const updated = await updateStatus(task._id, status);
    setTask(updated);
  };

  const handleComment = async () => {
    if (!comment.trim() || !task) return;
    setSubmitting(true);
    try { const updated = await addComment(task._id, comment); setTask(updated); setComment(''); }
    finally { setSubmitting(false); }
  };

  const handleReschedule = async () => {
    if (!task) return;
    setRescheduling(true);
    try {
      await requestReschedule(task._id, rescheduleForm.newDeadline, rescheduleForm.reason);
      setShowReschedule(false);
      setRescheduleForm({ newDeadline: '', reason: '' });
    } finally { setRescheduling(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-card border border-border rounded-xl shimmer" />
      <div className="h-64 bg-card border border-border rounded-2xl shimmer" />
    </div>
  );

  if (!task) return null;
  const overdue = isOverdue(task.deadline) && task.status !== 'completed';

  return (
    <div className="max-w-4xl space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Tasks
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Title + Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-2">{task.title}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={task.priority}>{task.priority}</Badge>
              <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
              {overdue && <span className="status-badge bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"><AlertCircle className="w-3 h-3" />Overdue</span>}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowReschedule(true)}>
            <Clock className="w-4 h-4" /> Request Reschedule
          </Button>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Description</h2>
          <p className="text-sm leading-relaxed">{task.description}</p>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-accent/50 rounded-xl">
          {[
            { label: 'Assigned To', value: task.assignedTo?.name },
            { label: 'Created By', value: task.createdBy?.name },
            { label: 'Deadline', value: formatDate(task.deadline) },
            { label: 'Department', value: task.assignedTo?.department || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Status Update */}
        {user?.role === 'member' && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Update Status</h2>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${task.status === s ? 'gradient-brand text-white border-transparent' : 'border-border hover:bg-accent'}`}>
                  {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tags</h2>
            <div className="flex gap-2 flex-wrap">
              {task.tags.map(tag => <span key={tag} className="px-3 py-1 bg-accent rounded-full text-xs text-muted-foreground">#{tag}</span>)}
            </div>
          </div>
        )}
      </motion.div>

      {/* Comments */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Comments ({task.comments.length})</h2>
        <div className="space-y-4 mb-5">
          {task.comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>}
          {task.comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">{getInitials(c.authorName)}</div>
              <div className="flex-1 bg-accent/50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">{c.authorName}</span>
                  <span className="text-[10px] text-muted-foreground">{formatRelative(c.createdAt)}</span>
                </div>
                <p className="text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">{getInitials(user?.name || '?')}</div>
          <div className="flex-1 flex gap-2">
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment or progress note…" rows={2}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
              className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            <Button size="icon" isLoading={submitting} onClick={handleComment}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </motion.div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-1">Request Deadline Extension</h2>
            <p className="text-sm text-muted-foreground mb-5">Current deadline: <span className="font-medium text-foreground">{formatDate(task.deadline)}</span></p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">New Deadline</label>
                <input type="date" value={rescheduleForm.newDeadline} onChange={e => setRescheduleForm(p => ({ ...p, newDeadline: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Reason (min 10 chars)</label>
                <textarea value={rescheduleForm.reason} onChange={e => setRescheduleForm(p => ({ ...p, reason: e.target.value }))} rows={3} placeholder="Explain why you need more time…"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowReschedule(false)}>Cancel</Button>
              <Button className="flex-1" isLoading={rescheduling} onClick={handleReschedule}>Submit Request</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
