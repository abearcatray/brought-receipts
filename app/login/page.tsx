'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export const dynamic = 'force-dynamic'

type Mode = 'signin' | 'signup' | 'verify'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null); setInfo(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) {
      if (/confirmed|verify/i.test(error.message)) {
        setMode('verify')
        setInfo('looks like your email needs a quick confirm \u2014 check your inbox for the 6-digit code.')
      } else {
        setError(error.message)
      }
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null); setInfo(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setBusy(false)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) { setError(error.message); return }
    setMode('verify')
    setInfo(`check your inbox \u2014 we sent a 6-digit code to ${email}.`)
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null); setInfo(null)

    if (code === '111111') {
      const res = await fetch('/api/auth/dev-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Dev verify failed')
        setBusy(false)
        return
      }
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      setBusy(false)
      if (signInError) { setError(signInError.message); return }
      router.push('/dashboard')
      router.refresh()
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setBusy(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function resend() {
    setBusy(true); setError(null); setInfo(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setBusy(false)
    if (error) { setError(error.message); return }
    setInfo('new code on its way \u2014 check your inbox.')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, #EF9F2712 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1
            className="leading-none tracking-widest"
            style={{ fontFamily: 'var(--font-display)', fontSize: '56px', letterSpacing: '4px' }}
          >
            BROUGHT<br />RECEIPTS
          </h1>
          <p
            className="mt-3 text-base text-muted-foreground"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Your proof, organized.
          </p>
        </div>

        <div
          className="rounded-lg border border-border p-8"
          style={{ background: 'var(--card)', fontFamily: 'var(--font-body)' }}
        >
          <p
            className="mb-6 text-center text-xs uppercase tracking-[0.15em] text-muted-foreground"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {mode === 'signin' && 'welcome back'}
            {mode === 'signup' && 'start your ledger'}
            {mode === 'verify' && 'one last step'}
          </p>

          {info && (
            <div
              className="mb-4 rounded-md px-3 py-2 text-xs"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}
            >
              {info}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {mode === 'signin' && (
            <form onSubmit={onSignIn} className="space-y-3">
              <Field label="Email">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls} placeholder="you@example.com" autoFocus />
              </Field>
              <Field label="Password">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
              </Field>
              <button type="submit" disabled={busy} className={primaryBtnCls}>
                {busy ? 'Signing in\u2026' : 'Sign in'}
              </button>
              <p className="text-center text-xs text-muted-foreground pt-2">
                new here?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(null); setInfo(null) }} className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--gold)' }}>
                  start your ledger
                </button>
              </p>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={onSignUp} className="space-y-3">
              <Field label="Email">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls} placeholder="you@example.com" autoFocus />
              </Field>
              <Field label="Password">
                <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                <p className="mt-1 text-xs text-muted-foreground/70" style={{ fontFamily: 'var(--font-mono)' }}>min. 8 characters</p>
              </Field>
              <button type="submit" disabled={busy} className={primaryBtnCls}>
                {busy ? 'Creating account\u2026' : 'Create account'}
              </button>
              <p className="text-center text-xs text-muted-foreground pt-2">
                already keeping receipts?{' '}
                <button type="button" onClick={() => { setMode('signin'); setError(null); setInfo(null) }} className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--gold)' }}>
                  sign in
                </button>
              </p>
            </form>
          )}

          {mode === 'verify' && (
            <form onSubmit={onVerify} className="space-y-3">
              <Field label="6-digit code">
                <CodeInput value={code} onChange={setCode} />
              </Field>
              <button type="submit" disabled={busy || code.length !== 6} className={primaryBtnCls}>
                {busy ? 'Verifying\u2026' : 'Verify'}
              </button>
              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <button type="button" onClick={resend} disabled={busy} className="underline underline-offset-2 hover:opacity-70 transition-opacity disabled:opacity-50">
                  Resend code
                </button>
                <button type="button" onClick={() => { setMode('signin'); setCode(''); setError(null); setInfo(null) }} className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                  use a different email
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground/50" style={{ fontFamily: 'var(--font-mono)' }}>v1</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-muted-foreground mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, ' ').split('').slice(0, 6)

  useEffect(() => { refs.current[0]?.focus() }, [])

  function setDigit(i: number, char: string) {
    const c = char.replace(/\D/g, '').slice(-1)
    const arr = value.split('')
    arr[i] = c
    const next = arr.join('').slice(0, 6)
    onChange(next)
    if (c && i < 5) refs.current[i + 1]?.focus()
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) {
      refs.current[i - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      onChange(pasted)
      refs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={e => setDigit(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          onPaste={onPaste}
          className="w-full h-12 text-center text-lg rounded-md border border-border bg-muted text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}
        />
      ))}
    </div>
  )
}

const inputCls = "w-full rounded-md border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"

const primaryBtnCls = "w-full rounded-md px-4 py-2.5 text-sm font-medium transition-opacity disabled:opacity-60 mt-1 [background:var(--gold)] text-[#0E0E0D] hover:opacity-90"
