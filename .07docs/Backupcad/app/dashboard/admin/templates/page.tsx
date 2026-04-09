import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'

export default async function AdminTemplatesPage() {
  const supabase = await createClient()
  
  const { data: templates } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Manage public floor plan templates
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription>
                  {template.room_width_cm / 100}m x {template.room_depth_cm / 100}m
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.description || 'No description'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No templates yet</h2>
          <p className="text-muted-foreground max-w-sm mb-4">
            Create public templates that users can use as starting points for their floor plans.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create First Template
          </Button>
        </div>
      )}
    </div>
  )
}
