"use client"
import { useActionState } from "react"
import { login, signup, AuthState } from "./actions"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [loginState, loginAction, isLoginPending] = useActionState<AuthState, FormData>(login, null)
  const [signupState, signupAction, isSignupPending] = useActionState<AuthState, FormData>(signup, null)

  const error = loginState?.error || signupState?.error

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 scheme-page">
      <div className="w-full max-w-sm rounded-4xl border scheme-border scheme-panel p-8 shadow-theme-panel">
        <div className="mb-8 select-none text-center">
          <h1 className="typ-h2 scheme-text-strong">Partner Portal</h1>
          <p className="mt-2 text-sm scheme-text-muted">Sign in to manage and review projects.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger-soft bg-danger-soft p-4 text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium scheme-text-strong" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                className="h-11 w-full rounded-xl border scheme-border bg-hover px-4 text-sm scheme-text-strong tracking-wide outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium scheme-text-strong" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="h-11 w-full rounded-xl border scheme-border bg-hover px-4 text-sm scheme-text-strong tracking-wide outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              formAction={loginAction}
              disabled={isLoginPending || isSignupPending}
              className="btn-primary w-full justify-center h-11"
            >
              {isLoginPending ? "Signing in..." : "Sign In"}
            </button>
            <button
              formAction={signupAction}
              disabled={isLoginPending || isSignupPending}
              className="btn-outline w-full justify-center h-11"
            >
              {isSignupPending ? "Requesting access..." : "Request Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
