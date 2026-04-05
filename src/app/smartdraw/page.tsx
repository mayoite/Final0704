import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Floor Planner Editor | One&Only",
  description: "Use our interactive 2D diagram builder to visualize and draw your workspace floor plans.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SmartDrawPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-page">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-soft px-4 bg-panel">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold tracking-wide text-strong">One&Only / SmartDraw Configurator</span>
          <span className="rounded-full border border-soft bg-hover px-2 py-0.5 typ-caption uppercase tracking-wider text-muted">BETA</span>
        </div>
        <div>
          <a
            href="/planning"
            className="text-xs font-medium text-body hover:text-primary transition"
          >
            Exit planner
          </a>
        </div>
      </header>
      
      <main className="flex-1 relative w-full h-full">
        {/* We iframe the statically built Syncfusion floor planner to isolate its React version, CSS, and DOM requirements from the Next.js App Router. */}
        <iframe
          src="/smartdraw/index.html"
          className="absolute inset-0 w-full h-full border-0 bg-page"
          title="Floor Planner Diagram Builder"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        >
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted">
            Your browser does not support iframes. Please update your browser to use the Floor Planner.
          </div>
        </iframe>
      </main>
    </div>
  )
}
