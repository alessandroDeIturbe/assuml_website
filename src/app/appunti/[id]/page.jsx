'use client'
import { useState, useEffect }      from 'react'
import { useParams, useRouter }     from 'next/navigation'
import { useSession }               from 'next-auth/react'
import ProtectedNotesViewer         from '@/components/ProtectedNotesViewer'

export default function NoteViewerPage() {
  const { id }                      = useParams()
  const router                      = useRouter()
  const { data: session, status }   = useSession()
  const [viewData, setViewData]     = useState(null)   // { streamUrl, noteTitle }
  const [error,    setError]        = useState(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) { router.replace('/accedi'); return }

    let cancelled = false
    // /view verifica auth + acquisto e restituisce solo metadata (titolo).
    // Il PDF arriva sempre via /stream (proxy server-side): nessuna signed URL MinIO esposta.
    fetch(`/api/notes/${id}/view`)
      .then(async r => {
        const data = await r.json()
        if (cancelled) return
        if (!r.ok) throw new Error(data.error ?? `Errore ${r.status}`)
        setViewData({ noteTitle: data.noteTitle, streamUrl: `/api/notes/${id}/stream` })
      })
      .catch(e => { if (!cancelled) setError(e.message) })

    return () => { cancelled = true }
  }, [id, session, status, router])

  // Loading
  if (status === 'loading' || (!viewData && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-sm font-mono text-neutral-400 animate-pulse">Caricamento…</span>
      </div>
    )
  }

  // Errore accesso
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-[#FF4D4D] font-mono text-sm text-center max-w-md">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-75 transition"
        >
          ← Indietro
        </button>
      </div>
    )
  }

  // Viewer DRM — canvas pdf.js con watermark userId
  // fixed inset-0 (no top-14): layout.jsx nasconde già Navbar/Footer, quindi occupiamo tutto lo schermo
  return (
    <div className="fixed inset-0 z-10 flex flex-col">
      <ProtectedNotesViewer
        streamUrl={viewData.streamUrl}
        userId={session.user.id}
        userEmail={session.user.email}
        noteTitle={viewData.noteTitle ?? 'Documento'}
      />
    </div>
  )
}
