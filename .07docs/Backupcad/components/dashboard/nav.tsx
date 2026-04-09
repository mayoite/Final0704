'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LayoutGrid, FolderOpen, Settings, LogOut, Plus, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface DashboardNavProps {
  user: SupabaseUser
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'U'

  const isAdmin = user.user_metadata?.role === 'admin'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <LayoutGrid className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold hidden sm:inline">FloorPlanner</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard" active={pathname === '/dashboard'}>
              <FolderOpen className="h-4 w-4 mr-2" />
              My Plans
            </NavLink>
            {isAdmin && (
              <NavLink href="/dashboard/admin" active={pathname.startsWith('/dashboard/admin')}>
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" asChild>
            <Link href="/dashboard/editor/new">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function NavLink({ 
  href, 
  active, 
  children 
}: { 
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${active 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }
      `}
    >
      {children}
    </Link>
  )
}
