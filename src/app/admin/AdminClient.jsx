'use client'
import { useState } from 'react'

const STATUS_LABEL = {
  PENDING_APPROVAL: { label: 'In revisione', color: '#D4AF37' },
  APPROVED:         { label: 'Approvato',    color: '#AAFF00' },
  REJECTED:         { label: 'Rifiutato',    color: '#FF4D4D' },
}

export default function AdminClient({ initialNotes, initialAnnouncements, initialPurchases, initialEvents = [], initialConvenzioni = [] }) {
  const [notes,         setNotes]         = useState(initialNotes)
  const [announcements, setAnnouncements] = useState(initialAnnouncements ?? [])
  const [purchases,     setPurchases]     = useState(initialPurchases ?? [])
  const [events,        setEvents]        = useState(initialEvents)
  const [convenzioni,   setConvenzioni]   = useState(initialConvenzioni)

  // Evento form
  const [evTitle, setEvTitle]   = useState('')
  const [evTipo,  setEvTipo]    = useState('Evento')
  const [evLuogo, setEvLuogo]   = useState('')
  const [evDate,  setEvDate]    = useState('')
  const [evDesc,  setEvDesc]    = useState('')
  const [evStatus, setEvStatus] = useState(null)

  // Convenzione form
  const [cvTitle,  setCvTitle]  = useState('')
  const [cvSub,    setCvSub]    = useState('')
  const [cvStatus, setCvStatus] = useState(null)

  async function addEvent(e) {
    e.preventDefault()
    setEvStatus('loading')
    const res = await fetch('/api/admin/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: evTitle, tipo: evTipo, luogo: evLuogo, date: evDate, description: evDesc }),
    })
    if (res.ok) {
      const item = await res.json()
      setEvents(ev => [item, ...ev])
      setEvTitle(''); setEvLuogo(''); setEvDate(''); setEvDesc('')
      setEvStatus('ok'); setTimeout(() => setEvStatus(null), 2000)
    } else { setEvStatus('error') }
  }

  async function deleteEvent(id) {
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    setEvents(ev => ev.filter(e => e.id !== id))
  }

  async function addConvenzione(e) {
    e.preventDefault()
    setCvStatus('loading')
    const res = await fetch('/api/admin/convenzioni', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: cvTitle, subtitle: cvSub }),
    })
    if (res.ok) {
      const item = await res.json()
      setConvenzioni(c => [item, ...c])
      setCvTitle(''); setCvSub('')
      setCvStatus('ok'); setTimeout(() => setCvStatus(null), 2000)
    } else { setCvStatus('error') }
  }

  async function deleteConvenzione(id) {
    await fetch(`/api/admin/convenzioni/${id}`, { method: 'DELETE' })
    setConvenzioni(c => c.filter(x => x.id !== id))
  }
  const [annTitle,  setAnnTitle]  = useState('')
  const [annBody,   setAnnBody]   = useState('')
  const [annStatus, setAnnStatus] = useState(null)

  // ── Moderazione appunti ───────────────────────────────────────────────
  async function moderate(noteId, action) {
    const res = await fetch(`/api/admin/notes/${noteId}/moderate`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action }),
    })
    if (res.ok) setNotes(ns => ns.filter(n => n.id !== noteId))
  }

  // ── Bacheca: pubblica ─────────────────────────────────────────────────
  async function postAnnouncement(e) {
    e.preventDefault()
    setAnnStatus('loading')
    const res = await fetch('/api/admin/announcements', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title: annTitle, body: annBody }),
    })
    if (res.ok) {
      const item = await res.json()
      setAnnouncements(a => [item, ...a])
      setAnnTitle(''); setAnnBody('')
      setAnnStatus('ok')
      setTimeout(() => setAnnStatus(null), 2000)
    } else {
      const d = await res.json().catch(() => ({}))
      setAnnStatus('error:' + (d.error ?? 'Errore'))
    }
  }

  // ── Sblocca acquisto P2P ─────────────────────────────────────────────
  async function unlockPurchase(id) {
    const res = await fetch(`/api/admin/purchases/${id}`, { method: 'PATCH' })
    if (res.ok) setPurchases(ps => ps.filter(p => p.id !== id))
  }

  // ── Bacheca: svuota/disattiva ─────────────────────────────────────────
  async function deactivate(id) {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) setAnnouncements(a => a.filter(x => x.id !== id))
  }

  const pending = notes.filter(n => n.status === 'PENDING_APPROVAL')

  return (
    <div className="space-y-16">

      {/* ── Moderazione ────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">
          Appunti in attesa
          {pending.length > 0 && (
            <span className="ml-3 text-sm font-mono px-2 py-0.5 border border-[#D4AF37] text-[#D4AF37]">
              {pending.length}
            </span>
          )}
        </h2>

        {notes.length === 0 ? (
          <p className="text-sm font-mono text-neutral-400">Nessun appunto in attesa di revisione.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {notes.map(note => (
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
                  <button onClick={() => moderate(note.id, 'approve')}
                    className="text-xs font-semibold px-3 py-1.5 bg-[#AAFF00] text-neutral-900 hover:opacity-80 transition">
                    Approva
                  </button>
                  <button onClick={() => moderate(note.id, 'reject')}
                    className="text-xs font-semibold px-3 py-1.5 border border-[#FF4D4D] text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition">
                    Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Acquisti P2P da verificare ───────────────────────────────── */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">
          Acquisti P2P da verificare
          {purchases.length > 0 && (
            <span className="ml-3 text-sm font-mono px-2 py-0.5 border border-[#00CFCF] text-[#00CFCF]">
              {purchases.length}
            </span>
          )}
        </h2>
        {purchases.length === 0 ? (
          <p className="text-sm font-mono text-neutral-400">Nessun acquisto in attesa di verifica.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {purchases.map(p => (
              <div key={p.id} className="py-5 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 space-y-0.5">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    {p.note?.title}
                  </p>
                  <p className="text-xs font-mono text-neutral-400">
                    {p.user?.name ?? p.user?.email} · {p.amountPaid} {p.currency} ·{' '}
                    {new Date(p.purchasedAt).toLocaleDateString('it-IT')}
                  </p>
                  {p.receiptKey && (
                    <p className="text-[10px] font-mono text-neutral-500">
                      Ricevuta: {p.receiptKey.split('/').pop()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => unlockPurchase(p.id)}
                  className="text-xs font-semibold px-4 py-2 bg-[#00CFCF] text-neutral-900 hover:opacity-80 transition shrink-0"
                >
                  ✓ Sblocca accesso
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Bacheca istituzionale ──────────────────────────────────────── */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-8 tracking-tight">
          Bacheca istituzionale
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form nuovo avviso */}
          <form onSubmit={postAnnouncement} className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nuovo avviso</h3>
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Titolo</label>
              <input
                type="text" required value={annTitle} onChange={e => setAnnTitle(e.target.value)}
                placeholder="Es. Riunione assemblea 15 giugno"
                className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Testo</label>
              <textarea
                required rows={3} value={annBody} onChange={e => setAnnBody(e.target.value)}
                placeholder="Testo dell'avviso…"
                className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition resize-none"
              />
            </div>
            {annStatus === 'ok'                   && <p className="text-[#AAFF00] text-xs font-mono">✓ Avviso pubblicato.</p>}
            {annStatus?.startsWith('error')        && <p className="text-[#FF4D4D] text-xs font-mono">{annStatus.replace('error:','')}</p>}
            <button type="submit" disabled={annStatus === 'loading'}
              className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition disabled:opacity-40">
              {annStatus === 'loading' ? 'Pubblicazione…' : 'Pubblica avviso'}
            </button>
          </form>

          {/* Avvisi attivi */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              Avvisi attivi
              {announcements.length > 0 && (
                <span className="ml-2 text-xs font-mono text-neutral-400">({announcements.length})</span>
              )}
            </h3>
            {announcements.length === 0 ? (
              <p className="text-xs font-mono text-neutral-400">Nessun avviso attivo.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id}
                    className="flex items-start justify-between gap-4 px-4 py-3 border border-neutral-200 dark:border-neutral-800">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{a.title}</p>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5 line-clamp-1">{a.body}</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">
                        {new Date(a.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <button
                      onClick={() => deactivate(a.id)}
                      className="shrink-0 text-xs font-mono text-neutral-400 hover:text-[#FF4D4D] transition underline underline-offset-4"
                      title="Disattiva avviso"
                    >
                      Svuota
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
