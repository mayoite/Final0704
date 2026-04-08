"use client";
import Link from "next/link";

const CRM_MODULES = [
  {
    title: "Lead Pipeline",
    description: "Track inbound leads from website, showroom, and referrals. Manage lead status and assign to sales reps.",
  },
  {
    title: "Client Dashboard",
    description: "Unified view of each client's projects, quotes, and communication history.",
  },
  {
    title: "Project Tracker",
    description: "Monitor active projects from quote acceptance through delivery and installation.",
  },
  {
    title: "Quote Archive",
    description: "Full history of generated BOQs and proposals, linked to client records.",
  },
];

export default function CrmPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-inverse-subtle">
          Internal Module
        </div>
        <h1 className="mb-2 text-3xl font-bold text-inverse">CRM Module</h1>
        <p className="mb-8 text-sm text-inverse-muted">
          Accessible from{" "}
          <Link href="/admin" className="text-[var(--color-primary)] hover:underline">
            /admin
          </Link>{" "}
          after 2FA authentication
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CRM_MODULES.map((mod) => (
            <div
              key={mod.title}
              className="rounded-xl border border-theme-inverse surface-canvas-soft p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-inverse">{mod.title}</h2>
                <span className="shrink-0 rounded-full border border-theme-inverse px-2 py-0.5 text-xs font-medium text-inverse-subtle">
                  Planned
                </span>
              </div>
              <p className="text-sm text-inverse-muted">{mod.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-sm text-inverse-subtle hover:text-inverse"
          >
            ← Back to Admin
          </Link>
          <p className="text-xs text-inverse-subtle">Accessible from /admin after 2FA authentication</p>
        </div>
      </div>
    </div>
  );
}
