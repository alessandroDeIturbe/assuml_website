// src/lib/auth.js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// Domini istituzionali ammessi per Google Sign-In
const ALLOWED_DOMAINS  = ['conservatorio.ch', 'assuml.ch']
const ADMIN_EMAIL      = 'studenti@conservatorio.ch'

export const authOptions = {
  adapter:   PrismaAdapter(prisma),
  session:   { strategy: 'jwt' },
  // BUG-7 FIX: trustHost richiesto quando Next.js usa porta diversa da NEXTAUTH_URL
  // (es. :3001 invece di :3000 se la porta è occupata). Senza questo il cookie PKCE
  // non viene trovato al callback Google → InvalidCheck: pkceCodeVerifier
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }) {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null
        const ok = await bcrypt.compare(password, user.password)
        return ok ? user : null
      },
    }),

    // ── Account di test (solo development) ─────────────────────────────
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id:   'dev-test',
        name: 'Test Account (Dev)',
        credentials: {
          email: { label: 'Email test', type: 'email', placeholder: 'test@conservatorio.ch' },
        },
        async authorize({ email }) {
          const addr = email?.trim() || 'test@conservatorio.ch'
          // Crea/recupera utente di test nel DB
          const user = await prisma.user.upsert({
            where:  { email: addr },
            update: {},
            create: {
              email: addr,
              name:  'Test User',
              role:  addr === ADMIN_EMAIL ? 'ADMIN' : 'STUDENT',
            },
          })
          return user
        },
      }),
    ] : []),
  ],
  callbacks: {
    // Blocco istituzionale Google: solo domini autorizzati
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        const email = profile?.email ?? ''
        const allowed = ALLOWED_DOMAINS.some(d => email.endsWith(`@${d}`))
        if (!allowed) return '/accedi?error=DomainNotAllowed'
      }
      return true
    },
    async jwt({ token, user, profile }) {
      if (user) { token.id = user.id; token.role = user.role }
      if (profile) { token.isAdmin = profile.email === ADMIN_EMAIL }
      if (token.email === ADMIN_EMAIL) token.isAdmin = true
      // Safety: se token.id non è un CUID DB (es. sub Google) → risolvi dal DB per email
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where:  { email: token.email },
          select: { id: true, role: true },
        })
        if (dbUser) { token.id = dbUser.id; token.role = dbUser.role }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id      = token.id
      session.user.role    = token.role
      session.user.isAdmin = token.isAdmin ?? false
      return session
    },
  },
  pages: { signIn: '/accedi' },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Non autenticato' }, { status: 401 })
  return session
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Non autenticato' }, { status: 401 })
  // Controlla isAdmin (da JWT) OPPURE email diretta OPPURE role DB
  const ok = session.user.isAdmin === true
          || session.user.email   === ADMIN_EMAIL
          || session.user.role    === 'ADMIN'
  if (!ok) return Response.json({ error: 'Accesso negato' }, { status: 403 })
  return session
}
