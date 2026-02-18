'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function Dashboard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const teamId = typeof window !== 'undefined' ? localStorage.getItem('teamId') : '';

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/api/dashboard', { headers: { Authorization: `Bearer ${token}`, 'x-team-id': teamId } })).data
  });

  return (
    <main className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <nav className="space-x-4">
          <Link href="/projects">Projects</Link>
          <Link href="/tasks">Tasks</Link>
        </nav>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card"><h2>Due Today</h2><p className="text-2xl">{data?.dueToday ?? 0}</p></div>
        <div className="card"><h2>Overdue</h2><p className="text-2xl">{data?.overdue ?? 0}</p></div>
        <div className="card md:col-span-2"><h2>Team Workload</h2><pre>{JSON.stringify(data?.workload || {}, null, 2)}</pre></div>
      </section>
      <section className="card">
        <h2 className="font-semibold mb-2">Project Progress %</h2>
        <ul>{(data?.projectProgress || []).map((p) => <li key={p.projectId}>{p.name}: {p.progress}%</li>)}</ul>
      </section>
    </main>
  );
}
