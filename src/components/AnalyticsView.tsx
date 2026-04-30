import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Task } from '../db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

import { translations, Language } from '../lib/i18n';

interface AnalyticsViewProps {
  tasks: Task[];
  lang: Language;
}

export function AnalyticsView({ tasks, lang }: AnalyticsViewProps) {
  const t = translations[lang].analytics;
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const chartData = [
    { name: t.backlog, value: stats.todo, color: '#6366f1' },
    { name: t.inProgress, value: stats.progress, color: '#10b981' },
    { name: t.done, value: stats.done, color: '#71717a' },
  ];

  const pieData = [
    { name: t.backlog, value: stats.todo },
    { name: t.inProgress, value: stats.progress },
    { name: t.done, value: stats.done },
  ];

  const COLORS = ['#6366f1', '#10b981', '#71717a'];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">{t.header}</h2>
          <p className="text-zinc-500 text-sm">{t.subHeader}</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<AlertCircle className="text-indigo-400" />} label={t.backlog} value={stats.todo} color="indigo" todayLabel={t.todayLabel} />
          <StatCard icon={<Clock className="text-emerald-400" />} label={t.inProgress} value={stats.progress} color="emerald" todayLabel={t.todayLabel} />
          <StatCard icon={<CheckCircle className="text-zinc-400" />} label={t.done} value={stats.done} color="zinc" todayLabel={t.todayLabel} />
          <StatCard icon={<TrendingUp className="text-purple-400" />} label={t.total} value={stats.total} color="purple" todayLabel={t.todayLabel} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Desempenho por Estágio
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}
                    itemStyle={{ color: '#fafafa' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2 self-start w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t.completionRate}
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">{t.completionIndex}:</span>
                <span className="text-white font-bold">{stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> {t.activityTitle}
            </h3>
            <div className="space-y-4">
              {[...tasks].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()).slice(0, 5).map((task, i) => (
                <div key={task.id} className="flex items-start gap-4 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    task.status === 'done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                    task.status === 'in_progress' ? 'bg-indigo-500' : 'bg-zinc-700'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                      {t.activityStatus}: {task.status} • {new Date(task.updatedAt!).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono border-zinc-800 bg-zinc-950 text-zinc-400">
                    SINC
                  </Badge>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="py-10 text-center text-zinc-600 italic text-sm">
                  {t.noActivity}
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> {t.insightsTitle}
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-xs text-indigo-300 leading-relaxed italic">
                  "{t.insightsProd.replace('{done}', stats.done.toString())}"
                </p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300 leading-relaxed italic">
                  "{t.insightsBacklog.replace('{todo}', stats.todo.toString())}"
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
  );
}

function StatCard({ icon, label, value, color, todayLabel }: { icon: React.ReactNode, label: string, value: number, color: string, todayLabel: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
          {icon}
        </div>
        <Badge variant="outline" className="text-[10px] bg-zinc-950 font-mono text-zinc-500 border-zinc-800">
          {todayLabel}
        </Badge>
      </div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{label}</p>
      <h4 className="text-3xl font-bold text-white mt-1 tabular-nums">{value}</h4>
    </motion.div>
  );
}
