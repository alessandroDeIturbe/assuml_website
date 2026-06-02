'use client'
import { useState } from 'react'
import Link          from 'next/link'

const STATUS_LABEL = {
  PENDING_APPROVAL: { label: 'In revisione',  color: '#D4AF37' },
  APPROVED:         { label: 'Approvato',      color: '#AAFF00' },
  REJECTED:         { label: 'Rifiutato',      color: '#FF4D4D' },
}
const PURCHASE_STATUS = {
  ACTIVE:           { label: 'Accesso attivo',      color: '#AAFF00' },
  PENDING_APPROVAL: { label: 'In verifica admin',   color: '#D4AF37' },
  PENDING_RECEIPT:  { label: 'Ricevuta richiesta',  color: '#FF4D4D' },
}

export default function AreaClient({ user, myNotes, myPurchases }) {
  const [payInfo,   setPayInfo]   = useState(user?.paymentInfo ?? '')
  const [saving,    setSaving]    = useState(false)
  const [saveOk,    setSaveOk]    = useState(false)

  async function savePaymentInfo(e) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/user/payment-info', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ paymentInfo: payInfo }),
    })
    setSaving(false)
    if (res.ok) { setSaveOk(true); setTimeout(() => setSaveOk(false), 2500) }
  }

  return (
    <div className="max-w-5xl mx-auto px-6">

      {/* Header profilo */}
      <section className="py-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-6">
        {user?.image ? (
          <img src={user.image} alt="Avatar" referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
            onError={e => { e.currentTarget.style.display='none' }} />
        ) : (
          <div className="w-16 h-16 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center text-2xl font-black text-white dark:text-neutral-900">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div>
          <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">{user?.name ?? 'Utente'}</h1>
          <p className="text-sm font-mono text-neutral-400">{user?.email}</p>
        </div>
      </section>

      {/* Coordinate di pagamento P2P */}
      <section className="py-12 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">Coordinate di pagamento</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-lg">
          Il tuo IBAN, numero Twint o altri riferimenti bancari. Visibili agli studenti che vogliono acquistare i tuoi appunti.
        </p>
        <form onSubmit={savePaymentInfo} className="space-y-3 max-w-lg">
          <textarea
            rows={3}
            value={payInfo}
            onChange={e => setPayInfo(e.target.value)}
            placeholder={`Es.\nIBAN: CH56 0483 5012 3456 7800 9\nTwint: +41 79 123 45 67`}
            className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white transition resize-none"
          />
          {saveOk && <p className="text-[#AAFF00] text-xs font-mono">✓ Salvato.</p>}
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition disabled:opacity-40">
            {saving ? 'Salvataggio…' : 'Salva coordinate'}
          </button>
        </form>
      </section>

      {/* Appunti caricati */}
      <section className="py-12 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bold text-xl text-neutral-900 dark:text-white">Appunti caricati</h2>
          <Link href="/appunti/upload" className="text-xs font-mono underline underline-offset-4 hover:text-[#FF4D4D] transition">
            + Carica nuovo
          </Link>
        </div>
        {myNotes.length === 0 ? (
          <p className="text-sm text-neutral-400 font-mono">Nessun materiale caricato.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {myNotes.map(n => {
              const s = STATUS_LABEL[n.status] ?? { label: n.status, color: '#888' }
              return (
                <div key={n.id} className="py-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{n.title}</p>
                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString('it-IT')} ·{' '}
                      {n.price === 0 ? 'Gratuito' : `${n.price} ${n.currency}`}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 border shrink-0"
                    style={{ color: s.color, borderColor: s.color + '55' }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Acquisti */}
      <section className="py-12">
        <h2 className="font-bold text-xl text-neutral-900 dark:text-white mb-8">Appunti acquistati</h2>
        {myPurchases.length === 0 ? (
          <p className="text-sm text-neutral-400 font-mono">Nessun acquisto effettuato.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {myPurchases.map(p => {
              const ps = PURCHASE_STATUS[p.purchaseStatus] ?? { label: p.purchaseStatus, color: '#888' }
              return (
                <div key={p.id} className="py-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{p.note.title}</p>
                    <span className="text-[11px] font-mono px-2 py-0.5 border mt-1 inline-block"
                      style={{ color: ps.color, borderColor: ps.color + '55' }}>
                      {ps.label}
                    </span>
                  </div>
                  {p.purchaseStatus === 'ACTIVE' && (
                    <Link href={`/appunti/${p.note.id}`}
                      className="text-xs font-mono underline underline-offset-4 hover:text-[#00CFCF] transition shrink-0">
                      Leggi →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
