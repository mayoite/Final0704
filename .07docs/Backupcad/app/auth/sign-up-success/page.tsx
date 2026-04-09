import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, LayoutGrid } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <LayoutGrid className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent you a confirmation link to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to activate your account and start creating floor plans.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
