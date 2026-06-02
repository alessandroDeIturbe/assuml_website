'use client'
import { useState }       from 'react'
import Link               from 'next/link'
import { useLang }        from '@/contexts/LanguageContext'
import { useSession }     from 'next-auth/react'
import PayModal           from '@/components/PayModal'

export default function AppuntiClient({ notes: initial, isAdmin, purchasedIds = [] }) {
  const [notes,    setNotes]    = useState(initial)
  const [buying,   setBuying]   = useState(null)
  const [payNote,  setPayNote]  = useState(null)  // nota per modale P2P
  const [devMsg,   setDevMsg]   = useState(null)
  const { t }                   = useLang()
  const { data: session }       = useSession()

  async function handleDelete(id) {
    if (!confirm('Eliminare questo appunto dalla lista pubblica?')) return
    const res = await fetch(`/api/notes/delete?id=${id}`, { method: 'DELETE' })
    if (res.ok) setNotes(ns => ns.filter(n => n.id !== id))
  }

  async function handleBuy(note) {
    if (!session?.user) { window.location.href = '/accedi'; return }

    // Note gratuite o modalità dev → flusso diretto
    if (note.price === 0 || process.env.NODE_ENV === 'development') {
      setBuying(note.id)
      setDevMsg(null)
      try {
        const res  = await fetch('/api/notes/purchase', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ noteId: note.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Errore')
        if (data.sim) { setDevMsg(data.message); setTimeout(() => setDevMsg(null), 4000) }
        if (data.redirect) window.location.href = data.redirect
      } catch (e) { alert(e.message) }
      finally { setBuying(null) }
      return
    }

    // Note a pagamento → modale P2P
    setPayNote(note)
  }

  if (notes.length === 0) return (
    <div className="py-24 text-center">
      <p className="text-neutral-400 dark:text-neutral-600 font-mono text-sm">
        {t('appunti.empty') ?? 'Nessun appunto disponibile al momento.'}
      </p>
      <Link href="/appunti/upload"
        className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-[#FF4D4D] transition">
        {t('appunti.carica')} →
      </Link>
    </div>
  )

  return (
    <>
      {/* Modale P2P */}
      {payNote && (
        <PayModal
          note={payNote}
          onClose={() => setPayNote(null)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {devMsg && (
        <div className="mb-6 px-5 py-3 border-l-2 border-[#AAFF00] bg-neutral-50 dark:bg-neutral-900 text-xs font-mono text-[#AAFF00]">
          {devMsg}
        </div>
      )}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {notes.map((note) => {
          const owned   = purchasedIds.includes(note.id)
          const isFree  = note.price === 0
          const canView = owned || isFree || isAdmin

          return (
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
                  {isFree ? t('appunti.gratis') : `${note.price} ${note.currency}`}
                </span>

                {canView ? (
                  <Link href={`/appunti/${note.id}`}
                    className="px-4 py-2 border border-neutral-900 dark:border-neutral-300 text-neutral-900 dark:text-neutral-100 text-xs font-semibold hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition">
                    {t('notes.viewBtn')}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleBuy(note)}
                    disabled={buying === note.id}
                    className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40"
                  >
                    {buying === note.id ? '…' : t('notes.buyBtn')}
                  </button>
                )}

                {isAdmin && (
                  <button onClick={() => handleDelete(note.id)}
                    className="text-xs font-mono text-neutral-400 hover:text-[#FF4D4D] transition underline underline-offset-4">
                    {t('notes.deleteBtn')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
