import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FloorPlanEditor } from '@/components/floor-planner/editor'

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  // Handle new plan creation
  if (id === 'new') {
    return <FloorPlanEditor isNew userId={user.id} />
  }

  // Fetch existing plan
  const { data: plan, error } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !plan) {
    notFound()
  }

  // Fetch placed furniture
  const { data: placedFurniture } = await supabase
    .from('placed_furniture')
    .select(`
      *,
      furniture:furniture_items(*)
    `)
    .eq('floor_plan_id', id)

  return (
    <FloorPlanEditor 
      plan={plan} 
      placedFurniture={placedFurniture || []} 
      userId={user.id}
    />
  )
}
