import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createDemoServices } from '../../../infrastructure/mock/demo-services'
import { renderApp } from '../../../test/render-app'

describe('CatalogPage availability', () => {
  it('marks a product that is not available, and is not sold out, with a dash', async () => {
    const demo = createDemoServices({ loginDelayMs: 0, signedIn: true })
    renderApp('/carta', {
      getCatalog: async () => (await demo.getCatalog()).map((product) => ({ ...product, soldOut: false, available: false })),
    })

    const marks = await screen.findAllByLabelText('No disponible')

    expect(marks.length).toBeGreaterThan(0)
    expect(marks[0]).toHaveTextContent('—')
  })
})
