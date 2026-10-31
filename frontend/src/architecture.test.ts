import { describe, expect, it } from 'vitest'

// Imports must point inward: presentation / infrastructure -> application -> domain.
const allowed: Record<string, string[]> = {
  domain: ['domain'],
  application: ['domain', 'application'],
  infrastructure: ['domain', 'application', 'infrastructure'],
  presentation: ['domain', 'application', 'presentation'],
}

const raw = import.meta.glob('./**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const sources = Object.entries(raw).filter(([path]) => !/\.test\.tsx?$/.test(path) && !path.startsWith('./test/'))

function importsOf(source: string): string[] {
  return [...source.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map((match) => match[1])
}

describe('architecture', () => {
  it('scans the real source tree', () => {
    expect(sources.length).toBeGreaterThan(40)
  })

  it('keeps every import pointing inward', () => {
    const violations: string[] = []

    for (const [path, source] of sources) {
      const layer = path.split('/')[1]
      if (!(layer in allowed)) continue // main.tsx is the composition root

      for (const specifier of importsOf(source)) {
        if (!specifier.startsWith('.')) continue
        const target = new URL(specifier, new URL(path, 'file:///src/')).pathname.split('/')[2]
        if (!allowed[layer].includes(target)) violations.push(`${path} -> ${specifier}`)
      }
    }

    expect(violations).toEqual([])
  })

  it('keeps domain and application free of framework packages', () => {
    const offenders = sources
      .filter(([path]) => /^\.\/(domain|application)\//.test(path))
      .flatMap(([path, source]) => importsOf(source).filter((s) => !s.startsWith('.')).map((s) => `${path} -> ${s}`))

    expect(offenders).toEqual([])
  })
})
