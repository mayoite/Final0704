import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { adminLogout } from "../actions"
import { LayoutDashboard, MessageSquare, LogOut } from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
]

/**
 * Protected admin shell layout.
 * Guards the 2FA cookie — any admin route that needs to sit behind 2FA
 * should live inside this (protected) group.
 * /admin/verify-2fa lives outside this group to avoid a redirect loop.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const twoFAVerified = cookieStore.get("admin_2fa_verified")?.value === "1"

  if (!twoFAVerified) {
    redirect("/admin/verify-2fa")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen bg-canvas text-inverse">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-theme-inverse surface-canvas-soft">
        {/* Brand */}
        <div className="border-b border-theme-inverse px-5 py-5">
          <p className="typ-caption font-bold uppercase tracking-widest text-inverse-subtle">
            AFC India
          </p>
          <p className="mt-0.5 text-base font-bold text-inverse">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-inverse-muted transition hover-surface-08 hover:text-inverse"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-theme-inverse px-4 py-4">
          <p
            className="mb-3 truncate typ-caption-lg text-inverse-subtle"
            title={user?.email ?? ""}
          >
            {user?.email ?? "—"}
          </p>
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-inverse-muted transition hover-surface-08 hover:text-inverse"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
