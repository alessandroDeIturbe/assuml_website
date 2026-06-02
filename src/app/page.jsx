import { prisma }        from '@/lib/prisma'
import TranslatedHome    from '@/components/TranslatedHome'

export const dynamic = 'force-dynamic'

async function getLatestAnnouncement() {
  try {
    return await prisma.announcement.findFirst({
      where:   { active: true },
      orderBy: { createdAt: 'desc' },
      select:  { title: true, body: true, createdAt: true },
    })
  } catch { return null }
}

export default async function HomePage() {
  const announcement = await getLatestAnnouncement()
  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* Banner bacheca istituzionale */}
      {announcement && (
        <div className="mt-6 px-5 py-4 border-l-2 border-[#FF4D4D] bg-neutral-50 dark:bg-neutral-900 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#FF4D4D] mb-1">Avviso ASSUML</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{announcement.title}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{announcement.body}</p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 shrink-0 mt-0.5">
            {new Date(announcement.createdAt).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {/* Contenuto tradotto (client component con LanguageContext) */}
      <TranslatedHome />

    </div>
  )
}
