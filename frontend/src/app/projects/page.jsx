'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '../../components/app-shell';
import { KanbanBoard } from '../../components/kanban-board';
import { api, getAuthHeaders } from '../../lib/api';

export default function ProjectsPage() {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/api/projects', { headers: getAuthHeaders() })).data
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks-kanban'],
    queryFn: async () => (await api.get('/api/tasks', { headers: getAuthHeaders() })).data
  });

  const createProject = useMutation({
    mutationFn: async () =>
      api.post(
        '/api/projects',
        { name },
        {
          headers: getAuthHeaders()
        }
      ),
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const projectItems = useMemo(() => projectsQuery.data?.items || [], [projectsQuery.data]);

  return (
    <AppShell title="Projects & Kanban">
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-600">Create a new project</p>
          <div className="flex gap-3">
            <input
              suppressHydrationWarning
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Launch campaign"
            />
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              onClick={() => createProject.mutate()}
            >
              Create
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectItems.map((project) => (
            <article key={project.id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
              <h2 className="font-semibold">{project.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Status: {project.status}</p>
              <p className="mt-2 text-xs text-slate-400">Asana-like views: Kanban / List / Timeline</p>
            </article>
          ))}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-600">Drag-and-drop Kanban</h2>
          <KanbanBoard tasks={tasksQuery.data || []} />
        </section>
      </div>
    </AppShell>
  );
}
