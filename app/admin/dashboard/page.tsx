'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/Card';
import { CheckSquare, Users, Clock, TrendingUp, AlertTriangle, GitPullRequest } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';
import { formatDate } from '@/lib/utils';

interface Analytics {
  stats: { totalTasks: number; completedTasks: number; totalUsers: number; pendingRequests: number; overdueTasks: number; completionRate: number };
  tasksByStatus: { _id: string; count: number }[];
  tasksByPriority: { _id: string; count: number }[];
  dailyTasks: { _id: string; count: number }[];
  topMembers: { name: string; email: string; completed: number }[];
}

const STATUS_COLORS: Record<string, string> = { todo: '#94a3b8', in_progress: '#0d9488', review: '#ea580c', completed: '#16a34a' };
const PRIORITY_COLORS: Record<string, string> = { low: '#94a3b8', medium: '#ca8a04', high: '#ea580c', urgent: '#dc2626' };

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics').then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-card border border-border rounded-2xl shimmer" />)}
    </div>
  );

  const { stats, tasksByStatus, tasksByPriority, dailyTasks, topMembers } = data || { stats: { totalTasks: 0, completedTasks: 0, totalUsers: 0, pendingRequests: 0, overdueTasks: 0, completionRate: 0 }, tasksByStatus: [], tasksByPriority: [], dailyTasks: [], topMembers: [] };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Tasks', value: stats.totalTasks, icon: <CheckSquare className="w-5 h-5" />, color: 'text-primary' },
          { title: 'Completed', value: stats.completedTasks, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-500' },
          { title: 'Active Members', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'text-violet-500' },
          { title: 'Pending Requests', value: stats.pendingRequests, icon: <GitPullRequest className="w-5 h-5" />, color: 'text-amber-500' },
          { title: 'Overdue', value: stats.overdueTasks, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-rose-500' },
          { title: 'Completion Rate', value: `${stats.completionRate}%`, icon: <Clock className="w-5 h-5" />, color: 'text-blue-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Tasks Line Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Tasks Created — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyTasks}>
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie: Tasks by Status */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={tasksByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={65} labelLine={false}>
                {tasksByStatus.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry._id] || '#6366f1'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={tasksByPriority} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="_id" type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {tasksByPriority.map((entry, i) => <Cell key={i} fill={PRIORITY_COLORS[entry._id] || '#6366f1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Performers */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Top Performers</h2>
          <div className="space-y-3">
            {topMembers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No completed tasks yet</p>}
            {topMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <span className="text-sm font-bold text-emerald-500">{m.completed} done</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
