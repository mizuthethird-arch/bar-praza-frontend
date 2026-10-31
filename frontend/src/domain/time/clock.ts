// Times of day as "HH:mm" text, the way the screens and the backend exchange them.
const DAY = 24 * 60

const pad = (n: number) => String(n).padStart(2, '0')

export const clockOf = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

export function minutesOf(clock: string): number {
  const [hours, minutes] = clock.split(':').map(Number)
  return hours * 60 + minutes
}

export function addMinutes(clock: string, minutes: number): string {
  const total = (((minutesOf(clock) + minutes) % DAY) + DAY) % DAY
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

// Signed minutes from `from` to `to`, taking the shorter way round the clock.
export function minutesBetween(from: string, to: string): number {
  const diff = (((minutesOf(to) - minutesOf(from)) % DAY) + DAY) % DAY
  return diff > DAY / 2 ? diff - DAY : diff
}
