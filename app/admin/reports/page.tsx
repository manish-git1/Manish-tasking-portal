'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import axios from 'axios';
import { TrendingUp, CheckSquare, Users, Clock, AlertTriangle, GitPullRequest } from 'lucide-react';

interface Analytics {
  stats: { totalTasks: number; completedTasks: number; totalUsers: number; pendingRequests: number; overdueTasks: number; completionRate: number };
  tasksByStatus: { _id: string; count: number }[];
  tasksByPriority: { _id: string; count: number }[];
  dailyTasks: { _id: string; count: number }[];
  topMembers: { name: string; email: string; completed: number }[];
}

const STATUS_COLORS: Record<string, string> = { todo: '#64748b', in_progress: '#3b82f6', review: '#8b5cf6', completed: '#10b981' };
const PRIORITY_COLORS: Record<string, string> = { low: '#64748b', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };

export default function AdminReportsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics').then(r => { setData(r.data.data); setLoading(false); });
  }, []);

  if (loading || !data) return <div className="grid grid-cols-1 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-card border border-border rounded-2xl shimmer" />)}</div>;

  const kpis = [
    { label: 'Total Tasks', value: data.stats.totalTasks, icon: <CheckSquare className="w-5 h-5" />, bg: 'text-primary' },
    { label: 'Completion Rate', value: `${data.stats.completionRate}%`, icon: <TrendingUp className="w-5 h-5" />, bg: 'text-emerald-500' },
    { label: 'Active Members', value: data.stats.totalUsers, icon: <Users className="w-5 h-5" />, bg: 'text-violet-500' },
    { label: 'Overdue Tasks', value: data.stats.overdueTasks, icon: <AlertTriangle className="w-5 h-5" />, bg: 'text-rose-500' },
    { label: 'Pending Requests', value: data.stats.pendingRequests, icon: <GitPullRequest className="w-5 h-5" />, bg: 'text-amber-500' },
    { label: 'Completed', value: data.stats.completedTasks, icon: <Clock className="w-5 h-5" />, bg: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className={`flex justify-center mb-2 ${k.bg}`}>{k.icon}</div>
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Daily Task Activity (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.dailyTasks}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#colorCount)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.tasksByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                {data.tasksByStatus.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e._id] || '#6366f1'} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Priority Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.tasksByPriority}>
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.tasksByPriority.map((e, i) => <Cell key={i} fill={PRIORITY_COLORS[e._id] || '#6366f1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Top Contributors</h2>
          <div className="space-y-3">
            {data.topMembers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>}
            {data.topMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                <div className="w-8 h-8 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center">
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <div className="w-full bg-accent rounded-full h-1.5 mt-1">
                    <div className="gradient-brand h-1.5 rounded-full" style={{ width: `${Math.min(100, (m.completed / (data.topMembers[0]?.completed || 1)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-500 shrink-0">{m.completed}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
