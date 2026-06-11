'use client'
import { useState, useCallback } from 'react'

// ── Helpers ───────────────────────────────────────────────────────────────
function Field({ label, value, onChange, multiline = false, hint }) {
  const cls = "w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition resize-none"
  return (
    <div className="space-y-1">
      <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
      {hint && <p className="text-[10px] font-mono text-neutral-400">{hint}</p>}
      {multiline
        ? <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} className={cls} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} />
      }
    </div>
  )
}

function ArrayField({ label, items, onChange, fields }) {
  const add = () => {
    const blank = Object.fromEntries(fields.map(f => [f, '']))
    onChange([...items, blank])
  }
  const update = (i, key, val) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [key]: val } : item)
    onChange(next)
  }
  const remove = i => onChange(items.filter((_, idx) => idx !== i))
  const move = (i, dir) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
        <button type="button" onClick={add}
          className="text-[10px] font-mono px-2 py-1 border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-white transition">
          + Aggiungi
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-[10px] font-mono text-neutral-400">Nessun elemento.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 relative">
          <div className="absolute top-2 right-2 flex gap-1">
            <button type="button" onClick={() => move(i, -1)} className="text-[10px] font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-1 transition">↑</button>
            <button type="button" onClick={() => move(i, +1)} className="text-[10px] font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-1 transition">↓</button>
            <button type="button" onClick={() => remove(i)} className="text-[10px] font-mono text-neutral-400 hover:text-[#FF4D4D] px-1 transition">✕</button>
          </div>
          {fields.map(f => (
            <div key={f} className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">{f}</label>
              <input type="text" value={item[f] ?? ''} onChange={e => update(i, f, e.target.value)}
                className="w-full border-b border-neutral-200 dark:border-neutral-700 bg-transparent py-1 text-xs focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function StringArrayField({ label, items, onChange }) {
  const add = () => onChange([...items, ''])
  const update = (i, val) => onChange(items.map((v, idx) => idx === i ? val : v))
  const remove = i => onChange(items.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
        <button type="button" onClick={add}
          className="text-[10px] font-mono px-2 py-1 border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-white transition">
          + Aggiungi
        </button>
      </div>
      {items.map((v, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="text" value={v} onChange={e => update(i, e.target.value)}
            className="flex-1 border-b border-neutral-200 dark:border-neutral-700 bg-transparent py-1 text-xs focus:outline-none focus:border-neutral-900 dark:focus:border-white transition" />
          <button type="button" onClick={() => remove(i)}
            className="text-[10px] font-mono text-neutral-400 hover:text-[#FF4D4D] transition">✕</button>
        </div>
      ))}
    </div>
  )
}

// ── Forme specifiche per slug ──────────────────────────────────────────────
function CisiamoForm({ content, onChange }) {
  const f = (key) => content[key] ?? ''
  const set = (key, val) => onChange({ ...content, [key]: val })
  const partners = Array.isArray(content.partners) ? content.partners : []

  return (
    <div className="space-y-8">
      <Field label="Sottotitolo hero" value={f('subtitle')} onChange={v => set('subtitle', v)} multiline />
      <Field label="Chi siamo — paragrafo 1" value={f('whoPara1')} onChange={v => set('whoPara1', v)} multiline />
      <Field label="Chi siamo — paragrafo 2" value={f('whoPara2')} onChange={v => set('whoPara2', v)} multiline />
      <ArrayField
        label="Festival partner"
        items={partners}
        onChange={v => set('partners', v)}
        fields={['name', 'role', 'href']}
      />
    </div>
  )
}

function RamificazioniForm({ content, onChange }) {
  const f = (key) => content[key] ?? ''
  const set = (key, val) => onChange({ ...content, [key]: val })
  const events  = Array.isArray(content.events)  ? content.events  : []
  const partners = Array.isArray(content.festivalPartners) ? content.festivalPartners : []

  return (
    <div className="space-y-8">
      <Field label="Edizione" value={f('edition')} onChange={v => set('edition', v)}
        hint="Es. Prima edizione · Lugano, autunno 2025" />
      <Field label="Hero — paragrafo 1" value={f('heroPara1')} onChange={v => set('heroPara1', v)} multiline />
      <Field label="Hero — paragrafo 2" value={f('heroPara2')} onChange={v => set('heroPara2', v)} multiline />
      <Field label="Manifesto — titolo" value={f('manifestoTitle')} onChange={v => set('manifestoTitle', v)}
        multiline hint="Vai a capo con Invio per effetto verticale" />
      <Field label="Manifesto — testo 1" value={f('manifesto1')} onChange={v => set('manifesto1', v)} multiline />
      <Field label="Manifesto — testo 2" value={f('manifesto2')} onChange={v => set('manifesto2', v)} multiline />
      <ArrayField
        label="Programma (eventi)"
        items={events}
        onChange={v => set('events', v)}
        fields={['titolo', 'desc', 'luogo']}
      />
      <StringArrayField
        label="Partner festival"
        items={partners}
        onChange={v => set('festivalPartners', v)}
      />
    </div>
  )
}

// ── Editor principale ─────────────────────────────────────────────────────
export default function ProjectEditor({ slug, initialContent }) {
  const [content, setContent] = useState(initialContent)
  const [status,  setStatus]  = useState('idle') // idle | saving | saved | error

  const handleSave = useCallback(async () => {
    setStatus('saving')
    try {
      const res = await fetch(`/api/admin/projects/${slug}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(content),
      })
      if (!res.ok) throw new Error()
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [slug, content])

  return (
    <form onSubmit={e => { e.preventDefault(); handleSave() }} className="space-y-10">

      {slug === 'cisiamo'       && <CisiamoForm       content={content} onChange={setContent} />}
      {slug === 'ramificazioni' && <RamificazioniForm content={content} onChange={setContent} />}

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
        <button type="submit" disabled={status === 'saving'}
          className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition disabled:opacity-40">
          {status === 'saving' ? 'Salvataggio…' : 'Salva modifiche'}
        </button>
        {status === 'saved' && (
          <span className="text-xs font-mono text-[#AAFF00]">✓ Salvato. Ricarica la pagina pubblica per vedere le modifiche.</span>
        )}
        {status === 'error' && (
          <span className="text-xs font-mono text-[#FF4D4D]">Errore nel salvataggio.</span>
        )}
      </div>

    </form>
  )
}
