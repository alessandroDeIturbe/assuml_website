'use client'
import { useState, useRef } from 'react'

/**
 * Modale P2P: mostra IBAN/Twint del venditore e richiede upload ricevuta.
 * @param {object}   note        - { id, title, price, currency, author: { name, paymentInfo } }
 * @param {Function} onClose     - chiudi modale
 * @param {Function} onSuccess   - callback dopo upload ricevuta OK
 */
export default function PayModal({ note, onClose, onSuccess }) {
  const [file,    setFile]    = useState(null)
  const [status,  setStatus]  = useState('idle') // idle | uploading | done | error
  const [errMsg,  setErrMsg]  = useState('')
  const fileRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) { setErrMsg('Allega la ricevuta di pagamento.'); return }
    setStatus('uploading')
    setErrMsg('')

    const form = new FormData()
    form.append('receipt', file)

    try {
      const res  = await fetch(`/api/notes/${note.id}/pay`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore')
      setStatus('done')
      setTimeout(() => { onSuccess?.(); onClose() }, 2000)
    } catch (e) {
      setErrMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-8 space-y-6 relative animate-fade-in">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-lg">✕</button>

        {/* Header */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#FF4D4D] mb-2">Acquisto P2P</p>
          <h2 className="font-bold text-xl text-neutral-900 dark:text-white leading-tight">{note.title}</h2>
          <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white mt-1">
            {note.price} {note.currency}
          </p>
        </div>

        {/* Coordinate del venditore */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            Coordinate di pagamento — {note.author?.name ?? 'Venditore'}
          </p>
          {note.author?.paymentInfo ? (
            <p className="text-sm font-mono text-neutral-900 dark:text-white whitespace-pre-wrap break-all">
              {note.author.paymentInfo}
            </p>
          ) : (
            <p className="text-xs text-neutral-400 font-mono italic">
              Il venditore non ha ancora inserito le coordinate di pagamento.
              Contattalo direttamente.
            </p>
          )}
        </div>

        {/* Upload ricevuta */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
              Carica ricevuta di pagamento *
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files?.[0] ?? null) }}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center cursor-pointer hover:border-neutral-900 dark:hover:border-white transition"
            >
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
              {file
                ? <p className="text-xs font-mono font-bold text-neutral-900 dark:text-white">{file.name}</p>
                : <p className="text-xs text-neutral-400">PDF, JPG o PNG · Trascina o clicca</p>
              }
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-2">
              La ricevuta verrà verificata dall'admin ASSUML prima di sbloccare l'accesso al file.
            </p>
          </div>

          {errMsg && <p className="text-[#FF4D4D] text-xs font-mono">{errMsg}</p>}
          {status === 'done' && (
            <p className="text-[#AAFF00] text-xs font-mono">✓ Ricevuta inviata. In attesa di verifica admin.</p>
          )}

          <button
            type="submit"
            disabled={status === 'uploading' || status === 'done'}
            className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition disabled:opacity-40"
          >
            {status === 'uploading' ? 'Invio in corso…' : 'Invia ricevuta e richiedi accesso'}
          </button>
        </form>
      </div>
    </div>
  )
}
