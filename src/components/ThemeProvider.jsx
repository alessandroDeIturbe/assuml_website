'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function ThemeProvider({ children }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </NextThemesProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
