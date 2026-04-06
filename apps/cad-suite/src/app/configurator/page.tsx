import Link from "next/link";

export default function ConfiguratorPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50 sm:px-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.9)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200/80">
          Configurator
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          3D configuration entrypoint is live.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
          This route now presents a usable status page instead of raw placeholder text. The next
          step is wiring the production model set and viewer state into this surface.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/planner"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:border-sky-300/40 hover:bg-white/10"
          >
            Open Planner
          </Link>
          <Link
            href="/draw"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:border-sky-300/40 hover:bg-white/10"
          >
            Open Draw Workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
