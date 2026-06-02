'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function NoteViewerPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const [url, setUrl]       = useState(null)
  const [error, setError]   = useState(null)
  const [note, setNote]     = useState(null)
  const iframeRef           = useRef(null)

  // Blocca click destro + shortcut screenshot
  useEffect(() => {
    const blockCtx = e => e.preventDefault()
    const blockKey = e => {
      if (['PrintScreen','F12'].includes(e.code)) { e.preventDefault(); return }
      if ((e.metaKey || e.ctrlKey) && ['KeyS','KeyP'].includes(e.code)) e.preventDefault()
      if (e.metaKey && e.shiftKey && ['Digit3','Digit4','Digit5'].includes(e.code)) e.preventDefault()
    }
    document.addEventListener('contextmenu', blockCtx)
    document.addEventListener('keydown',     blockKey)
    return () => {
      document.removeEventListener('contextmenu', blockCtx)
      document.removeEventListener('keydown',     blockKey)
    }
  }, [])

  const fetchUrl = useCallback(async () => {
    setError(null)
    try {
      const res  = await fetch(`/api/notes/${id}/view`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore')
      setUrl(data.signedUrl)
      if (!note) setNote({ expiresIn: data.expiresIn })
      // Rinnova prima della scadenza
      setTimeout(fetchUrl, (data.expiresIn - 5) * 1000)
    } catch (e) {
      setError(e.message)
    }
  }, [id, note])

  useEffect(() => { fetchUrl() }, [fetchUrl])

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
      <p className="text-[#FF4D4D] font-mono text-sm">{error}</p>
      <button onClick={() => router.push('/accedi')}
        className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition">
        Accedi per continuare
      </button>
    </div>
  )

  if (!url) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-neutral-400 font-mono text-sm animate-pulse">Caricamento documento…</span>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] select-none" onCopy={e => e.preventDefault()}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] shrink-0">
        <button onClick={() => router.back()} className="text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">
          ← Indietro
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          Visualizzazione protetta ASSUML · Solo uso personale
        </span>
      </div>

      {/* PDF Viewer — uso iframe con token temporaneo */}
      <div className="flex-1 relative overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0 pointer-events-auto"
          title="Documento protetto"
          sandbox="allow-scripts allow-same-origin"
        />
        {/* Watermark overlay */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -30deg,
              transparent 0px, transparent 80px,
              rgba(0,0,0,0.04) 80px, rgba(0,0,0,0.04) 82px
            )`,
          }}
        />
      </div>
    </div>
  )
}
