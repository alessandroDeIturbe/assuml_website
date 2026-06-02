'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp'
const MAX_MB   = 50

export default function UploadPage() {
  const router = useRouter()
  const fileRef    = useRef(null)
  const [file, setFile]         = useState(null)
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [price, setPrice]       = useState('0')
  const [currency, setCurrency] = useState('CHF')
  const [status, setStatus]     = useState('idle') // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)

  // Modificato per accettare direttamente il file f o l'evento classico
  function handleFileSelection(f) {
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) { setErrorMsg(`File troppo grande (max ${MAX_MB} MB)`); return }
    setFile(f)
    setErrorMsg('')
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
  }

  function onFileChange(e) {
    const f = e.target.files?.[0]
    handleFileSelection(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) { setErrorMsg('Seleziona un file'); return }
    setStatus('uploading')
    setProgress(10)

    try {
      // 1. Richiedi presigned URL
      const metaRes = await fetch('/api/notes/upload', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       title.trim(),
          description: desc.trim(),
          price:       parseFloat(price) || 0,
          currency,
          fileName:    file.name,
          contentType: file.type,
        }),
      })
      const { noteId, uploadUrl, proxyUrl, error } = await metaRes.json()
      if (!metaRes.ok) throw new Error(error ?? 'Errore server')
      setProgress(40)

      // 2. PUT file — usa proxy same-origin in dev per evitare CORS MinIO
      const target  = proxyUrl ?? uploadUrl
      const headers = proxyUrl ? { 'Content-Type': file.type } : { 'Content-Type': file.type }
      const uploadRes = await fetch(target, {
        method:  'PUT',
        headers,
        body:    file,
      })
      if (!uploadRes.ok) {
        const msg = await uploadRes.text().catch(() => '')
        throw new Error(`Upload fallito (${uploadRes.status})${msg ? ': ' + msg : ''}`)
      }
      setProgress(100)
      setStatus('success')

      setTimeout(() => router.push('/appunti'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

      <div className="mb-10">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D] mb-4" />
        <h1 className="font-black text-4xl tracking-tight">Carica materiale</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Il file sarà in revisione fino all'approvazione da parte degli admin ASSUML.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Dropzone Corretta con e.preventDefault() globale */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragEnter={e => { e.preventDefault(); e.stopPropagation() }}
          onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
          onDrop={e => {
            e.preventDefault()
            e.stopPropagation()
            const f = e.dataTransfer.files?.[0]
            if (f) handleFileSelection(f)
          }}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center cursor-pointer hover:border-neutral-900 dark:hover:border-white transition bg-transparent"
        >
          <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={onFileChange} />
          {file
            ? <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{file.name} · {(file.size/1024/1024).toFixed(1)} MB</p>
            : <>
                <p className="text-sm text-neutral-500">Trascina qui o clicca per selezionare</p>
                <p className="text-xs font-mono text-neutral-400 mt-1">PDF, JPG, PNG · max {MAX_MB} MB</p>
              </>
          }
        </div>

        {/* Campi */}
        {[
          { label: 'Titolo *',     value: title,  set: setTitle,  type: 'text',   placeholder: 'Es. Armonia tonale — appunti completi' },
        ].map(({ label, value, set, type, placeholder }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</label>
            <input
              type={type} required value={value} onChange={e => set(e.target.value)}
              placeholder={placeholder}
              className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Descrizione</label>
          <textarea
            rows={3} value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Breve descrizione del contenuto…"
            className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition resize-none"
          />
        </div>

        {/* Prezzo */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Prezzo (0 = gratuito)</label>
            <input
              type="number" min="0" step="0.5" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
            />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Valuta</label>
            <select
              value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-2 text-sm focus:outline-none dark:bg-neutral-900"
            >
              <option>CHF</option>
              <option>EUR</option>
            </select>
          </div>
        </div>

        {errorMsg && <p className="text-[#FF4D4D] text-sm font-mono">{errorMsg}</p>}

        {/* Progress bar */}
        {status === 'uploading' && (
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-0.5">
            <div className="h-0.5 bg-[#00CFCF] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {status === 'success' && (
          <p className="text-sm font-mono text-[#AAFF00]">✓ Caricato. In attesa di approvazione.</p>
        )}

        <button
          type="submit"
          disabled={status === 'uploading' || status === 'success'}
          className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition disabled:opacity-40"
        >
          {status === 'uploading' ? 'Caricamento…' : 'Invia per revisione'}
        </button>
      </form>
    </div>
  )
}