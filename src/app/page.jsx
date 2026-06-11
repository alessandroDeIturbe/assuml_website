import { prisma }        from '@/lib/prisma'
import TranslatedHome    from '@/components/TranslatedHome'
import Bacheca           from '@/components/Bacheca'

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

      {/* Bacheca con polling realtime */}
      <Bacheca initial={announcement} />

      {/* Contenuto tradotto (client component con LanguageContext) */}
      <TranslatedHome />

    </div>
  )
}
