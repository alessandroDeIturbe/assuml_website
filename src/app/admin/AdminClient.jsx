'use client'
import { useState, useEffect, useCallback } from 'react'

const STATUS_LABEL = {
  PENDING_APPROVAL: { label: 'In revisione', color: '#D4AF37' },
  APPROVED:         { label: 'Approvato',    color: '#AAFF00' },
  REJECTED:         { label: 'Rifiutato',    color: '#FF4D4D' },
}

export default function AdminClient({ initialNotes, initialAnnouncements, initialPurchases, initialEvents = [], initialConvenzioni = [], initialCommittee = [] }) {
  const [notes,         setNotes]         = useState(initialNotes)
  const [announcements, setAnnouncements] = useState(initialAnnouncements ?? [])
  const [purchases,     setPurchases]     = useState(initialPurchases ?? [])
  const [events,        setEvents]        = useState(initialEvents)
  const [convenzioni,   setConvenzioni]   = useState(initialConvenzioni)
  const [committee,     setCommittee]     = useState(initialCommittee)

  // Comitato form
  const [cmName,   setCmName]   = useState('')
  const [cmRole,   setCmRole]   = useState('')
  const [cmEmail,  setCmEmail]  = useState('')
  const [cmOrder,  setCmOrder]  = useState(0)
  const [cmStatus, setCmStatus] = useState(null)
  const [cmEdit,   setCmEdit]   = useState(null)  // { id, name, role, email, order } | null

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

  // ── Comitato ─────────────────────────────────────────────────────────
  async function addMember(e) {
    e.preventDefault()
    setCmStatus('loading')
    const res = await fetch('/api/admin/committee', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cmName, role: cmRole, email: cmEmail || null, order: Number(cmOrder) }),
    })
    if (res.ok) {
      const item = await res.json()
      setCommittee(c => [...c, item].sort((a, b) => a.order - b.order))
      setCmName(''); setCmRole(''); setCmEmail(''); setCmOrder(0)
      setCmStatus('ok'); setTimeout(() => setCmStatus(null), 2000)
    } else { setCmStatus('error') }
  }

  async function saveMember(e) {
    e.preventDefault()
    setCmStatus('loading')
    const res = await fetch(`/api/admin/committee/${cmEdit.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cmEdit.name, role: cmEdit.role, email: cmEdit.email || null, order: Number(cmEdit.order) }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCommittee(c => c.map(m => m.id === updated.id ? updated : m).sort((a, b) => a.order - b.order))
      setCmEdit(null); setCmStatus('saved'); setTimeout(() => setCmStatus(null), 2000)
    } else { setCmStatus('error') }
  }

  async function deleteMember(id) {
    await fetch(`/api/admin/committee/${id}`, { method: 'DELETE' })
    setCommittee(c => c.filter(m => m.id !== id))
  }

  // ── Bacheca: svuota/disattiva ─────────────────────────────────────────
  async function deactivate(id) {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) setAnnouncements(a => a.filter(x => x.id !== id))
  }

  // ── Guida studente ────────────────────────────────────────────────────
  const [guida,      setGuida]     = useState([])
  const [gsTitle,    setGsTitle]   = useState('')
  const [gsBody,     setGsBody]    = useState('')
  const [gsOrder,    setGsOrder]   = useState(0)
  const [gsStatus,   setGsStatus]  = useState(null)
  const [gsEdit,     setGsEdit]    = useState(null) // { id, titolo, corpo, order } | null

  useEffect(() => {
    fetch('/api/admin/guida').then(r => r.json()).then(setGuida).catch(() => {})
  }, [])

  async function addGuidaSection(e) {
    e.preventDefault()
    setGsStatus('loading')
    const res = await fetch('/api/admin/guida', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titolo: gsTitle, corpo: gsBody, order: Number(gsOrder) }),
    })
    if (res.ok) {
      const item = await res.json()
      setGuida(g => [...g, item].sort((a, b) => a.order - b.order))
      setGsTitle(''); setGsBody(''); setGsOrder(0)
      setGsStatus('ok'); setTimeout(() => setGsStatus(null), 2000)
    } else { setGsStatus('error') }
  }

  async function saveGuidaSection(e) {
    e.preventDefault()
    setGsStatus('loading')
    const res = await fetch(`/api/admin/guida/${gsEdit.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titolo: gsEdit.titolo, corpo: gsEdit.corpo, order: Number(gsEdit.order) }),
    })
    if (res.ok) {
      const updated = await res.json()
      setGuida(g => g.map(s => s.id === updated.id ? updated : s).sort((a, b) => a.order - b.order))
      setGsEdit(null); setGsStatus('saved'); setTimeout(() => setGsStatus(null), 2000)
    } else { setGsStatus('error') }
  }

  async function deleteGuidaSection(id) {
    await fetch(`/api/admin/guida/${id}`, { method: 'DELETE' })
    setGuida(g => g.filter(s => s.id !== id))
  }

  // ── Storage MinIO browser ─────────────────────────────────────────────
  const [storageFiles,  setStorageFiles]  = useState(null)  // null = non caricato
  const [storageStatus, setStorageStatus] = useState('idle') // idle|loading|error
  const [storagePrefix, setStoragePrefix] = useState('')

  const loadStorage = useCallback(async (prefix = storagePrefix) => {
    setStorageStatus('loading')
    try {
      const res  = await fetch(`/api/admin/storage?prefix=${encodeURIComponent(prefix)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStorageFiles(data)
      setStorageStatus('idle')
    } catch (e) {
      setStorageStatus('error:' + (e.message ?? 'Errore'))
    }
  }, [storagePrefix])

  async function openPresign(key) {
    const res  = await fetch(`/api/admin/storage/presign?key=${encodeURIComponent(key)}`)
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
  }

  const MINIO_CONSOLE = process.env.NEXT_PUBLIC_MINIO_CONSOLE ?? 'http://localhost:9001'

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

      {/* ── Gestione Eventi ───────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-8 tracking-tight">Gestione eventi</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <form onSubmit={addEvent} className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Aggiungi evento</h3>
            {[
              { label: 'Titolo *', value: evTitle, set: setEvTitle, type: 'text',     placeholder: 'Es. Masterclass Composizione' },
              { label: 'Tipo',     value: evTipo,  set: setEvTipo,  type: 'text',     placeholder: 'Concerto / Masterclass / Festival…' },
              { label: 'Luogo',    value: evLuogo, set: setEvLuogo, type: 'text',     placeholder: 'Es. Conservatorio CSI' },
              { label: 'Data *',   value: evDate,  set: setEvDate,  type: 'datetime-local', placeholder: '' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
                <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                  className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Descrizione</label>
              <textarea rows={2} value={evDesc} onChange={e => setEvDesc(e.target.value)}
                className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none resize-none" />
            </div>
            {evStatus === 'ok'    && <p className="text-[#AAFF00] text-xs font-mono">✓ Evento aggiunto.</p>}
            {evStatus === 'error' && <p className="text-[#FF4D4D] text-xs font-mono">Errore.</p>}
            <button type="submit" disabled={evStatus === 'loading'}
              className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
              {evStatus === 'loading' ? 'Salvataggio…' : 'Aggiungi evento'}
            </button>
          </form>
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              Prossimi eventi <span className="text-xs font-mono text-neutral-400">({events.length})</span>
            </h3>
            {events.length === 0
              ? <p className="text-xs font-mono text-neutral-400">Nessun evento.</p>
              : <div className="space-y-3 max-h-64 overflow-y-auto">
                  {events.map(ev => (
                    <div key={ev.id} className="flex items-center justify-between gap-4 px-3 py-2 border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">{ev.title}</p>
                        <p className="text-[10px] font-mono text-neutral-400">
                          {new Date(ev.date).toLocaleDateString('it-IT')} · {ev.luogo ?? '—'}
                        </p>
                      </div>
                      <button onClick={() => deleteEvent(ev.id)}
                        className="text-xs font-mono text-neutral-400 hover:text-[#FF4D4D] transition shrink-0">Rimuovi</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </section>

      {/* ── Gestione Comitato ────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-8 tracking-tight">Gestione comitato</h2>
        <div className="grid md:grid-cols-2 gap-12">

          {/* Form aggiunta / modifica */}
          {cmEdit ? (
            <form onSubmit={saveMember} className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Modifica membro</h3>
              {[
                { label: 'Nome *',   val: cmEdit.name,  key: 'name' },
                { label: 'Carica *', val: cmEdit.role,  key: 'role' },
                { label: 'Email',    val: cmEdit.email ?? '', key: 'email' },
              ].map(({ label, val, key }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
                  <input type="text" value={val}
                    onChange={e => setCmEdit(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Ordine</label>
                <input type="number" value={cmEdit.order}
                  onChange={e => setCmEdit(prev => ({ ...prev, order: e.target.value }))}
                  className="w-24 border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none" />
              </div>
              {cmStatus === 'saved' && <p className="text-[#AAFF00] text-xs font-mono">✓ Salvato.</p>}
              {cmStatus === 'error' && <p className="text-[#FF4D4D] text-xs font-mono">Errore.</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={cmStatus === 'loading'}
                  className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
                  {cmStatus === 'loading' ? 'Salvataggio…' : 'Salva modifiche'}
                </button>
                <button type="button" onClick={() => setCmEdit(null)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:opacity-75 transition">
                  Annulla
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={addMember} className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Aggiungi membro</h3>
              {[
                { label: 'Nome *',   value: cmName,  set: setCmName,  placeholder: 'Es. Mario Rossi' },
                { label: 'Carica *', value: cmRole,  set: setCmRole,  placeholder: 'Es. Presidente' },
                { label: 'Email',    value: cmEmail, set: setCmEmail, placeholder: 'Es. mario@assuml.ch' },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
                  <input type="text" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                    className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Ordine visualizzazione</label>
                <input type="number" value={cmOrder} onChange={e => setCmOrder(e.target.value)} min={0}
                  className="w-24 border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none" />
              </div>
              {cmStatus === 'ok'    && <p className="text-[#AAFF00] text-xs font-mono">✓ Membro aggiunto.</p>}
              {cmStatus === 'error' && <p className="text-[#FF4D4D] text-xs font-mono">Errore.</p>}
              <button type="submit" disabled={cmStatus === 'loading'}
                className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
                {cmStatus === 'loading' ? 'Salvataggio…' : 'Aggiungi membro'}
              </button>
            </form>
          )}

          {/* Lista membri */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              Comitato attuale <span className="text-xs font-mono text-neutral-400">({committee.length})</span>
            </h3>
            {committee.length === 0
              ? <p className="text-xs font-mono text-neutral-400">Nessun membro nel comitato.</p>
              : <div className="space-y-2 max-h-72 overflow-y-auto">
                  {committee.map(m => (
                    <div key={m.id} className="flex items-center justify-between gap-4 px-3 py-2.5 border border-neutral-200 dark:border-neutral-800">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{m.name}</p>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{m.role}</p>
                        {m.email && <p className="text-[10px] font-mono text-neutral-400">{m.email}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setCmEdit({ ...m })}
                          className="text-[10px] font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">Modifica</button>
                        <button onClick={() => deleteMember(m.id)}
                          className="text-[10px] font-mono text-neutral-400 hover:text-[#FF4D4D] transition">Rimuovi</button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </section>

      {/* ── Gestione Convenzioni ──────────────────────────────────────── */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-8 tracking-tight">Gestione convenzioni</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <form onSubmit={addConvenzione} className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Aggiungi convenzione</h3>
            {[
              { label: 'Titolo *',    value: cvTitle, set: setCvTitle, placeholder: 'Es. Libreria Melisa' },
              { label: 'Sottotitolo', value: cvSub,   set: setCvSub,   placeholder: 'Es. Sconto 15% su tutto' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
                <input type="text" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                  className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
              </div>
            ))}
            <p className="text-[10px] font-mono text-neutral-400">
              Per aggiungere la foto, carica prima il file tramite il pannello MinIO e inserisci il key nel DB.
            </p>
            {cvStatus === 'ok'    && <p className="text-[#AAFF00] text-xs font-mono">✓ Aggiunta.</p>}
            {cvStatus === 'error' && <p className="text-[#FF4D4D] text-xs font-mono">Errore.</p>}
            <button type="submit" disabled={cvStatus === 'loading'}
              className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
              {cvStatus === 'loading' ? 'Salvataggio…' : 'Aggiungi convenzione'}
            </button>
          </form>
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              Convenzioni attive <span className="text-xs font-mono text-neutral-400">({convenzioni.length})</span>
            </h3>
            {convenzioni.length === 0
              ? <p className="text-xs font-mono text-neutral-400">Nessuna convenzione.</p>
              : <div className="space-y-3 max-h-64 overflow-y-auto">
                  {convenzioni.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-4 px-3 py-2 border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">{c.title}</p>
                        {c.subtitle && <p className="text-[10px] font-mono text-neutral-400">{c.subtitle}</p>}
                      </div>
                      <button onClick={() => deleteConvenzione(c.id)}
                        className="text-xs font-mono text-neutral-400 hover:text-[#FF4D4D] transition shrink-0">Rimuovi</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </section>

      {/* ── Guida Studente ───────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-8 tracking-tight">Guida per lo studente</h2>
        <div className="grid md:grid-cols-2 gap-12">

          {/* Form aggiunta / modifica */}
          {gsEdit ? (
            <form onSubmit={saveGuidaSection} className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Modifica sezione</h3>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Titolo *</label>
                <input type="text" value={gsEdit.titolo}
                  onChange={e => setGsEdit(p => ({ ...p, titolo: e.target.value }))}
                  className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Testo *</label>
                <textarea rows={6} value={gsEdit.corpo}
                  onChange={e => setGsEdit(p => ({ ...p, corpo: e.target.value }))}
                  className="w-full border border-neutral-300 dark:border-neutral-700 bg-transparent p-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition resize-y" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Ordine</label>
                <input type="number" value={gsEdit.order}
                  onChange={e => setGsEdit(p => ({ ...p, order: e.target.value }))}
                  className="w-24 border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none" />
              </div>
              {gsStatus === 'saved' && <p className="text-[#AAFF00] text-xs font-mono">✓ Salvato.</p>}
              {gsStatus === 'error' && <p className="text-[#FF4D4D] text-xs font-mono">Errore.</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={gsStatus === 'loading'}
                  className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
                  {gsStatus === 'loading' ? 'Salvataggio…' : 'Salva'}
                </button>
                <button type="button" onClick={() => setGsEdit(null)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:opacity-75 transition">
                  Annulla
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={addGuidaSection} className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Aggiungi sezione</h3>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Titolo *</label>
                <input type="text" value={gsTitle} onChange={e => setGsTitle(e.target.value)} placeholder="Es. 7. Borse di mobilità"
                  className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Testo *</label>
                <textarea rows={6} value={gsBody} onChange={e => setGsBody(e.target.value)} placeholder="Testo della sezione…"
                  className="w-full border border-neutral-300 dark:border-neutral-700 bg-transparent p-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition resize-y" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Ordine visualizzazione</label>
                <input type="number" value={gsOrder} onChange={e => setGsOrder(e.target.value)} min={0}
                  className="w-24 border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none" />
              </div>
              {gsStatus === 'ok'    && <p className="text-[#AAFF00] text-xs font-mono">✓ Sezione aggiunta.</p>}
              {gsStatus === 'error' && <p className="text-[#FF4D4D] text-xs font-mono">Errore.</p>}
              <button type="submit" disabled={gsStatus === 'loading'}
                className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
                {gsStatus === 'loading' ? 'Salvataggio…' : 'Aggiungi sezione'}
              </button>
            </form>
          )}

          {/* Lista sezioni */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              Sezioni attuali <span className="text-xs font-mono text-neutral-400">({guida.length})</span>
            </h3>
            <p className="text-[10px] font-mono text-neutral-400 mb-3">
              Se il DB è vuoto, la pagina mostra il contenuto statico predefinito.
            </p>
            {guida.length === 0
              ? <p className="text-xs font-mono text-neutral-400">Nessuna sezione nel DB (si usa il fallback statico).</p>
              : <div className="space-y-2 max-h-80 overflow-y-auto">
                  {guida.map(s => (
                    <div key={s.id} className="flex items-start justify-between gap-4 px-3 py-2.5 border border-neutral-200 dark:border-neutral-800">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{s.titolo}</p>
                        <p className="text-[10px] font-mono text-neutral-400 mt-0.5 line-clamp-2">{s.corpo}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-0.5">
                        <button onClick={() => setGsEdit({ ...s })}
                          className="text-[10px] font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">Modifica</button>
                        <button onClick={() => deleteGuidaSection(s.id)}
                          className="text-[10px] font-mono text-neutral-400 hover:text-[#FF4D4D] transition">Rimuovi</button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </section>

      {/* ── Storage MinIO ────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <div className="flex items-start justify-between mb-8">
          <h2 className="font-bold text-2xl text-neutral-900 dark:text-white tracking-tight">Storage MinIO</h2>
          <a href={MINIO_CONSOLE} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-white transition">
            Apri console MinIO →
          </a>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input type="text" value={storagePrefix} onChange={e => setStoragePrefix(e.target.value)}
              placeholder="Prefisso (es. notes/)" onKeyDown={e => e.key === 'Enter' && loadStorage()}
              className="flex-1 border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
            <button onClick={() => loadStorage()} disabled={storageStatus === 'loading'}
              className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
              {storageStatus === 'loading' ? '…' : 'Carica'}
            </button>
          </div>

          {storageStatus.startsWith('error') && (
            <p className="text-xs font-mono text-[#FF4D4D]">{storageStatus.replace('error:', '')}</p>
          )}

          {storageFiles === null && storageStatus !== 'loading' && (
            <p className="text-xs font-mono text-neutral-400">Clicca "Carica" per visualizzare i file nel bucket.</p>
          )}

          {Array.isArray(storageFiles) && (
            <div>
              <p className="text-[10px] font-mono text-neutral-400 mb-3">{storageFiles.length} oggetti trovati</p>
              {storageFiles.length === 0
                ? <p className="text-xs font-mono text-neutral-400">Nessun file con questo prefisso.</p>
                : <div className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-96 overflow-y-auto">
                    {storageFiles.map(f => (
                      <div key={f.key} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-neutral-900 dark:text-white truncate">{f.key}</p>
                          <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                            {f.size != null ? `${(f.size / 1024).toFixed(1)} KB` : ''}
                            {f.lastModified ? ` · ${new Date(f.lastModified).toLocaleDateString('it-IT')}` : ''}
                          </p>
                        </div>
                        <button onClick={() => openPresign(f.key)}
                          className="text-[10px] font-mono px-2 py-1 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-white transition shrink-0">
                          Apri ↗
                        </button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
