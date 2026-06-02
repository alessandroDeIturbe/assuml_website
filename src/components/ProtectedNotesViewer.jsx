'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

// pdf.js loaded via CDN in layout.jsx:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs" type="module" />

const BLOCKED_KEYS = new Set([
  'PrintScreen', 'F12',
  // Cmd+Shift+3/4/5 (macOS), Ctrl+P, Ctrl+S
])

/**
 * ProtectedNotesViewer
 * @param {string}  signedUrl  - Short-lived signed URL from /api/notes/[id]/view
 * @param {string}  userId     - Logged-in user ID for watermark
 * @param {string}  noteTitle  - Display title
 */
export default function ProtectedNotesViewer({ signedUrl, userId, noteTitle }) {
  const containerRef = useRef(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const pdfDocRef = useRef(null)
  const renderTaskRef = useRef(null)

  // ── DRM: block right-click ────────────────────────────────────────────────
  useEffect(() => {
    const block = e => e.preventDefault()
    document.addEventListener('contextmenu', block)
    return () => document.removeEventListener('contextmenu', block)
  }, [])

  // ── DRM: block screenshot shortcuts & devtools ────────────────────────────
  useEffect(() => {
    const onKey = e => {
      if (BLOCKED_KEYS.has(e.code)) { e.preventDefault(); return }
      // Cmd/Ctrl combos: S, P, Shift+3, Shift+4, Shift+5
      const mod = e.metaKey || e.ctrlKey
      if (mod && (e.code === 'KeyS' || e.code === 'KeyP')) { e.preventDefault(); return }
      if (e.metaKey && e.shiftKey && ['Digit3','Digit4','Digit5'].includes(e.code)) {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // ── DRM: blur canvas on visibility change ────────────────────────────────
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && containerRef.current) {
        containerRef.current.style.filter = 'blur(20px)'
      } else if (containerRef.current) {
        containerRef.current.style.filter = 'none'
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // ── PDF rendering ─────────────────────────────────────────────────────────
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDocRef.current || !containerRef.current) return
    const canvas = containerRef.current.querySelector('canvas')
    if (!canvas) return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    const page = await pdfDocRef.current.getPage(pageNum)
    const scale = Math.min(
      (containerRef.current.clientWidth - 32) / page.getViewport({ scale: 1 }).width,
      1.6
    )
    const vp = page.getViewport({ scale })
    const ctx = canvas.getContext('2d')
    canvas.width  = vp.width
    canvas.height = vp.height

    const task = page.render({ canvasContext: ctx, viewport: vp })
    renderTaskRef.current = task

    try {
      await task.promise
      drawWatermark(ctx, canvas.width, canvas.height, userId)
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error(e)
    }
  }, [userId])

  const drawWatermark = (ctx, w, h, uid) => {
    ctx.save()
    ctx.globalAlpha = 0.10
    ctx.fillStyle = '#0A0A0A'
    ctx.font = `${Math.max(14, w * 0.018)}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.translate(w / 2, h / 2)
    ctx.rotate(-Math.PI / 6)
    const label = `ASSUML • ${uid} • Solo uso personale`
    // tile watermark
    const step = 140
    for (let y = -h; y < h; y += step) {
      for (let x = -w; x < w; x += step) {
        ctx.fillText(label, x, y)
      }
    }
    ctx.restore()
  }

  // load PDF
  useEffect(() => {
    if (!signedUrl) return
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const pdfjsLib = window['pdfjs-dist/build/pdf']
        if (!pdfjsLib) throw new Error('pdf.js non caricato')
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs'

        const doc = await pdfjsLib.getDocument({ url: signedUrl, disableStream: false }).promise
        if (cancelled) return
        pdfDocRef.current = doc
        setTotalPages(doc.numPages)
        setCurrentPage(1)
        setLoading(false)
      } catch (e) {
        if (!cancelled) setError(e.message)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [signedUrl])

  useEffect(() => {
    if (!loading && !error) renderPage(currentPage)
  }, [currentPage, loading, error, renderPage])

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] dark:bg-[#111] select-none" onCopy={e => e.preventDefault()}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#0A0A0A]">
        <span className="text-sm font-medium truncate max-w-xs">{noteTitle}</span>
        <span className="text-xs font-mono text-[#6B6B6B] dark:text-[#888] ml-4 shrink-0">
          {loading ? '…' : `${currentPage} / ${totalPages}`}
        </span>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4 transition-[filter]"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {loading && (
          <div className="mt-20 flex flex-col items-center gap-2 text-[#6B6B6B] dark:text-[#888]">
            <span className="animate-spin text-2xl">⟳</span>
            <span className="text-xs font-mono">Caricamento…</span>
          </div>
        )}
        {error && (
          <div className="mt-20 text-sm text-[#FF4D4D] font-mono">{error}</div>
        )}
        {!loading && !error && (
          <canvas
            className="shadow-lg rounded pointer-events-none"
            style={{ maxWidth: '100%' }}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-3 border-t border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#0A0A0A]">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-xs font-mono rounded border border-[#E0E0E0] dark:border-[#333] disabled:opacity-30 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition"
          >
            ← Prec
          </button>
          <span className="text-xs font-mono text-[#6B6B6B] dark:text-[#888]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-xs font-mono rounded border border-[#E0E0E0] dark:border-[#333] disabled:opacity-30 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition"
          >
            Succ →
          </button>
        </div>
      )}

      {/* DRM notice */}
      <div className="text-center py-1 bg-[#0A0A0A] dark:bg-[#FF4D4D]/10">
        <span className="text-[10px] font-mono text-white/50 dark:text-[#FF4D4D]/60 tracking-widest uppercase">
          Visualizzazione protetta ASSUML • Vietata la riproduzione
        </span>
      </div>
    </div>
  )
}
