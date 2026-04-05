import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tmp Access Lab",
  description: "Temporary access page for local planner repos in tmp.",
  robots: {
    index: false,
    follow: false,
  },
};

const projects = [
  {
    title: "arcada-planner-main",
    path: "tmp/arcada-planner-main",
    stack: "Vite + React 18",
    install: "npm install",
    run: "npm run dev -- --port 3201",
    build: "npm run build",
    previewHref: "http://localhost:3201",
  },
  {
    title: "React floor planner (working copy)",
    path: "tmp/ej2-showcase-react-floor-planner-1003791-dependabot/ej2-showcase-react-floor-planner-1003791-dependabot",
    stack: "Webpack + React 18 (copied variant)",
    install: "npm install",
    run: "npm start -- --port 3205 --no-open",
    build: "npm run build",
    previewHref: "http://localhost:3205",
  },
];

export default function TmpAccessPage() {
  return (
    <section className="min-h-screen bg-panel">
      <section className="border-b border-soft bg-hover/70">
        <div className="mx-auto max-w-[1840px] px-4 py-5 md:px-6 2xl:px-8">
          <p className="typ-caption-lg font-medium text-subtle">Temporary Access</p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight text-strong md:text-xl">
            Tmp Workspace Launchpad
          </h1>
          <p className="mt-1.5 max-w-4xl text-sm leading-6 text-body">
            Partner workflow: keep experiments isolated, test quickly, then decide what deserves
            real integration. This page is a jump-point only, not a production mount.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1840px] px-4 py-6 md:px-6 md:py-8 2xl:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.title}
              className="rounded-[1.2rem] border border-soft bg-panel p-4 shadow-sm"
            >
              <h2 className="text-base font-semibold text-strong">{project.title}</h2>
              <p className="mt-1 text-xs text-muted">{project.stack}</p>

              <div className="mt-3 rounded-[1rem] border border-soft bg-hover px-3 py-2.5">
                <p className="typ-caption-lg font-medium text-subtle">Path</p>
                <p className="mt-1 break-all font-mono text-xs text-body">{project.path}</p>
              </div>

              <div className="mt-3 rounded-[1rem] border border-soft bg-hover px-3 py-2.5">
                <p className="typ-caption-lg font-medium text-subtle">Commands</p>
                <p className="mt-1 font-mono text-xs text-body">install: {project.install}</p>
                <p className="mt-1 font-mono text-xs text-body">run: {project.run}</p>
                <p className="mt-1 font-mono text-xs text-body">build: {project.build}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={project.previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-full border border-soft bg-panel px-4 text-sm font-medium text-strong transition hover:border-primary/40"
                >
                  Open local preview
                </a>
                <a
                  href={`file:///D:/Claude1703/${project.path.replace(/ /g, "%20")}`}
                  className="inline-flex h-10 items-center rounded-full border border-soft bg-panel px-4 text-sm font-medium text-strong transition hover:border-primary/40"
                >
                  Open folder
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}


