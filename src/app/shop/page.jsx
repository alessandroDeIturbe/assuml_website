'use client'
import { useState } from 'react'

export default function ShopPage() {
  const PRODOTTI = [
    { id: 'p1', nome: 'Felpa ASSUML',         prezzo: 45, valuta: 'CHF', tag: 'Abbigliamento', colori: ['Nero', 'Bianco'],    disponibile: true  },
    { id: 'p2', nome: 'T-Shirt Gradiente',     prezzo: 28, valuta: 'CHF', tag: 'Abbigliamento', colori: ['Bianco'],            disponibile: true  },
    { id: 'p3', nome: 'Tote Bag CiSiamo',      prezzo: 18, valuta: 'CHF', tag: 'Accessori',     colori: ['Naturale', 'Nero'],  disponibile: true  },
    { id: 'p4', nome: 'Spilla ASSUML',         prezzo: 6,  valuta: 'CHF', tag: 'Accessori',     colori: ['Argento'],          disponibile: true  },
    { id: 'p5', nome: 'Quaderno A5',           prezzo: 12, valuta: 'CHF', tag: 'Cartoleria',    colori: ['Bianco', 'Nero'],   disponibile: false },
    { id: 'p6', nome: 'Poster Festival Ramif.', prezzo: 15, valuta: 'CHF', tag: 'Arte',          colori: ['50×70 cm'],         disponibile: true  },
  ]

  const [loading, setLoading] = useState(null)
  const [error,   setError]   = useState(null)

  async function checkout(prodotto) {
    setLoading(prodotto.id)
    setError(null)
    try {
      const res = await fetch('/api/shop/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId: prodotto.id, name: prodotto.nome, price: prodotto.prezzo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore checkout')
      window.location.href = data.url
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const TAG_COLOR = { 'Abbigliamento': '#FF4D4D', 'Accessori': '#00CFCF', 'Cartoleria': '#AAFF00', 'Arte': '#A78BFA' }

  return (
    <div className="max-w-6xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#AAFF00] mb-6" />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Shop
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-base max-w-xl">
          Gadget ufficiali ASSUML. Ogni acquisto contribuisce direttamente ai fondi dell'associazione.
        </p>
      </section>

      {error && (
        <div className="mt-6 px-5 py-3 border-l-2 border-[#FF4D4D] bg-neutral-50 dark:bg-neutral-900">
          <p className="text-sm text-[#FF4D4D] font-mono">{error}</p>
        </div>
      )}

      <section className="py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 dark:bg-neutral-800">
          {PRODOTTI.map(p => (
            <div key={p.id} className="bg-white dark:bg-[#121212] p-8 flex flex-col gap-4">
              {/* Placeholder prodotto */}
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center rounded">
                <span className="font-black text-4xl" style={{
                  background: 'linear-gradient(90deg,#FF4D4D,#00CFCF,#AAFF00)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>A</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                    style={{ color: TAG_COLOR[p.tag] ?? '#888', borderColor: (TAG_COLOR[p.tag] ?? '#888') + '44' }}>
                    {p.tag}
                  </span>
                  {!p.disponibile && (
                    <span className="text-[10px] font-mono text-neutral-400">Esaurito</span>
                  )}
                </div>
                <h2 className="font-semibold text-base text-neutral-900 dark:text-white">{p.nome}</h2>
                <p className="text-xs text-neutral-400 font-mono">{p.colori.join(' · ')}</p>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {p.prezzo} {p.valuta}
                </span>
                <button
                  onClick={() => checkout(p)}
                  disabled={!p.disponibile || loading === p.id}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-75 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading === p.id ? '…' : 'Acquista'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs font-mono text-neutral-400">
          Spedizioni in Svizzera e UE. Pagamento via Stripe. Per ordini istituzionali: <a href="mailto:shop@assuml.ch" className="underline hover:text-[#AAFF00] transition">shop@assuml.ch</a>
        </p>
      </section>
    </div>
  )
}
