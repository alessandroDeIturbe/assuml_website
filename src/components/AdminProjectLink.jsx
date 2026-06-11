'use client'
import Link           from 'next/link'
import { useSession } from 'next-auth/react'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

export default function AdminProjectLink({ href = '/admin', dark = false }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.isAdmin
  if (!isAdmin) return null

  return (
    <Link href={href}
      className={`absolute top-6 right-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition
        ${dark
          ? 'border border-white/20 text-white/50 hover:text-white hover:border-white/50'
          : 'border border-indigo-950/20 text-indigo-950/50 hover:text-indigo-950 hover:border-indigo-950/50'
        }`}>
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      Modifica
    </Link>
  )
}
