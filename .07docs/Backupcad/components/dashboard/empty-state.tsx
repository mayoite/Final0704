import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Plus } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <LayoutGrid className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No floor plans yet</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Create your first floor plan to start designing your perfect office layout.
      </p>
      <Button asChild>
        <Link href="/dashboard/editor/new">
          <Plus className="h-4 w-4 mr-2" />
          Create Floor Plan
        </Link>
      </Button>
    </div>
  )
}
