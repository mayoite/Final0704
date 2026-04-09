'use client'

import { useFloorPlannerStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Box, Boxes, Settings2 } from 'lucide-react'

export function MobileBottomNav() {
  const { activeTab, setActiveTab, editorMode, setEditorMode } = useFloorPlannerStore()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        <NavButton
          icon={<Boxes className="h-5 w-5" />}
          label="Furniture"
          active={activeTab === 'library'}
          onClick={() => setActiveTab('library')}
        />
        <NavButton
          icon={editorMode === '2d' ? <LayoutGrid className="h-5 w-5" /> : <Box className="h-5 w-5" />}
          label={editorMode === '2d' ? '2D View' : '3D View'}
          active={activeTab === 'canvas'}
          onClick={() => setActiveTab('canvas')}
        />
        <NavButton
          icon={<Settings2 className="h-5 w-5" />}
          label="Properties"
          active={activeTab === 'properties'}
          onClick={() => setActiveTab('properties')}
        />
      </div>
    </div>
  )
}

function NavButton({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1 p-2 rounded-lg min-w-[70px]
        transition-colors
        ${active 
          ? 'text-primary bg-primary/10' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }
      `}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
