'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { api } from '../../lib/api';

const fields = [
  ['systemName', 'System Name'],
  ['dbHost', 'Database Host (optional for SQLite one-click)'],
  ['dbName', 'Database Name (optional)'],
  ['dbUser', 'Database User (optional)'],
  ['dbPassword', 'Database Password (optional)'],
  ['adminEmail', 'Admin Email'],
  ['adminPassword', 'Admin Password']
];

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    systemName: 'ProjectFlow',
    dbHost: '',
    dbName: '',
    dbUser: '',
    dbPassword: '',
    adminEmail: 'admin@example.com',
    adminPassword: 'password123'
  });

  useEffect(() => {
    api.get('/api/setup/status').then((res) => {
      if (res.data.installed) router.replace('/login');
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="p-8">Checking installation status...</div>;

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/api/setup', form);
    router.push('/login');
  };

  return (
    <main className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold">
        <Rocket size={24} /> One-Click Setup Wizard
      </h1>
      <form className="space-y-4" onSubmit={submit}>
        {fields.map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-sm text-slate-600">{label}</span>
            <input
              suppressHydrationWarning
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type={key.includes('Password') ? 'password' : 'text'}
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              required={key === 'systemName' || key === 'adminEmail' || key === 'adminPassword'}
            />
          </label>
        ))}
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">Install Now</button>
      </form>
    </main>
  );
}
