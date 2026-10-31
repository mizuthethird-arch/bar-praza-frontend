import { describe, expect, it } from 'vitest'
import { afterEach, vi } from 'vitest'
import { captureDownloads } from '../../test/capture-downloads'
import { downloadCsv, toCsv } from './csv'

describe('toCsv', () => {
  it('joins with semicolons and quotes fields that need it', () => {
    expect(toCsv([['Nº', 'Cliente'], ['#1', 'Ana; "la" mejor']])).toBe('Nº;Cliente\r\n#1;"Ana; ""la"" mejor"')
  })
})

describe('toCsv spreadsheet safety', () => {
  it('neutralises fields a spreadsheet would run as a formula', () => {
    expect(toCsv([['=HYPERLINK("x")', '+1', '-1', '@a', 'ok']])).toBe(`"'=HYPERLINK(""x"")";'+1;'-1;'@a;ok`)
  })

  it('leaves ordinary text and numbers alone', () => {
    expect(toCsv([['#44', '21:35', '9,00 €']])).toBe('#44;21:35;9,00 €')
  })

  it('handles an empty table', () => {
    expect(toCsv([])).toBe('')
  })
})

describe('downloadCsv', () => {
  const capture = captureDownloads()
  afterEach(() => {
    capture.restore()
    vi.restoreAllMocks()
  })

  it('saves the rows under the given file name', async () => {
    downloadCsv('pedidos.csv', [['a', 'b'], ['1', '2']])

    expect(capture.downloads).toHaveLength(1)
    expect(capture.downloads[0].name).toBe('pedidos.csv')
    expect(await capture.downloads[0].text).toBe('a;b\r\n1;2')
  })
})

describe('downloadCsv object URL', () => {
  afterEach(() => vi.useRealTimers())

  it('keeps the file URL alive until the browser has started the download', () => {
    vi.useFakeTimers()
    const capture = captureDownloads()
    const revoke = vi.fn()
    URL.revokeObjectURL = revoke

    downloadCsv('a.csv', [['a']])
    expect(revoke).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(revoke).toHaveBeenCalledWith('blob:test-0')
    capture.restore()
  })
})
