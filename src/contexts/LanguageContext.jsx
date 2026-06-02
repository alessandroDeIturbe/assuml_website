'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import it from '@/locales/it.json'
import en from '@/locales/en.json'

const DICTS = { it, en }

const LanguageContext = createContext({ lang: 'it', t: (k) => k, setLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('it')

  const t = useCallback((keyPath) => {
    const keys = keyPath.split('.')
    let val = DICTS[lang]
    for (const k of keys) { val = val?.[k] }
    return val ?? keyPath
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
