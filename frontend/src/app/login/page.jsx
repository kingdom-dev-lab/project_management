'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { api } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (event) => {
    event.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.defaultTeamId) localStorage.setItem('teamId', res.data.defaultTeamId);
      router.push('/dashboard');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold">
        <LogIn size={24} /> Login
      </h1>
      <form className="space-y-4" onSubmit={submit}>
        <input
          suppressHydrationWarning
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          suppressHydrationWarning
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white">Sign In</button>
      </form>
    </main>
  );
}
