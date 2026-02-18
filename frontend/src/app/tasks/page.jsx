'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function TasksPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const teamId = typeof window !== 'undefined' ? localStorage.getItem('teamId') : '';

  const { data } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => (await api.get('/api/tasks', { headers: { Authorization: `Bearer ${token}`, 'x-team-id': teamId } })).data
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <div className="space-y-3">{(data || []).map((t) => <div key={t.id} className="card"><h2>{t.title}</h2><p>Status: {t.status} | Priority: {t.priority}</p><p>Subtasks: {t.subtasks.length}, Dependencies: {t.dependenciesFrom.length}, Comments: {t.comments.length}</p></div>)}</div>
    </main>
  );
}
