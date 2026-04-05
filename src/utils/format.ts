/**
 * Format a number as a currency amount (XOF/CFA style).
 */
export function formatMontant(value: number, currency = 'XOF'): string {
  if (isNaN(value)) return '—'
  const formatted = new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
  return formatted
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-SN').format(value)
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-SN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateLong(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-SN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function toInputDate(iso: string): string {
  return iso ? iso.slice(0, 10) : ''
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function shortRef(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}
