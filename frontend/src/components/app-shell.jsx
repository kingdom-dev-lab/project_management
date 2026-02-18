'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FolderKanban, LayoutDashboard, ListTodo, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/dashboard#analytics', label: 'Analytics', icon: BarChart3 }
];

export function AppShell({ title, children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="w-72 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">ProjectFlow</p>
              <p className="font-semibold">One-Click SaaS</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:translate-x-1'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
