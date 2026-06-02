'use client'
import { useState, useTransition } from 'react'

const STATUS_LABEL = {
  PENDING_APPROVAL: { label: 'In revisione', color: '#D4AF37' },
  APPROVED:         { label: 'Approvato',    color: '#AAFF00' },
  REJECTED:         { label: 'Rifiutato',    color: '#FF4D4D' },
}

export default function AdminClient({ initialNotes }) {
  const [notes, setNotes]           = useState(initialNotes)
  const [annTitle, setAnnTitle]     = useState('')
  const [annBody, setAnnBody]       = useState('')
  const [annStatus, setAnnStatus]   = useState(null)
  const [isPending, startTransition] = useTransition()

  async function moderate(noteId, action) {
    const res = await fetch(`/api/admin/notes/${noteId}/moderate`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action }),
    })
    if (res.ok) {
      // Rimuovi dalla coda moderazione immediatamente
      setNotes(ns => ns.filter(n => n.id !== noteId))
    }
  }

  async function postAnnouncement(e) {
    e.preventDefault()
    setAnnStatus('loading')
    const res = await fetch('/api/admin/announcements', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title: annTitle, body: annBody }),
    })
    if (res.ok) {
      setAnnTitle(''); setAnnBody(''); setAnnStatus('ok')
      setTimeout(() => setAnnStatus(null), 2000)
    } else {
      const d = await res.json()
      setAnnStatus('error:' + (d.error ?? 'Errore'))
    }
  }

  const pending = notes.filter(n => n.status === 'PENDING_APPROVAL')

  return (
    <div className="space-y-16">

      {/* Tabella moderazione */}
      <section>
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">
          Appunti in attesa
          {pending.length > 0 && (
            <span className="ml-3 text-sm font-mono px-2 py-0.5 border border-[#D4AF37] text-[#D4AF37]">{pending.length}</span>
          )}
        </h2>
        {notes.length === 0 ? (
          <p className="text-sm font-mono text-neutral-400">Nessun appunto nel sistema.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {notes.map(note => {
              const s = STATUS_LABEL[note.status] ?? { label: note.status, color: '#888' }
              return (
                <div key={note.id} className="py-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{note.title}</p>
                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                      {note.author?.name ?? note.author?.email} ·{' '}
                      {new Date(note.createdAt).toLocaleDateString('it-IT')} ·{' '}
                      {note.price === 0 ? 'Gratuito' : `${note.price} ${note.currency}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono px-2 py-0.5 border"
                      style={{ color: s.color, borderColor: s.color + '55' }}>
                      {s.label}
                    </span>
                    {note.status === 'PENDING_APPROVAL' && (
                      <>
                        <button onClick={() => moderate(note.id, 'approve')}
                          className="text-xs font-semibold px-3 py-1.5 bg-[#AAFF00] text-neutral-900 hover:opacity-80 transition">
                          Approva
                        </button>
                        <button onClick={() => moderate(note.id, 'reject')}
                          className="text-xs font-semibold px-3 py-1.5 border border-[#FF4D4D] text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition">
                          Rifiuta
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Bacheca istituzionale */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">
          Bacheca istituzionale
        </h2>
        <form onSubmit={postAnnouncement} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Titolo avviso</label>
            <input
              type="text" required value={annTitle} onChange={e => setAnnTitle(e.target.value)}
              placeholder="Es. Riunione assemblea 15 giugno"
              className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Testo</label>
            <textarea
              required rows={4} value={annBody} onChange={e => setAnnBody(e.target.value)}
              placeholder="Testo dell'avviso…"
              className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition resize-none"
            />
          </div>
          {annStatus === 'ok' && <p className="text-[#AAFF00] text-xs font-mono">✓ Avviso pubblicato.</p>}
          {annStatus?.startsWith('error') && <p className="text-[#FF4D4D] text-xs font-mono">{annStatus.replace('error:', '')}</p>}
          <button type="submit" disabled={annStatus === 'loading'}
            className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition disabled:opacity-40">
            {annStatus === 'loading' ? 'Pubblicazione…' : 'Pubblica avviso'}
          </button>
        </form>
      </section>

    </div>
  )
}
