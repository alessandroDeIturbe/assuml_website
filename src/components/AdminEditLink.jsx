'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

export default function AdminEditLink({ href = '/admin', title = 'Modifica' }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin || session?.user?.email === ADMIN_EMAIL
  if (!isAdmin) return null

  return (
    <Link href={href} title={title}
      className="inline-flex items-center justify-center w-6 h-6 text-neutral-400 hover:text-[#FF4D4D] transition ml-2 align-middle"
      aria-label={title}>
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/>
      </svg>
    </Link>
  )
}
