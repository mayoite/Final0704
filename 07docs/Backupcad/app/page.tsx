import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Boxes, Move3D, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <LayoutGrid className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">FloorPlanner</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <span className="flex h-2 w-2 rounded-full bg-accent" />
            Powered by AFC India Furniture Catalog
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance max-w-4xl mx-auto mb-6">
            Design Your Perfect Office Layout in 2D & 3D
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Professional floor planning tool with precise measurements, drag-and-drop furniture placement, and immersive 3D walkthrough visualization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Designing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything You Need for Office Planning
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<LayoutGrid className="h-6 w-6" />}
              title="2D Floor Editor"
              description="Intuitive drag-and-drop canvas with grid snapping and precise measurements in centimeters."
            />
            <FeatureCard
              icon={<Move3D className="h-6 w-6" />}
              title="3D Walkthrough"
              description="Explore your designs in immersive first-person view or orbit around the entire layout."
            />
            <FeatureCard
              icon={<Boxes className="h-6 w-6" />}
              title="Furniture Library"
              description="50+ office furniture items from AFC India with accurate dimensions and specifications."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Team Collaboration"
              description="Save, share, and manage multiple floor plans with your team members."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FloorPlanner - Professional Office Layout Designer</p>
          <p className="mt-1">Furniture catalog sourced from AFC India</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 hover:border-primary/50 transition-colors">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
