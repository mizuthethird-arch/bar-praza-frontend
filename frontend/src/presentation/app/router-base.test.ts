import { describe, expect, it } from 'vitest'
import { routerBasename } from './router-base'

describe('routerBasename', () => {
  it('is empty when the app is served from the root', () => {
    expect(routerBasename('/')).toBe('')
  })

  it('drops the trailing slash when the app is served under a path, such as GitHub Pages', () => {
    expect(routerBasename('/bar-praza-frontend/')).toBe('/bar-praza-frontend')
  })
})
