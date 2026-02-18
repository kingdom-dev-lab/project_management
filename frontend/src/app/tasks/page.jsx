'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '../../components/app-shell';
import { api, getAuthHeaders } from '../../lib/api';

export default function TasksPage() {
  const { data } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => (await api.get('/api/tasks', { headers: getAuthHeaders() })).data
  });

  return (
    <AppShell title="Tasks List View">
      <div className="space-y-3">
        {(data || []).map((task) => (
          <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold">{task.title}</h2>
            <p className="text-sm text-slate-500">Status: {task.status} • Priority: {task.priority}</p>
            <p className="mt-1 text-xs text-slate-400">
              Subtasks: {task.subtasks.length} | Dependencies: {task.dependenciesFrom.length} | Comments: {task.comments.length}
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
