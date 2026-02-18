'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const teamId = typeof window !== 'undefined' ? localStorage.getItem('teamId') : '';

  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/api/projects', { headers: { Authorization: `Bearer ${token}`, 'x-team-id': teamId } })).data
  });

  const create = useMutation({
    mutationFn: () => api.post('/api/projects', { name }, { headers: { Authorization: `Bearer ${token}`, 'x-team-id': teamId } }),
    onSuccess: () => { setName(''); qc.invalidateQueries({ queryKey: ['projects'] }); }
  });

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Projects</h1>
      <div className="card flex gap-3"><input className="border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} placeholder="New project" /><button className="bg-blue-600 text-white px-3 rounded" onClick={() => create.mutate()}>Create</button></div>
      <div className="grid md:grid-cols-3 gap-4">{(data || []).map((p) => <article className="card" key={p.id}><h2 className="font-semibold">{p.name}</h2><p className="text-sm text-slate-500">Kanban/List/Gantt available</p></article>)}</div>
    </main>
  );
}
