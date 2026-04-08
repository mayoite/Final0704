import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { LucideIcon } from "lucide-react"
import {
  LayoutGrid,
  GitFork,
  Settings2,
  PenSquare,
  ShoppingCart,
  BookOpen,
  MessageSquare,
  LogIn,
  ExternalLink,
  Package,
} from "lucide-react"

type AdminCard = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  badge?: string
}

const ADMIN_CARDS: AdminCard[] = [
  {
    title: "Space Planner Hub",
    description: "Overhaul tracker, stage roadmap, and dependency table",
    href: "/ops/planner-overhaul",
    icon: LayoutGrid,
    badge: "ops",
  },
  {
    title: "System Flowchart",
    description: "5 stages: Discover → Plan → Quote → Deliver → Manage",
    href: "/ops/planner-lab/flowchart",
    icon: GitFork,
    badge: "ops",
  },
  {
    title: "Planner v2 Setup",
    description: "Room setup wizard and session initialisation",
    href: "/planner2",
    icon: Settings2,
  },
  {
    title: "Planner Canvas",
    description: "Full Konva canvas with PDF export and cloud saves",
    href: "/planner2/canvas",
    icon: PenSquare,
  },
  {
    title: "Configurator",
    description: "Product configuration and bundle builder",
    href: "/configurator",
    icon: Package,
  },
  {
    title: "Quote Cart",
    description: "Quote builder and line-item management",
    href: "/quote-cart",
    icon: ShoppingCart,
  },
  {
    title: "Catalog",
    description: "Full product catalog browser",
    href: "/catalog",
    icon: BookOpen,
  },
  {
    title: "Contact Submissions",
    description: "Inbound queries and leads from the website",
    href: "/admin/contacts",
    icon: MessageSquare,
    badge: "crm",
  },
  {
    title: "Partner Portal Login",
    description: "Sign-in page for partners and clients",
    href: "/login",
    icon: LogIn,
  },
]

// Badge background colours for each badge label
const BADGE_STYLES: Record<string, string> = {
  ops: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  crm: "bg-amber-500/10 text-warning",
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      {/* ── Page header ───────────────────────────────────────── */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-inverse">Internal Hub</h1>
          <p className="mt-1 text-sm text-inverse-muted">
            AFC India — workspace tools and ops dashboards
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-theme-inverse surface-overlay-08 px-3 py-2 text-xs text-inverse-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
          {user?.email ?? "—"}
        </div>
      </div>

      {/* ── Tool cards grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group relative flex flex-col rounded-2xl border border-theme-inverse surface-canvas-soft p-5 transition hover:border-[var(--color-primary)]/40 hover-surface-08"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl surface-overlay-08 ring-1 ring-[var(--border-inverse)]">
                  <Icon className="h-4 w-4 text-inverse-muted transition group-hover:text-inverse" />
                </div>
                <div className="flex items-center gap-1.5">
                  {card.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 typ-caption font-semibold uppercase tracking-wide ${
                        BADGE_STYLES[card.badge] ?? "surface-overlay-08 text-inverse-muted"
                      }`}
                    >
                      {card.badge}
                    </span>
                  )}
                  <ExternalLink className="h-3 w-3 text-inverse-subtle opacity-0 transition group-hover:opacity-100" />
                </div>
              </div>
              <p className="text-sm font-semibold text-inverse">{card.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-inverse-muted">{card.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
