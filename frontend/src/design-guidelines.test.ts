import { describe, expect, it } from 'vitest'

// First rules of the app's visual line, taken from the views that exist. Every screen must use
// the shared palette (Tailwind neutral/red/emerald), the shared page layout and the app font.
const raw = import.meta.glob('./presentation/**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const screens = Object.entries(raw).filter(([path]) => !/\.test\.tsx$/.test(path))
const pages = screens.filter(([path]) => /features\/[^/]+\/\w+Page\.tsx$/.test(path))

const offenders = (rule: (source: string) => boolean) =>
  screens.filter(([, source]) => rule(source)).map(([path]) => path)

const standard = Object.values(
  import.meta.glob('/docs/design-standard.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
)[0]

describe('docs/design-standard.md', () => {
  // Every tone, button, size and motion value the screens use must be written down in the standard.
  const inUse = [
    'border-neutral-800 bg-neutral-900',
    'border-red-900 bg-red-950/40',
    'border-emerald-900 bg-emerald-950/40',
    'border-sky-900 bg-sky-950/40',
    'bg-sky-900 text-sky-100',
    'border-emerald-900 bg-neutral-900',
    'border-neutral-700 bg-neutral-950',
    'bg-neutral-100 text-neutral-950',
    'bg-sky-700 text-white',
    'min-h-[24rem]',
    'min-h-14',
    'rounded-xl',
    'bg-black/70',
    'duration 0.2',
    'type: spring',
    'y: 100%',
    'rounded-t-2xl',
    'bg-neutral-600',
  ]

  it('exists', () => {
    expect(standard).toBeTypeOf('string')
  })

  it('names every colour tone, button, size and motion value in use', () => {
    for (const value of inUse) expect(standard, value).toContain(value)
  })
})

describe('design guidelines', () => {
  it('scans the real screens', () => {
    expect(screens.length).toBeGreaterThan(30)
    expect(pages.length).toBeGreaterThanOrEqual(10)
  })

  it('uses palette colours, never custom hex values', () => {
    expect(offenders((source) => /#[0-9a-fA-F]{3,8}\b/.test(source) || /\[#/.test(source))).toEqual([])
  })

  it('uses no text-neutral-500: it fails WCAG AA text contrast on the page and on cards', () => {
    const sources = Object.entries(
      import.meta.glob('./presentation/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
    ).filter(([path]) => !/\.test\.tsx?$/.test(path))
    expect(sources.filter(([, source]) => /text-neutral-500/.test(source)).map(([path]) => path)).toEqual([])
  })

  it('keeps the app font: no serif headings', () => {
    expect(offenders((source) => /\bfont-(serif|sans)\b/.test(source))).toEqual([])
  })

  it('builds every page from the shared Page layout or the motion page shell', () => {
    const missing = pages
      .filter(([, source]) => !/<Page>|<motion\.main/.test(source) && !/AsyncView/.test(source))
      .map(([path]) => path)
    expect(missing).toEqual([])
  })

  it('gives every page one h1 through PageHeader or its own header', () => {
    const missing = pages
      .filter(([path, source]) => !/PageHeader|<h1/.test(source) && !/LoginScreen/.test(path))
      .map(([path]) => path)
    expect(missing).toEqual([])
  })
})
