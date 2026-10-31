export function formatQuantity(quantity: number, unit: string): string {
  return `${String(Math.round(quantity * 10) / 10).replace('.', ',')} ${unit}`
}

export function parseDecimal(text: string): number | null {
  const cleaned = text.trim()
  if (!/^\d+([.,]\d+)?$/.test(cleaned)) return null
  return Number(cleaned.replace(',', '.'))
}
