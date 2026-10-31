import { describe, expect, it } from 'vitest'

// The login follows the design guide's warm dark tokens. Screens use the token names, never the
// neutral or status palette, and the title face comes only from the font-display token.
const sources = Object.entries(
  import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
).filter(([path]) => !/\.test\.tsx$/.test(path))
describe('login design', () => {
  it('uses the warm tokens for its colours, not the neutral or status palette', () => {
    const offenders = sources
      .filter(([, source]) => /\b(bg|text|border|ring|placeholder)-(neutral|stone|red|emerald|sky)-\d+/.test(source))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })

  it('uses the warm tokens for the surface, the title and the primary button', () => {
    const all = sources.map(([, source]) => source).join('\n')
    expect(all).toContain('bg-surface')
    expect(all).toContain('bg-tella')
    expect(all).toContain('text-on-tella')
    expect(all).toContain('font-display')
  })

  it('uses the guide token names (tella, lousa), not the old spellings', () => {
    expect(sources.filter(([, source]) => /\b(talla|louse)\b/.test(source)).map(([path]) => path)).toEqual([])
  })

  it('does not use the monospace font on the login any more', () => {
    expect(sources.filter(([, source]) => /font-mono/.test(source))).toEqual([])
  })

  it('shows the full-bleed background image behind a glass card', () => {
    const screen = sources.find(([path]) => path.endsWith('AuthFrame.tsx'))?.[1] ?? ''
    expect(screen).toContain('login-bg.jpg')
    expect(screen).toContain('import.meta.env.BASE_URL')
    expect(screen).toContain('backdrop-blur-xl')
    expect(screen).toContain('bg-surface-raised/85')
  })

  it('puts the glass card on the left from 1440 px, at the artifact padding, and centres it below', () => {
    const screen = sources.find(([path]) => path.endsWith('AuthFrame.tsx'))?.[1] ?? ''
    expect(screen).toContain('md:px-24')
    expect(screen).toContain('items-start')
    expect(screen).toContain('justify-center')
    expect(screen).toContain('min-[1440px]:justify-start')
  })

  it('grows the card on bigger screens, in steps up to 2560 px, only where its height still fits', () => {
    const screen = sources.find(([path]) => path.endsWith('AuthFrame.tsx'))?.[1] ?? ''
    expect(screen).toContain('[@media(width>=1600px)_and_(height>=970px)]:[zoom:1.1]')
    expect(screen).toContain('[@media(width>=1920px)_and_(height>=1150px)]:[zoom:1.33]')
    expect(screen).toContain('[@media(width>=2560px)_and_(height>=1500px)]:[zoom:1.78]')
    expect(screen).not.toMatch(/width>=(?:[3-9]\d{3}|\d{5,})px/)
  })

  it('no longer uses the side illustration', () => {
    const all = sources.map(([, source]) => source).join('\n')
    expect(all).not.toContain('login-art.svg')
    expect(all).not.toContain('<aside')
  })
})
