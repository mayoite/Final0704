import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, FileText, LayoutGrid } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  
  // Get counts
  const [
    { count: furnitureCount },
    { count: usersCount },
    { count: plansCount },
  ] = await Promise.all([
    supabase.from('furniture_items').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('floor_plans').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Furniture Items"
          value={furnitureCount || 0}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="Total catalog items"
        />
        <StatCard
          title="Users"
          value={usersCount || 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Registered accounts"
        />
        <StatCard
          title="Floor Plans"
          value={plansCount || 0}
          icon={<LayoutGrid className="h-4 w-4 text-muted-foreground" />}
          description="Created by users"
        />
        <StatCard
          title="Templates"
          value={0}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description="Public templates"
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
