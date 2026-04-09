import { createClient } from '@/lib/supabase/server'
import { FurnitureTable } from '@/components/admin/furniture-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminFurniturePage() {
  const supabase = await createClient()
  
  const { data: furniture } = await supabase
    .from('furniture_items')
    .select('*')
    .order('category')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Furniture Catalog</h1>
          <p className="text-muted-foreground">
            Manage the furniture library available to users
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/furniture/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Furniture
          </Link>
        </Button>
      </div>

      <FurnitureTable furniture={furniture || []} />
    </div>
  )
}
