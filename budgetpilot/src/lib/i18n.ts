import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from '../locales/en.json'
import es from '../locales/es.json'
import fr from '../locales/fr.json'

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
] as const

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    // Map es-419, es-MX, es-AR etc. to our es locale
    load: 'languageOnly',
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr'],
    interpolation: {
      escapeValue: false, // React escapes by default
    },
    detection: {
      order: ['querystring', 'navigator', 'htmlTag'],
      caches: [], // We persist to Dexie ourselves
    },
  })

export default i18n
