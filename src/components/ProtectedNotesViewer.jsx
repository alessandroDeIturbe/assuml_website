'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * ProtectedNotesViewer — DRM PDF viewer (Opzione B)
 * Il PDF arriva via `streamUrl` (/api/notes/[id]/stream): proxy server-side che
 * valida auth + acquisto senza mai esporre URL MinIO al browser.
 * Watermark: email + data, obliquo -30°, tiled, opacity 0.25
 * Screenshot OS-level non bloccabili → watermark rende ogni copia tracciabile.
 */
export default function ProtectedNotesViewer({ streamUrl, userId, userEmail, noteTitle }) {
  const containerRef  = useRef(null)
  const [totalPages,  setTotalPages]  = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const pdfDocRef     = useRef(null)
  const renderTaskRef = useRef(null)

  // ── DRM: blocco tasto destro ──────────────────────────────────────────────
  useEffect(() => {
    const block = e => e.preventDefault()
    document.addEventListener('contextmenu', block)
    return () => document.removeEventListener('contextmenu', block)
  }, [])

  // ── DRM: blocco shortcut browser-intercettabili ───────────────────────────
  useEffect(() => {
    const onKey = e => {
      if (e.code === 'PrintScreen' || e.code === 'F12') { e.preventDefault(); return }
      const mod = e.metaKey || e.ctrlKey
      if (mod && (e.code === 'KeyS' || e.code === 'KeyP')) { e.preventDefault(); return }
      if (e.metaKey && e.shiftKey && ['Digit3','Digit4','Digit5'].includes(e.code)) {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', onKey, { capture: true })
    return () => document.removeEventListener('keydown', onKey, { capture: true })
  }, [])

  // ── DRM: blur su visibilitychange ────────────────────────────────────────
  useEffect(() => {
    const onVis = () => {
      if (!containerRef.current) return
      containerRef.current.style.filter = document.hidden ? 'blur(20px)' : 'none'
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // ── DRM: blocco @media print ─────────────────────────────────────────────
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `@media print { body { display: none !important; } }`
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  // ── Watermark ─────────────────────────────────────────────────────────────
  const drawWatermark = useCallback((ctx, w, h) => {
    // Label: email se disponibile, fallback userId abbreviato
    const label  = userEmail ?? `uid:${(userId ?? '').slice(0, 12)}`
    const date   = new Date().toLocaleDateString('it-CH')
    const line1  = `ASSUML • ${label}`
    const line2  = `Solo uso personale • ${date}`
    const fontSize = Math.max(11, Math.round(w * 0.016))

    ctx.save()
    ctx.globalAlpha  = 0.25          // visibile ma non invadente
    ctx.fillStyle    = '#1a1a1a'
    ctx.font         = `${fontSize}px ui-monospace, monospace`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    // Ruota il canvas intorno al centro, poi tila
    ctx.translate(w / 2, h / 2)
    ctx.rotate(-Math.PI / 6)         // -30°

    const stepX = Math.round(w * 0.55)
    const stepY = Math.round(h * 0.22)
    const cols  = Math.ceil(w / stepX) + 2
    const rows  = Math.ceil(h / stepY) + 2

    for (let r = -rows; r <= rows; r++) {
      for (let c = -cols; c <= cols; c++) {
        const x = c * stepX
        const y = r * stepY
        ctx.fillText(line1, x, y - fontSize * 0.7)
        ctx.fillText(line2, x, y + fontSize * 0.7)
      }
    }
    ctx.restore()
  }, [userId, userEmail])

  // ── PDF rendering ─────────────────────────────────────────────────────────
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDocRef.current || !containerRef.current) return
    const canvas = containerRef.current.querySelector('canvas')
    if (!canvas) return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    const page  = await pdfDocRef.current.getPage(pageNum)
    const scale = Math.min(
      (containerRef.current.clientWidth - 32) / page.getViewport({ scale: 1 }).width,
      1.6
    )
    const vp  = page.getViewport({ scale })
    const ctx = canvas.getContext('2d')
    canvas.width  = vp.width
    canvas.height = vp.height

    const task = page.render({ canvasContext: ctx, viewport: vp })
    renderTaskRef.current = task
    try {
      await task.promise
      drawWatermark(ctx, canvas.width, canvas.height)
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error(e)
    }
  }, [drawWatermark])

  useEffect(() => {
    if (!streamUrl) return
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href
        // Usa streamUrl (stesso dominio) → il cookie sessione è incluso automaticamente.
        // pdf.js non espone mai l'URL MinIO al network tab.
        const doc = await pdfjsLib.getDocument({
          url:              streamUrl,
          withCredentials:  true,   // include cookie sessione
        }).promise
        if (cancelled) return
        pdfDocRef.current = doc
        setTotalPages(doc.numPages)
        setCurrentPage(1)
        setLoading(false)
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [streamUrl])

  useEffect(() => {
    if (!loading && !error) renderPage(currentPage)
  }, [currentPage, loading, error, renderPage])

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-full bg-[#F5F5F5] dark:bg-[#111] select-none"
      onCopy={e => e.preventDefault()}
    >
      <style>{`@media print { body { display: none !important; } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#0A0A0A]">
        <span className="text-sm font-medium truncate max-w-xs">{noteTitle}</span>
        <span className="text-xs font-mono text-[#6B6B6B] dark:text-[#888] ml-4 shrink-0">
          {loading ? '…' : `${currentPage} / ${totalPages}`}
        </span>
      </div>

      {/* Canvas */}
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

      {/* Paginazione */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-3 border-t border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#0A0A0A]">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-xs font-mono rounded border border-[#E0E0E0] dark:border-[#333] disabled:opacity-30 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition"
          >← Prec</button>
          <span className="text-xs font-mono text-[#6B6B6B] dark:text-[#888]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-xs font-mono rounded border border-[#E0E0E0] dark:border-[#333] disabled:opacity-30 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition"
          >Succ →</button>
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
