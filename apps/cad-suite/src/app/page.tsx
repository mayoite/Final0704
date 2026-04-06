import Link from "next/link";

export default function Home() {
  const tools = [
    {
      title: "Planner",
      description:
        "Guided room planning, furniture placement, and BOQ review for client-facing workspace layouts.",
      href: "/planner",
      status: "Ready",
    },
    {
      title: "Draw",
      description:
        "Direct 2D drafting workspace for fast shell creation, measurement, and layout iteration.",
      href: "/draw",
      status: "Ready",
    },
    {
      title: "Configurator",
      description:
        "3D configuration workspace. The route is live and positioned for the next stage of viewer wiring.",
      href: "/configurator",
      status: "Preview",
    },
  ] as const;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200/80">
            One&Only CAD Suite
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Launch the workspace tools that are actually wired in this app.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            The CAD suite now opens on a real landing page instead of the default Next.js starter.
            Use Planner for guided layouts, Draw for the drafting surface, and Configurator for the
            current 3D workbench entrypoint.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-48px_rgba(59,130,246,0.6)] transition hover:-translate-y-1 hover:border-sky-300/40 hover:bg-white/8"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">{tool.title}</h2>
                <span className="rounded-full border border-sky-200/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                  {tool.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{tool.description}</p>
              <div className="mt-8 text-sm font-semibold text-sky-200 transition group-hover:text-white">
                Open workspace
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
