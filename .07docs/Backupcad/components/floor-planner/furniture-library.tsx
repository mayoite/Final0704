'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Loader2, Grid3X3, Armchair, LayoutGrid, Table2, Archive, Sofa, Puzzle } from 'lucide-react'
import type { FurnitureItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Grid3X3 },
  { id: 'workstation', label: 'Workstations', icon: LayoutGrid },
  { id: 'desk', label: 'Desks', icon: Table2 },
  { id: 'chair', label: 'Chairs', icon: Armchair },
  { id: 'table', label: 'Tables', icon: Table2 },
  { id: 'storage', label: 'Storage', icon: Archive },
  { id: 'seating', label: 'Soft Seating', icon: Sofa },
  { id: 'accessory', label: 'Accessories', icon: Puzzle },
]

interface FurnitureLibraryProps {
  onAddFurniture: (item: FurnitureItem) => void
}

export function FurnitureLibrary({ onAddFurniture }: FurnitureLibraryProps) {
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: furniture, isLoading } = useSWR<FurnitureItem[]>(
    `/api/furniture?category=${category}&search=${searchQuery}`,
    fetcher
  )

  const filteredFurniture = useMemo(() => {
    if (!furniture) return []
    return furniture
  }, [furniture])

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <Tabs value={category} onValueChange={setCategory} className="flex-1 flex flex-col">
        <div className="border-b border-border px-2">
          <ScrollArea className="w-full" orientation="horizontal">
            <TabsList className="h-10 w-max bg-transparent p-0 gap-0">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                return (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="px-3 py-2 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </ScrollArea>
        </div>

        <TabsContent value={category} className="flex-1 m-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFurniture.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Archive className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No furniture found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3">
                {filteredFurniture.map(item => (
                  <FurnitureCard 
                    key={item.id} 
                    item={item} 
                    onAdd={() => onAddFurniture(item)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FurnitureCard({ 
  item, 
  onAdd 
}: { 
  item: FurnitureItem
  onAdd: () => void
}) {
  return (
    <button
      onClick={onAdd}
      className="flex flex-col items-center p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-colors text-left group"
    >
      <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center mb-2 overflow-hidden">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <FurniturePreview item={item} />
        )}
      </div>
      <div className="w-full">
        <p className="text-xs font-medium truncate">{item.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {item.width_cm} x {item.depth_cm} cm
        </p>
      </div>
    </button>
  )
}

function FurniturePreview({ item }: { item: FurnitureItem }) {
  // Generate a simple SVG preview based on category and dimensions
  const scale = 0.4
  const width = Math.min(item.width_cm * scale, 80)
  const depth = Math.min(item.depth_cm * scale, 80)
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workstation': return 'fill-blue-500/20 stroke-blue-500'
      case 'desk': return 'fill-amber-500/20 stroke-amber-500'
      case 'chair': return 'fill-green-500/20 stroke-green-500'
      case 'table': return 'fill-purple-500/20 stroke-purple-500'
      case 'storage': return 'fill-orange-500/20 stroke-orange-500'
      case 'seating': return 'fill-pink-500/20 stroke-pink-500'
      default: return 'fill-gray-500/20 stroke-gray-500'
    }
  }

  return (
    <svg 
      viewBox="0 0 100 100" 
      className="w-full h-full p-3"
    >
      <rect
        x={(100 - width) / 2}
        y={(100 - depth) / 2}
        width={width}
        height={depth}
        rx={4}
        className={`${getCategoryColor(item.category)} stroke-2`}
      />
    </svg>
  )
}
