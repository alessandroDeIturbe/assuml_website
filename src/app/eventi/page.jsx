export const metadata = { title: 'Eventi — ASSUML' }

const EVENTI = [
  { data: '2026-09-15', tipo: 'Concerto',   titolo: 'Serata d\'apertura AA 2026/27',         luogo: 'Sala Kursaal, Lugano' },
  { data: '2026-10-08', tipo: 'Masterclass', titolo: 'Masterclass di Composizione Elettroacustica', luogo: 'Conservatorio CSI' },
  { data: '2026-10-23', tipo: 'Festival',   titolo: 'Festival Ramificazioni 2026',            luogo: 'Vari spazi, Lugano' },
  { data: '2026-11-14', tipo: 'Assemblea',  titolo: 'Assemblea Generale ASSUML',              luogo: 'Conservatorio CSI' },
  { data: '2026-12-19', tipo: 'Concerto',   titolo: 'Concerto di Natale degli Studenti',      luogo: 'LAC Lugano' },
]

const TIPO_COLOR = {
  'Concerto':   '#FF4D4D',
  'Masterclass':'#00CFCF',
  'Festival':   '#A78BFA',
  'Assemblea':  '#D4AF37',
}

export default function EventiPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D] mb-6" />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Eventi
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-base max-w-xl">
          Concerti, masterclass, assemblee e festival organizzati da ASSUML e dal Conservatorio della Svizzera Italiana.
        </p>
      </section>

      <section className="py-16">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {EVENTI.map((ev) => {
            const d = new Date(ev.data)
            const giorno = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).toUpperCase()
            const anno   = d.getFullYear()
            return (
              <div key={ev.titolo} className="py-8 grid grid-cols-[80px_1fr] gap-8 items-start group">
                <div className="text-center">
                  <p className="font-black text-2xl leading-none text-neutral-900 dark:text-white">{giorno.split(' ')[0]}</p>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5">{giorno.split(' ')[1]} {anno}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                      style={{ color: TIPO_COLOR[ev.tipo] ?? '#888', borderColor: (TIPO_COLOR[ev.tipo] ?? '#888') + '44' }}>
                      {ev.tipo}
                    </span>
                  </div>
                  <h2 className="font-semibold text-lg text-neutral-900 dark:text-white leading-tight group-hover:text-[#FF4D4D] transition">
                    {ev.titolo}
                  </h2>
                  <p className="text-sm text-neutral-400 font-mono">{ev.luogo}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
