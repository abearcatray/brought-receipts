'use client'

import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      {/* Subtle radial glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0.73 0.13 75 / 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="mb-10 text-center">
          <h1
            className="text-5xl tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            brought receipts
          </h1>
          <p
            className="mt-3 text-sm text-muted-foreground tracking-wide"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            your private work log. never forget your impact.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-lg border border-border p-8"
          style={{ background: 'var(--card)' }}
        >
          <p
            className="mb-6 text-center text-xs uppercase tracking-[0.15em] text-muted-foreground"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            sign in to continue
          </p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-md border border-border px-4 py-3 text-sm font-medium transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
            Your wins stay private by default.
            <br />
            No manager surveillance.
          </p>
        </div>

        {/* Bottom ornament */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span
            className="text-xs text-muted-foreground/50"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            v1
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
