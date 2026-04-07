'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Copy, Trash2, LayoutGrid } from 'lucide-react'
import type { FloorPlan } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FloorPlanGridProps {
  plans: FloorPlan[]
}

export function FloorPlanGrid({ plans }: FloorPlanGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {plans.map((plan) => (
        <FloorPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}

function FloorPlanCard({ plan }: { plan: FloorPlan }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this floor plan?')) return
    
    setIsDeleting(true)
    await supabase.from('floor_plans').delete().eq('id', plan.id)
    router.refresh()
  }

  const handleDuplicate = async () => {
    const { data: newPlan } = await supabase
      .from('floor_plans')
      .insert({
        name: `${plan.name} (Copy)`,
        description: plan.description,
        room_width_cm: plan.room_width_cm,
        room_depth_cm: plan.room_depth_cm,
        room_height_cm: plan.room_height_cm,
        grid_size_cm: plan.grid_size_cm,
        user_id: plan.user_id,
      })
      .select()
      .single()

    if (newPlan) {
      // Copy placed furniture
      const { data: furniture } = await supabase
        .from('placed_furniture')
        .select('*')
        .eq('floor_plan_id', plan.id)

      if (furniture && furniture.length > 0) {
        await supabase.from('placed_furniture').insert(
          furniture.map(f => ({
            ...f,
            id: undefined,
            floor_plan_id: newPlan.id,
          }))
        )
      }
      
      router.refresh()
    }
  }

  return (
    <Card className={`group relative overflow-hidden hover:border-primary/50 transition-colors ${isDeleting ? 'opacity-50' : ''}`}>
      <Link href={`/dashboard/editor/${plan.id}`} className="block">
        <div className="aspect-video bg-muted flex items-center justify-center">
          {plan.thumbnail_url ? (
            <img 
              src={plan.thumbnail_url} 
              alt={plan.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground">
              <LayoutGrid className="h-12 w-12 opacity-20" />
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/dashboard/editor/${plan.id}`}
              className="font-medium truncate block hover:text-primary transition-colors"
            >
              {plan.name}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {plan.room_width_cm / 100}m x {plan.room_depth_cm / 100}m
            </p>
            <p className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/editor/${plan.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
