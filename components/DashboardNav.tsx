'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', label: 'Receipts', icon: StarIcon },
  { href: '/dashboard/export', label: 'Review Packet', icon: ExportIcon },
]

export default function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Sidebar — desktop */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 border-r border-sidebar-border p-6 z-20"
        style={{ background: 'var(--sidebar)', fontFamily: 'var(--font-body)' }}
      >
        {/* Wordmark */}
        <Link href="/dashboard" className="block mb-8">
          <span
            className="leading-none"
            style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '3px', color: 'var(--sidebar-foreground)' }}
          >
            BROUGHT<br />RECEIPTS
          </span>
        </Link>

        {/* Capture CTA */}
        <Link
          href="/dashboard/entries/new"
          className="flex items-center justify-center gap-2 w-full rounded-md px-4 py-2.5 text-sm font-medium mb-6 transition-opacity hover:opacity-90"
          style={{
            background: 'var(--gold)',
            color: '#0E0E0D',
          }}
        >
          <span className="text-base leading-none">+</span>
          Capture
        </Link>

        {/* Nav links */}
        <div className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150"
                style={{
                  color: active ? 'var(--gold)' : 'var(--sidebar-foreground)',
                  background: active ? 'var(--sidebar-accent)' : 'transparent',
                  opacity: active ? 1 : 0.7,
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User */}
        <div className="border-t border-sidebar-border pt-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: 'var(--sidebar-accent)', color: 'var(--gold)' }}
            >
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-xs truncate" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>{user.email}</span>
          </div>
          <button
            onClick={signOut}
            className="w-full text-left px-3 py-2 text-xs transition-opacity rounded-md hover:opacity-100"
            style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Mobile header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 border-b border-sidebar-border"
        style={{ background: 'var(--sidebar)' }}
      >
        <Link href="/dashboard">
          <span
            style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '2px', color: 'var(--sidebar-foreground)' }}
          >
            BROUGHT RECEIPTS
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs px-3 py-1.5 rounded-md transition-colors"
              style={{
                color: pathname === href ? 'var(--gold)' : 'var(--sidebar-foreground)',
                background: pathname === href ? 'var(--sidebar-accent)' : 'transparent',
                opacity: pathname === href ? 1 : 0.7,
              }}
            >
              {label === 'Review Packet' ? 'Export' : label}
            </Link>
          ))}
          <Link
            href="/dashboard/entries/new"
            className="text-xs px-3 py-1.5 rounded-md font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--gold)', color: '#0E0E0D' }}
          >
            + Capture
          </Link>
        </div>
      </header>
    </>
  )
}

function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function ExportIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}
