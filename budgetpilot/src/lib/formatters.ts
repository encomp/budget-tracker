import { format, parseISO, isValid } from 'date-fns'
import { enUS, es, fr } from 'date-fns/locale'
import type { Locale } from 'date-fns'

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  es: es,
  fr: fr,
}

function getDateLocale(locale: string): Locale {
  return DATE_FNS_LOCALES[locale] ?? enUS
}

/**
 * Formats a number as currency using Intl.NumberFormat.
 * French convention places the symbol after the number.
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string,
  locale: string,
  options: { signed?: boolean } = {}
): string {
  const formatter = new Intl.NumberFormat(
    locale === 'es' ? 'es-419' : locale,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )

  const formatted = formatter.format(Math.abs(amount))
  const prefix = options.signed && amount > 0 ? '+' : amount < 0 ? '-' : ''

  if (locale === 'fr') return `${prefix}${formatted} ${currencySymbol}`
  return `${prefix}${currencySymbol}${formatted}`
}

/**
 * Formats a YYYY-MM-DD date string for locale-appropriate display.
 */
export function formatDisplayDate(dateStr: string, locale: string): string {
  const date = parseISO(dateStr)
  if (!isValid(date)) return dateStr
  return format(date, 'PPP', { locale: getDateLocale(locale) })
}

/**
 * Formats a YYYY-MM month string as a display month+year.
 */
export function formatMonthYear(monthStr: string, locale: string): string {
  const date = parseISO(`${monthStr}-01`)
  if (!isValid(date)) return monthStr
  return format(date, 'LLLL yyyy', { locale: getDateLocale(locale) })
}

/**
 * Returns an array of 7 short weekday names for the heatmap calendar header.
 */
export function getWeekdayNames(locale: string): string[] {
  const baseDate = new Date(2024, 0, 7) // A Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(baseDate)
    date.setDate(7 + i)
    return new Intl.DateTimeFormat(
      locale === 'es' ? 'es-419' : locale,
      { weekday: 'short' }
    ).format(date)
  })
}

/**
 * Formats a relative "last export" timestamp using i18n keys.
 */
export function formatRelativeExport(
  dateStr: string,
  locale: string,
  t: (key: string, opts?: object) => string
): string {
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''

  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('export.lastExportToday')
  if (diffDays === 1) return t('export.lastExportYesterday')
  return t('export.lastExportDaysAgo', { count: diffDays })
}
