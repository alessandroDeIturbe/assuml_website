'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AppuntiClient({ notes: initial, isAdmin }) {
  const [notes, setNotes] = useState(initial)

  async function handleDelete(id) {
    if (!confirm('Eliminare questo appunto dalla lista pubblica?')) return
    const res = await fetch(`/api/notes/delete?id=${id}`, { method: 'DELETE' })
    if (res.ok) setNotes(ns => ns.filter(n => n.id !== id))
  }

  if (notes.length === 0) return (
    <div className="py-24 text-center">
      <p className="text-neutral-400 dark:text-neutral-600 font-mono text-sm">
        Nessun appunto disponibile al momento.
      </p>
      <Link href="/appunti/upload"
        className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-[#FF4D4D] transition">
        Sii il primo a caricare →
      </Link>
    </div>
  )

  return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
      {notes.map((note) => (
        <div key={note.id} className="py-8 flex items-center justify-between gap-8 group">
          <div className="space-y-1 min-w-0">
            <h2 className="font-semibold text-xl text-neutral-900 dark:text-white group-hover:text-[#FF4D4D] transition truncate">
              {note.title}
            </h2>
            {note.description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-500 truncate max-w-lg">{note.description}</p>
            )}
            <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono">
              {note.author?.name ?? note.author?.email?.split('@')[0] ?? 'Anonimo'}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-sm font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {note.price === 0 ? 'Gratis' : `${note.price} ${note.currency}`}
            </span>
            <Link
              href={`/appunti/${note.id}`}
              className="px-4 py-2 border border-neutral-900 dark:border-neutral-300 text-neutral-900 dark:text-neutral-100 text-xs font-semibold hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition"
            >
              Visualizza
            </Link>
            {isAdmin && (
              <button
                onClick={() => handleDelete(note.id)}
                className="text-xs font-mono text-neutral-400 hover:text-[#FF4D4D] transition underline underline-offset-4"
              >
                Elimina
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
