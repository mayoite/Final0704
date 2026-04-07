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
    <main className="min-h-screen bg-page text-body">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="max-w-3xl">
          <p className="typ-eyebrow text-[color:var(--planner-accent-strong)]">One&Only CAD Suite</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-[300] tracking-[-0.05em] text-[color:var(--planner-text-strong)] sm:text-5xl">
            Launch the workspace tools that are actually wired in this app.
          </h1>
          <p className="mt-5 max-w-2xl typ-lead text-muted">
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
              className="group rounded-[1.8rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-6 shadow-theme-float transition hover:-translate-y-1 hover:border-[color:var(--planner-primary)]/35 hover:bg-[color:var(--planner-primary-soft)]/45"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="typ-h3 text-[color:var(--planner-text-strong)]">{tool.title}</h2>
                <span
                  className={`rounded-full px-3 py-1 typ-eyebrow ${
                    tool.status === "Ready"
                      ? "border border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
                      : "border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/65 text-[color:var(--planner-accent-strong)]"
                  }`}
                >
                  {tool.status}
                </span>
              </div>
              <p className="mt-4 typ-caption-lg leading-6 text-muted">{tool.description}</p>
              <div className="mt-8 typ-cta text-[color:var(--planner-primary)] transition group-hover:text-[color:var(--planner-primary-hover)]">
                Open workspace
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
