import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutGrid, Users, Package, FileText } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <AdminNavLink href="/dashboard/admin" icon={<LayoutGrid className="h-4 w-4" />}>
            Overview
          </AdminNavLink>
          <AdminNavLink href="/dashboard/admin/furniture" icon={<Package className="h-4 w-4" />}>
            Furniture
          </AdminNavLink>
          <AdminNavLink href="/dashboard/admin/users" icon={<Users className="h-4 w-4" />}>
            Users
          </AdminNavLink>
          <AdminNavLink href="/dashboard/admin/templates" icon={<FileText className="h-4 w-4" />}>
            Templates
          </AdminNavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}

function AdminNavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {icon}
      {children}
    </Link>
  )
}
