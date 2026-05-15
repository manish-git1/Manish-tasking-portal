'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, isOverdue, daysUntil } from '@/lib/utils';
import { Task } from '@/store/taskStore';
import { Calendar, AlertCircle, CheckCircle2, Clock, Filter } from 'lucide-react';
import Link from 'next/link';

export default function MyTasksPage() {
  const { tasks, isLoading, fetchTasks, filter, setFilter } = useTasks();
  const [view, setView] = useState<'list' | 'kanban'>('list');

  useEffect(() => { fetchTasks({ status: filter.status === 'all' ? undefined : filter.status }); }, [fetchTasks, filter.status]);

  const grouped = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const stats = [
    { label: 'Total', value: tasks.length, icon: <Clock className="w-4 h-4" />, color: 'text-primary' },
    { label: 'In Progress', value: grouped.in_progress.length, icon: <AlertCircle className="w-4 h-4" />, color: 'text-blue-500' },
    { label: 'Completed', value: grouped.completed.length, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' },
    { label: 'Overdue', value: tasks.filter(t => isOverdue(t.deadline) && t.status !== 'completed').length, icon: <AlertCircle className="w-4 h-4" />, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'todo', 'in_progress', 'review', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter({ status: s })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter.status === s ? 'gradient-brand text-white' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>
              {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${view === 'list' ? 'bg-card border border-border' : 'text-muted-foreground'}`}>List</button>
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${view === 'kanban' ? 'bg-card border border-border' : 'text-muted-foreground'}`}>Kanban</button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([status, colTasks]) => (
            <div key={status} className="bg-accent/50 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{status.replace('_', ' ')}</span>
                <span className="text-xs font-bold bg-card border border-border rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map(task => <TaskCard key={task._id} task={task} />)}
                {colTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-card border border-border rounded-2xl shimmer" />) :
            tasks.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks assigned to you</p>
              </div>
            ) : tasks.map((task, i) => (
              <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <TaskCard task={task} detailed />
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, detailed }: { task: Task; detailed?: boolean }) {
  const overdue = isOverdue(task.deadline) && task.status !== 'completed';
  return (
    <Link href={`/member/task/${task._id}`}>
      <div className={`bg-card border rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${overdue ? 'border-rose-300 dark:border-rose-800' : 'border-border'}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{task.title}</h3>
          <Badge variant={task.priority} className="shrink-0">{task.priority}</Badge>
        </div>
        {detailed && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}
        <div className="flex items-center justify-between gap-2 mt-2">
          <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
          <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-rose-500 font-medium' : 'text-muted-foreground'}`}>
            {overdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            {overdue ? 'Overdue' : `${daysUntil(task.deadline)}d left`}
          </div>
        </div>
        {task.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {task.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] bg-accent px-2 py-0.5 rounded-full text-muted-foreground">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
