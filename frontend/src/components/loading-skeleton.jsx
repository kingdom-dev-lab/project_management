export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 rounded-xl bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-64 rounded-xl bg-slate-100" />
        <div className="h-64 rounded-xl bg-slate-100" />
      </div>
      <div className="h-64 rounded-xl bg-slate-100" />
    </div>
  );
}
