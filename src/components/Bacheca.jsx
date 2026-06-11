'use client'
import { useState, useEffect, useRef } from 'react'

const POLL_MS = 5000

export default function Bacheca({ initial = null }) {
  const [announcement, setAnnouncement] = useState(initial)
  const intervalRef = useRef(null)

  useEffect(() => {
    async function poll() {
      try {
        const res  = await fetch('/api/admin/announcements')
        const data = await res.json()
        setAnnouncement(Array.isArray(data) && data.length > 0 ? data[0] : null)
      } catch {}
    }
    // Poll subito, poi ogni 5s
    poll()
    intervalRef.current = setInterval(poll, POLL_MS)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (!announcement) return null

  return (
    <div className="mt-6 px-5 py-4 border-l-2 border-[#FF4D4D] bg-neutral-50 dark:bg-neutral-900 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-[#FF4D4D] mb-1">Avviso ASSUML</p>
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{announcement.title}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{announcement.body}</p>
      </div>
      <span className="text-[10px] font-mono text-neutral-400 shrink-0 mt-0.5">
        {new Date(announcement.createdAt).toLocaleDateString('it-IT')}
      </span>
    </div>
  )
}
