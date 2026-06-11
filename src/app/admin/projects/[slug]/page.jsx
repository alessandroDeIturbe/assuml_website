import { auth }      from '@/lib/auth'
import { prisma }    from '@/lib/prisma'
import { redirect }  from 'next/navigation'
import ProjectEditor from './ProjectEditor'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

const SLUGS = {
  cisiamo:       'CiSIamo Podcast',
  ramificazioni: 'Festival Ramificazioni',
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  return { title: `Editor — ${SLUGS[slug] ?? slug} — ASSUML` }
}

export default async function ProjectAdminPage({ params }) {
  const { slug } = await params

  const session = await auth()
  if (!session?.user || session.user.email !== ADMIN_EMAIL) redirect('/')

  if (!SLUGS[slug]) redirect('/admin')

  const project = await prisma.project.findUnique({ where: { slug } })
  const content = project?.content ?? {}

  return (
    <div className="max-w-3xl mx-auto px-6">
      <section className="py-16 border-b border-neutral-200 dark:border-neutral-800">
        <a href="/admin" className="text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">
          ← Admin
        </a>
        <div className="mt-6">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D] mb-4" />
          <h1 className="font-black text-4xl tracking-tight text-neutral-900 dark:text-white leading-none">
            {SLUGS[slug]}
          </h1>
          <p className="mt-2 text-xs font-mono text-neutral-400">Editor contenuti pagina pubblica</p>
        </div>
      </section>
      <div className="py-12">
        <ProjectEditor slug={slug} initialContent={content} />
      </div>
    </div>
  )
}
