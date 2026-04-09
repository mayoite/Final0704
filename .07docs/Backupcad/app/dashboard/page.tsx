import { createClient } from '@/lib/supabase/server'
import { FloorPlanGrid } from '@/components/dashboard/floor-plan-grid'
import { EmptyState } from '@/components/dashboard/empty-state'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: floorPlans } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  const hasPlans = floorPlans && floorPlans.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Floor Plans</h1>
          <p className="text-muted-foreground mt-1">
            {hasPlans 
              ? `${floorPlans.length} floor plan${floorPlans.length !== 1 ? 's' : ''}`
              : 'Create your first floor plan'
            }
          </p>
        </div>
      </div>

      {hasPlans ? (
        <FloorPlanGrid plans={floorPlans} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
