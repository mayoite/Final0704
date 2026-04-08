"use client"

import { Suspense, useState, useEffect, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { setAdmin2FAVerified } from "../actions"
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react"

type PhaseState =
  | { kind: "loading" }
  | { kind: "enroll"; factorId: string; qrCode: string; secret: string }
  | { kind: "verify"; factorId: string }
  | { kind: "error"; message: string }

function Verify2FAContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") ?? "/admin"
  const urlError = searchParams.get("error")

  // Stable client reference — createBrowserClient is a singleton internally
  const [supabase] = useState(() => createClient())

  const [phase, setPhase] = useState<PhaseState>({ kind: "loading" })
  const [otp, setOtp] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(urlError ?? null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) {
        setPhase({ kind: "error", message: error.message })
        return
      }

      // If user already has a verified TOTP factor, go straight to verify
      const verified = data.totp.find((f) => f.status === "verified")
      if (verified) {
        setPhase({ kind: "verify", factorId: verified.id })
        return
      }

      // No factor yet — enroll now
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "AFC India Admin",
        friendlyName: "AFC Admin",
      })
      if (enrollError || !enrollData) {
        setPhase({ kind: "error", message: enrollError?.message ?? "Enrollment failed" })
        return
      }

      setPhase({
        kind: "enroll",
        factorId: enrollData.id,
        qrCode: enrollData.totp.qr_code,
        secret: enrollData.totp.secret,
      })
    }

    init()
  }, [supabase])

  async function handleVerify() {
    if (phase.kind !== "enroll" && phase.kind !== "verify") return
    setSubmitError(null)

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: phase.factorId,
    })
    if (challengeError || !challengeData) {
      setSubmitError(challengeError?.message ?? "Challenge failed — please try again")
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: phase.factorId,
      challengeId: challengeData.id,
      code: otp.replace(/\s/g, ""),
    })
    if (verifyError) {
      setSubmitError(verifyError.message)
      setOtp("")
      return
    }

    // MFA verified on the client — tell the server to set the HttpOnly cookie
    startTransition(() => {
      setAdmin2FAVerified(returnTo)
    })
  }

  const isActive = phase.kind === "enroll" || phase.kind === "verify"

  const subtitle =
    phase.kind === "enroll"
      ? "Scan this QR code with your authenticator app, then enter the code below."
      : phase.kind === "verify"
      ? "Enter the 6-digit code from your authenticator app."
      : phase.kind === "loading"
      ? "Checking your account…"
      : "Something went wrong."

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm rounded-2xl border border-theme-inverse surface-canvas-soft p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl surface-overlay-08 ring-1 ring-[var(--border-inverse)]">
            <ShieldCheck className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-inverse">Two-Factor Authentication</h1>
            <p className="mt-1 text-xs leading-relaxed text-inverse-muted">{subtitle}</p>
          </div>
        </div>

        {/* Loading */}
        {phase.kind === "loading" && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-inverse-muted" />
          </div>
        )}

        {/* Hard error */}
        {phase.kind === "error" && (
          <p className="rounded-xl border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
            {phase.message}
          </p>
        )}

        {/* Enroll — show QR code */}
        {phase.kind === "enroll" && (
          <div className="mb-6 flex flex-col items-center gap-4">
            {/* White box so QR code is always readable */}
            <div className="rounded-xl bg-white p-3 shadow-sm">
              {/* Supabase returns a data URL */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={phase.qrCode}
                alt="Scan this QR code with your authenticator app"
                width={160}
                height={160}
                className="block"
              />
            </div>
            <details className="w-full">
              <summary className="cursor-pointer text-center text-xs text-inverse-muted hover:text-inverse">
                Can&apos;t scan? Enter the key manually
              </summary>
              <code className="mt-2 block break-all rounded-lg surface-overlay-08 px-3 py-2 text-center text-xs font-mono text-inverse-muted">
                {phase.secret}
              </code>
            </details>
          </div>
        )}

        {/* OTP input + submit (shown for both enroll and verify) */}
        {isActive && (
          <div className="space-y-4">
            {submitError && (
              <p className="rounded-xl border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
                {submitError}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-sm font-medium text-inverse">
                Authentication Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && otp.length === 6 && !isPending) handleVerify()
                }}
                className="h-12 w-full rounded-xl border border-theme-inverse bg-canvas px-4 text-center text-xl font-mono tracking-[0.5em] text-inverse outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={otp.length !== 6 || isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-inverse transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {isPending ? "Verifying…" : phase.kind === "enroll" ? "Set Up & Verify" : "Verify"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Verify2FAPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <Loader2 className="h-5 w-5 animate-spin text-inverse-muted" />
        </div>
      }
    >
      <Verify2FAContent />
    </Suspense>
  )
}
