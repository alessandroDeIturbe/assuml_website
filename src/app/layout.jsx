import './globals.css'
import Navbar from '@/components/Navbar'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata = {
  title:       'ASSUML — Associazione Studenti Conservatorio della Svizzera Italiana',
  description: 'Portale studenti ASSUML: appunti, podcast CiSiamo, donazioni.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          <main className="pt-14 min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
