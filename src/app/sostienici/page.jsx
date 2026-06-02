'use client'
import { useState } from 'react'

export default function SostienicPage() {
  const [amount, setAmount]   = useState('')
  const [custom, setCustom]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const PRESETS = [10, 25, 50, 100]

  async function handleDonate(e) {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val < 1) { setError('Inserisci un importo valido (min. 1 CHF)'); return }
    setError(null)
    setLoading(true)
    try {
      const res  = await fetch('/api/donate/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: val }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore server')
      window.location.href = data.url
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* Header */}
      <section className="py-20 border-b border-neutral-200 dark:border-neutral-700">
        <span className="inline-block w-2 h-2 rounded-full bg-[#AAFF00] mb-6" />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Sostienici
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-lg max-w-xl">
          Le tue donazioni finanziano eventi, produzioni musicali e borse di studio
          per gli studenti del Conservatorio della Svizzera Italiana.
        </p>
      </section>

      {/* Form donazione */}
      <section className="py-20 grid md:grid-cols-[1fr_1fr] gap-24 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h2 className="font-bold text-3xl tracking-tight text-neutral-900 dark:text-white mb-2">Donazione libera</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">Scegli un importo o inserisci quello che preferisci. Pagamento via carta o Twint.</p>

          <form onSubmit={handleDonate} className="space-y-6">
            {/* Preset */}
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setAmount(String(p)); setCustom(false) }}
                  className={`py-3 text-sm font-mono font-bold border transition ${
                    amount === String(p) && !custom
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'border-neutral-300 hover:border-neutral-900'
                  }`}
                >
                  {p} CHF
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setCustom(true); setAmount('') }}
                className={`text-xs font-mono underline underline-offset-4 transition ${custom ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}
              >
                Importo personalizzato
              </button>
              {custom && (
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="CHF"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="border-b border-neutral-900 text-sm font-mono py-1 px-2 w-28 focus:outline-none"
                  autoFocus
                />
              )}
            </div>

            {error && <p className="text-[#FF4D4D] text-sm font-mono">{error}</p>}

            <button
              type="submit"
              disabled={!amount || loading}
              className="w-full py-4 bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Reindirizzamento…' : `Dona ${amount ? `${amount} CHF` : ''} →`}
            </button>
            <p className="text-xs text-neutral-400 font-mono">Pagamento sicuro via Stripe. Twint disponibile.</p>
          </form>
        </div>

        {/* Quote sostenitore */}
        <div className="space-y-6">
          <h2 className="font-bold text-3xl tracking-tight text-neutral-900 dark:text-white">Quote sostenitore</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Diventa membro sostenitore annuale e supporta l'associazione in modo continuativo.</p>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {[
              { label: 'Sostenitore Base',       amount: 50,  desc: 'Nome nei credits degli eventi' },
              { label: 'Sostenitore Plus',        amount: 150, desc: 'Accesso anticipato agli eventi + credits' },
              { label: 'Socio Istituzionale',     amount: 500, desc: 'Logo su materiali, inviti VIP, report annuale' },
            ].map(({ label, amount: a, desc }) => (
              <div key={label} className="py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white">{label}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{desc}</p>
                </div>
                <span className="font-mono font-bold text-sm shrink-0 text-neutral-900 dark:text-neutral-100">{a} CHF/anno</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400 font-mono">Contattaci a <a href="mailto:info@assuml.ch" className="underline">info@assuml.ch</a> per le quote istituzionali.</p>
        </div>
      </section>

    </div>
  )
}
