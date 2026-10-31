import { describe, expect, it } from 'vitest'
import { mockAccounts } from './mock-accounts'

// Keeps docs/mock-data.md in step with the mock backend.
const doc = Object.values(
  import.meta.glob('/docs/mock-data.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
)[0]

const mockFiles = Object.keys(import.meta.glob('./*.ts'))
  .filter((path) => !path.endsWith('.test.ts'))
  .map((path) => path.slice(2))

describe('docs/mock-data.md', () => {
  it('exists', () => {
    expect(doc).toBeTypeOf('string')
  })

  it('lists every demo login exactly as the mock checks it', () => {
    for (const { email, password } of mockAccounts) {
      expect(doc, email).toContain(`\`${email}\``)
      expect(doc, password).toContain(`\`${password}\``)
    }
  })

  it('mentions every mock source file', () => {
    expect(mockFiles.length).toBeGreaterThan(10)
    for (const file of mockFiles) expect(doc, file).toContain(file)
  })
})
