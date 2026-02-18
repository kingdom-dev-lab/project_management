'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

const fields = [
  ['systemName', 'System Name'],
  ['dbHost', 'Database Host'],
  ['dbName', 'Database Name'],
  ['dbUser', 'Database User'],
  ['dbPassword', 'Database Password'],
  ['adminEmail', 'Admin Email'],
  ['adminPassword', 'Admin Password']
];

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    systemName: 'ProjectFlow',
    dbHost: 'db',
    dbName: 'projectflow',
    dbUser: 'postgres',
    dbPassword: 'postgres',
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

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/api/setup', form);
    router.push('/login');
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">First-Time Setup Wizard</h1>
      <form className="card space-y-4" onSubmit={submit}>
        {fields.map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-sm text-slate-600">{label}</span>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              type={key.includes('Password') ? 'password' : 'text'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          </label>
        ))}
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Install Now</button>
      </form>
    </main>
  );
}
