"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const COOKIE_NAME = "admin_2fa_verified"
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

/**
 * Called after a successful client-side TOTP verify.
 * Checks that the session AAL level is now aal2, then sets the
 * admin_2fa_verified cookie and redirects.
 */
export async function setAdmin2FAVerified(returnTo: string = "/admin"): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  if (error || !data || data.currentLevel !== "aal2") {
    redirect("/admin/verify-2fa?error=mfa-not-confirmed")
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "strict",
  })

  redirect(returnTo)
}

/** Sign out and clear the 2FA session cookie. */
export async function adminLogout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)

  redirect("/login")
}
