import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Admin root layout — checks auth + admin role only.
 * The 2FA cookie check lives in (protected)/layout.tsx to avoid a circular
 * redirect when navigating to /admin/verify-2fa.
 */
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login?returnTo=/admin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>()

  if (!profile || profile.role !== "admin") {
    redirect("/?message=access-denied")
  }

  return <>{children}</>
}
