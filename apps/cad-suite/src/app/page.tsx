import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-page text-body">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-9rem] h-[26rem] w-[26rem] rounded-full bg-[color:var(--planner-primary)]/12 blur-3xl" />
        <div className="absolute right-[-9rem] top-[10%] h-[30rem] w-[30rem] rounded-full bg-[color:var(--planner-accent)]/14 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[14%] h-[24rem] w-[24rem] rounded-full bg-white/80 blur-3xl" />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(24,64,122,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(24,64,122,0.06) 1px, transparent 1px)",
            backgroundPosition: "center",
            backgroundSize: "72px 72px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.72), rgba(0,0,0,0.14))",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/75 via-white/24 to-transparent" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-16 sm:px-10 2xl:px-0">
        <div className="grid w-full gap-12 xl:grid-cols-[minmax(0,1.02fr)_minmax(26rem,0.98fr)] xl:items-center">
          <div className="max-w-3xl">
            <p className="typ-eyebrow text-[color:var(--planner-accent-strong)]">One&Only CAD Suite</p>
            <h1 className="mt-5 max-w-5xl text-4xl font-[280] leading-[0.95] tracking-[-0.06em] text-[color:var(--planner-text-strong)] sm:text-5xl xl:text-[4.8rem]">
              Planner now.
              <br />
              3D view when today&apos;s layout is ready.
            </h1>
            <p className="mt-6 max-w-2xl typ-lead text-muted">
              This landing route should launch two clear paths: Planner for active layout work, and
              3D View for the next viewer pass when you pick it up later today. Draw stays available
              as the drafting utility, but it should not compete with the main launch surface.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--planner-primary)] px-5 py-3 text-sm font-semibold text-white shadow-theme-float transition hover:bg-[color:var(--planner-primary-hover)]"
              >
                Open Planner
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/configurator"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--planner-border-strong)] bg-white/70 px-5 py-3 text-sm font-semibold text-[color:var(--planner-text-strong)] shadow-theme-panel transition hover:border-[color:var(--planner-primary)]/35 hover:bg-white"
              >
                Open 3D View
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-[color:var(--planner-text-body)] shadow-theme-panel">
                Guided Planner
              </div>
              <div className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-[color:var(--planner-text-body)] shadow-theme-panel">
                3D Viewer Route
              </div>
              <Link
                href="/draw"
                className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-[color:var(--planner-text-body)] shadow-theme-panel transition hover:border-[color:var(--planner-primary)]/30 hover:text-[color:var(--planner-primary)]"
              >
                Open Draw
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_52%),radial-gradient(circle_at_bottom_right,rgba(176,140,93,0.18),transparent_42%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.35rem] border border-white/80 bg-[color:var(--planner-panel-strong)]/88 p-5 shadow-theme-float backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="typ-eyebrow text-[color:var(--planner-accent-strong)]">Launch Surface</p>
                  <h2 className="mt-2 text-2xl font-[340] tracking-[-0.04em] text-[color:var(--planner-text-strong)]">
                    Planner and 3D are the primary paths.
                  </h2>
                </div>
                <div className="rounded-full border border-[color:var(--planner-border-soft)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--planner-text-subtle)]">
                  Live Routes
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <Link
                  href="/planner"
                  className="group relative overflow-hidden rounded-[1.8rem] border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(237,243,250,0.8))] p-5 shadow-theme-panel transition hover:-translate-y-1 hover:border-[color:var(--planner-primary)]/35"
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-65"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(24,64,122,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(24,64,122,0.08) 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="typ-eyebrow text-[color:var(--planner-primary)]">Planner</p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          Guided shell setup, zone planning, product placement, and quote-ready review.
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-[color:var(--planner-primary)]" />
                    </div>

                    <div className="mt-5 rounded-[1.45rem] border border-white/90 bg-white/84 p-4 shadow-theme-panel">
                      <div className="relative h-52 overflow-hidden rounded-[1.15rem] border border-[color:var(--planner-border-soft)] bg-[linear-gradient(180deg,rgba(250,252,255,0.98),rgba(238,244,250,0.88))] p-4">
                        <div className="absolute inset-x-8 top-8 h-28 rounded-[1.5rem] border border-dashed border-[color:var(--planner-primary)]/35" />
                        <div className="absolute left-12 top-12 h-20 w-28 rounded-[1.15rem] border border-[color:var(--planner-primary)]/30 bg-[color:var(--planner-primary)]/8" />
                        <div className="absolute right-14 top-12 h-24 w-24 rounded-[1.25rem] border border-[color:var(--planner-accent)]/34 bg-[color:var(--planner-accent-soft)]/44" />
                        <div className="absolute bottom-12 left-12 h-10 w-32 rounded-full border border-[color:var(--planner-border-soft)] bg-white/88" />
                        <div className="absolute bottom-12 right-12 h-12 w-24 rounded-[1rem] border border-[color:var(--planner-border-soft)] bg-white/92 shadow-[0_12px_28px_rgba(15,23,42,0.08)]" />
                        <div className="absolute left-1/2 top-5 h-3 w-28 -translate-x-1/2 rounded-full bg-[color:var(--planner-primary)]/10" />
                        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--planner-text-subtle)]">
                          <span>Room Shell</span>
                          <span>Furniture</span>
                          <span>BOQ</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--planner-primary)] transition group-hover:text-[color:var(--planner-primary-hover)]">
                      Open Planner
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>

                <Link
                  href="/configurator"
                  className="group relative overflow-hidden rounded-[1.8rem] border border-[color:var(--planner-border-soft)] bg-[linear-gradient(180deg,rgba(19,33,61,0.96),rgba(9,18,36,0.98))] p-5 text-white shadow-theme-float transition hover:-translate-y-1 hover:border-white/35"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(89,138,215,0.3),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(176,140,93,0.22),transparent_45%)]" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="typ-eyebrow text-[color:var(--planner-accent)]">3D View</p>
                        <p className="mt-2 text-sm leading-6 text-white/72">
                          Open the live viewer route and inspect the planner document as a spatial scene.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80">
                        Viewer
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.45rem] border border-white/10 bg-white/6 p-4">
                      <div className="relative h-52 overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,31,0.92),rgba(14,23,45,0.96))]">
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.05))]" />
                        <div className="absolute left-10 top-16 h-20 w-24 rounded-[1rem] border border-white/10 bg-white/8 shadow-[0_20px_40px_rgba(0,0,0,0.35)]" />
                        <div className="absolute left-[8.75rem] top-[4.4rem] h-16 w-16 rounded-[0.9rem] border border-white/10 bg-[color:var(--planner-accent)]/18 shadow-[0_20px_40px_rgba(0,0,0,0.28)]" />
                        <div className="absolute right-12 top-12 h-24 w-24 rounded-[1.15rem] border border-white/10 bg-[color:var(--planner-primary)]/18 shadow-[0_24px_44px_rgba(0,0,0,0.32)]" />
                        <div className="absolute bottom-10 left-1/2 h-14 w-40 -translate-x-1/2 rounded-full border border-white/10 bg-white/8 blur-[1px]" />
                        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                          <span>Scene</span>
                          <span>Camera</span>
                          <span>Export</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:text-[color:var(--planner-accent)]">
                      Open 3D View
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </div>

              <div className="mt-4 rounded-[1.55rem] border border-[color:var(--planner-border-soft)] bg-white/78 p-4 text-sm text-[color:var(--planner-text-body)] shadow-theme-panel">
                Use <Link href="/draw" className="font-semibold text-[color:var(--planner-primary)]">Draw</Link> when you want the
                drafting-first surface. The landing page now stays intentionally split into two primary containers only:
                Planner and 3D View.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
