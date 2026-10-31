import { describe, expect, it } from 'vitest'

// The design's two faces, loaded from Google Fonts with the weights the design uses.
const html = Object.values(
  import.meta.glob('/index.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
)[0]

describe('index.html fonts', () => {
  it('loads Fraunces and Instrument Sans from Google Fonts', () => {
    expect(html).toContain('https://fonts.googleapis.com/css2?family=Fraunces')
    expect(html).toContain('family=Instrument+Sans:wght@400;600')
    expect(html).toContain('display=swap')
  })

  it('connects to the font servers before loading the stylesheet', () => {
    expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"')
    expect(html).toContain('rel="preconnect" href="https://fonts.gstatic.com" crossorigin')
  })
})
