'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Folder, ListChecks, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppShell } from '../../components/app-shell';
import { LoadingSkeleton } from '../../components/loading-skeleton';
import { api, getAuthHeaders } from '../../lib/api';

const cardMeta = [
  { key: 'totalProjects', label: 'Total Projects', icon: Folder },
  { key: 'activeTasks', label: 'Active Tasks', icon: ListChecks },
  { key: 'overdueTasks', label: 'Overdue Tasks', icon: AlertTriangle },
  { key: 'totalTeamMembers', label: 'Total Team Members', icon: Users }
];

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/api/dashboard/stats', { headers: getAuthHeaders() })).data
  });

  return (
    <AppShell title="Dashboard Overview">
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-6" id="analytics">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cardMeta.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-slate-500">{label}</p>
                  <Icon className="text-slate-400" size={18} />
                </div>
                <p className="text-3xl font-semibold tracking-tight">{data?.statCards?.[key] ?? 0}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-200 p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-600">Project Progress</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={data?.progressPie || []} outerRadius={100} fill="#3B82F6" label />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-600">Team Workload</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.workload || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="userId" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#6366F1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-600">Task Burn-down (Last 7 Days)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.burndown || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
