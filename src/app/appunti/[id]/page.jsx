'use client'
import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function NoteViewerPage() {
  const { id }   = useParams()
  const router   = useRouter()

  // DRM: blocca click destro + shortcut screenshot
  useEffect(() => {
    const blockCtx = e => e.preventDefault()
    const blockKey = e => {
      if (['PrintScreen', 'F12'].includes(e.code)) { e.preventDefault(); return }
      if ((e.metaKey || e.ctrlKey) && ['KeyS', 'KeyP'].includes(e.code)) e.preventDefault()
      if (e.metaKey && e.shiftKey && ['Digit3','Digit4','Digit5'].includes(e.code)) e.preventDefault()
    }
    const blurOnHide = () => {
      if (document.hidden && iframeWrap.current)
        iframeWrap.current.style.filter = 'blur(20px)'
      else if (iframeWrap.current)
        iframeWrap.current.style.filter = 'none'
    }
    document.addEventListener('contextmenu', blockCtx)
    document.addEventListener('keydown',     blockKey)
    document.addEventListener('visibilitychange', blurOnHide)
    return () => {
      document.removeEventListener('contextmenu', blockCtx)
      document.removeEventListener('keydown',     blockKey)
      document.removeEventListener('visibilitychange', blurOnHide)
    }
  }, [])

  const iframeWrap = useRef(null)

  // L'URL punta al proxy server-side: same-origin, nessun CORS, nessun "connessione negata"
  const streamUrl = `/api/notes/${id}/stream`

  return (
    <div
      className="flex flex-col h-[calc(100vh-3.5rem)] select-none"
      onCopy={e => e.preventDefault()}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] shrink-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
        >
          ← Indietro
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
          Visualizzazione protetta ASSUML · Solo uso personale
        </span>
      </div>

      {/* Viewer — iframe punta a /api/notes/[id]/stream (same-origin) */}
      <div ref={iframeWrap} className="flex-1 relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 transition-[filter]">
        <iframe
          src={streamUrl}
          className="w-full h-full border-0"
          title="Documento protetto"
          // allow-scripts per pdf.js interno al browser; allow-same-origin per accedere al contenuto
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />

        {/* Watermark overlay decorativo (non impedisce screenshot ma scoraggia) */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          aria-hidden
          style={{
            backgroundImage: `repeating-linear-gradient(
              -30deg,
              transparent 0px, transparent 90px,
              rgba(0,0,0,0.03) 90px, rgba(0,0,0,0.03) 92px
            )`,
          }}
        />
      </div>

      {/* DRM notice */}
      <div className="py-1 text-center bg-neutral-900 dark:bg-neutral-950 shrink-0">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Vietata la riproduzione · ASSUML DRM
        </span>
      </div>
    </div>
  )
}
