import BrandedImage from '@/components/BrandedImage'

export const metadata = { title: 'Festival Ramificazioni — ASSUML' }

const ARCHIVIO = [
  {
    anno: '2025',
    sottotitolo: 'Espansioni / Contrazioni',
    descrizione: 'Terza edizione del festival. Sei giorni di concerti, installazioni e incontri tra compositori europei. Sette co-produzioni inedite con ensemble internazionali.',
    luoghi: ['Spazio Officina, Chiasso', 'Teatro Foce, Lugano', 'Conservatorio CSI'],
    highlight: ['Premiere assoluta — Quartetto n.3 per archi amplificati', 'Workshop: Spazio e Notazione Aperta', 'Residenza: Ensemble Vortex (Ginevra)'],
    campiture: 'rossa',
  },
  {
    anno: '2024',
    sottotitolo: 'Materia / Forma',
    descrizione: 'Seconda edizione. Focus sulla sintesi audio-visuale e le nuove tecnologie di spazializzazione del suono. Prima edizione con festival partner internazionali.',
    luoghi: ['LAC Lugano Arte e Cultura', 'Palazzo dei Congressi'],
    highlight: ['Octet per ensemble e live electronics', 'Residenza artistica: tre compositori', 'Talk: Il suono come architettura'],
    campiture: 'neutra',
  },
  {
    anno: '2023',
    sottotitolo: 'Prima edizione',
    descrizione: 'Nascita del festival come piattaforma per la nuova musica del Conservatorio della Svizzera Italiana. Due giorni, cinque prime esecuzioni.',
    luoghi: ['Conservatorio CSI, Lugano'],
    highlight: ['Cinque prime esecuzioni assolute', 'Apertura al pubblico generale'],
    campiture: 'neutra',
  },
]

export default function RamificazioniPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden">
        {/* Campiture rosse di sfondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#dc2626]" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#dc2626] opacity-20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pb-16 pt-32 grid md:grid-cols-2 gap-12 items-end">
          <div>
            {/* Logo */}
            <div className="mb-6">
              <BrandedImage
                src="/imgs/logos/ramificazioni logo PNG.PNG"
                alt="Festival Ramificazioni"
                className="h-20 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 mb-3">
              Coproduzione ASSUML · Dal 2023
            </p>
            <h1 className="font-black leading-none tracking-tight text-white"
              style={{ fontSize: 'clamp(3.5rem,9vw,7rem)' }}>
              Festival<br />
              <span className="text-[#dc2626]">Ramificazioni</span>
            </h1>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Piattaforma annuale per la musica contemporanea, l'elettroacustica e le arti sonore.
              Nata dal Conservatorio della Svizzera Italiana, aperta al mondo.
            </p>
            <div className="flex gap-3">
              <a href="mailto:ramificazioni@assuml.ch"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold bg-white text-[#0e0e0e] hover:bg-[#dc2626] hover:text-white transition">
                Collabora →
              </a>
              <a href="#archivio"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold border border-white/30 text-white/70 hover:border-white hover:text-white transition">
                Archivio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b border-white/10">
        <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#dc2626] mb-4">Manifesto</p>
            <h2 className="font-black text-3xl leading-tight text-white">
              Suono<br />come<br />pensiero.
            </h2>
          </div>
          <div className="space-y-4 text-white/60 text-base leading-relaxed">
            <p>
              Ramificazioni nasce dall'esigenza di creare uno spazio dove la musica nuova possa respirare,
              espandersi e contaminarsi. Un festival che non separa la composizione dalla performance,
              il processo dal risultato, la ricerca dalla comunicazione.
            </p>
            <p>
              Ogni edizione è una mappa di connessioni: tra linguaggi, tra generazioni, tra luoghi.
              Il Ticino come crocevia sonoro d'Europa.
            </p>
          </div>
        </div>
      </section>

      {/* ── ARCHIVIO EDIZIONI ─────────────────────────────────────────── */}
      <section id="archivio" className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 mb-12">Archivio edizioni</p>

        <div className="space-y-0">
          {ARCHIVIO.map((ed, i) => (
            <div
              key={ed.anno}
              className="group relative border-t border-white/10 py-12 grid md:grid-cols-[120px_1fr_1fr] gap-8 items-start"
            >
              {/* Anno */}
              <div>
                <span
                  className="font-black leading-none block"
                  style={{
                    fontSize: '4rem',
                    color: ed.campiture === 'rossa' ? '#dc2626' : 'rgba(255,255,255,0.15)',
                  }}
                >
                  {ed.anno}
                </span>
              </div>

              {/* Info principale */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-2xl text-white leading-tight">{ed.sottotitolo}</h3>
                  <p className="text-white/50 text-sm mt-2 leading-relaxed">{ed.descrizione}</p>
                </div>
                <div className="space-y-1">
                  {ed.luoghi.map(l => (
                    <p key={l} className="text-xs font-mono text-white/40">◦ {l}</p>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#dc2626] mb-3">Highlights</p>
                {ed.highlight.map(h => (
                  <div key={h} className="flex items-start gap-2">
                    <span className="text-[#dc2626] mt-1 shrink-0 text-xs">—</span>
                    <p className="text-sm text-white/60 leading-snug">{h}</p>
                  </div>
                ))}
              </div>

              {/* Accent bar laterale per edizione corrente */}
              {i === 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#dc2626]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── PROSSIMA EDIZIONE ─────────────────────────────────────────── */}
      <section className="bg-[#dc2626]">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 mb-4">Prossima edizione</p>
            <h2 className="font-black text-5xl leading-tight text-white">
              Ramificazioni<br />2026
            </h2>
            <p className="text-white/80 text-base mt-4 leading-relaxed max-w-md">
              Ottobre 2026. Lugano. Tema e lineup in preparazione.
              Aperto ai progetti di collaborazione e alle residenze artistiche.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-white/70 text-sm">Vuoi proporre un progetto, collaborare come festival partner o candidarti per una residenza?</p>
            <a href="mailto:ramificazioni@assuml.ch"
              className="inline-flex items-center px-6 py-3 bg-white text-[#dc2626] font-semibold text-sm hover:bg-[#0e0e0e] hover:text-white transition">
              Scrivici → ramificazioni@assuml.ch
            </a>
          </div>
        </div>
      </section>

      {/* ── FESTIVAL PARTNER ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 mb-8">Festival partner</p>
        <div className="grid sm:grid-cols-3 gap-px bg-white/10">
          {['Lugano Musica', 'Ticino Musica', 'Jazz Ascona'].map(p => (
            <div key={p} className="bg-[#0e0e0e] px-6 py-8 hover:bg-white/5 transition">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] inline-block mb-3" />
              <p className="font-semibold text-white/80">{p}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
