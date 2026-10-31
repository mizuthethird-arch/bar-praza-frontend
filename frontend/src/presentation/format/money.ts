const euros = (cents: number) => (cents / 100).toFixed(2).replace('.', ',')

export const formatEuros = (cents: number) => `${euros(cents)} €`

export const formatPrices = (pricesCents: number[]) => `${pricesCents.map(euros).join(' / ')} €`

export function parseEuros(text: string): number | null {
  const cleaned = text.replace('€', '').trim()
  if (!/^\d+([.,]\d{1,2})?$/.test(cleaned)) return null
  return Math.round(Number(cleaned.replace(',', '.')) * 100)
}

export const formatAmount = (cents: number) => euros(cents)
