'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import type { FurnitureItem } from '@/lib/types'

interface FurnitureTableProps {
  furniture: FurnitureItem[]
}

export function FurnitureTable({ furniture }: FurnitureTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredFurniture = furniture.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return
    
    await supabase.from('furniture_items').delete().eq('id', deleteId)
    router.refresh()
    setDeleteId(null)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await supabase
      .from('furniture_items')
      .update({ is_active: !isActive })
      .eq('id', id)
    router.refresh()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workstation': return 'bg-blue-500/10 text-blue-500'
      case 'desk': return 'bg-amber-500/10 text-amber-500'
      case 'chair': return 'bg-green-500/10 text-green-500'
      case 'table': return 'bg-purple-500/10 text-purple-500'
      case 'storage': return 'bg-orange-500/10 text-orange-500'
      case 'seating': return 'bg-pink-500/10 text-pink-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredFurniture.length} items
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Dimensions (cm)</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFurniture.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.width_cm} x {item.depth_cm} x {item.height_cm}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  One & Only
                </TableCell>
                <TableCell>
                  {item.is_active ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/admin/furniture/${item.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                      >
                        {item.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Furniture Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the furniture item from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
