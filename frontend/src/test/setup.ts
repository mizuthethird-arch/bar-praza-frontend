import { cleanup, configure } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// The first render in a file can take over a second when coverage instruments the code,
// so findBy and waitFor wait longer than the 1 s default before they give up.
configure({ asyncUtilTimeout: 3000 })

afterEach(() => {
  cleanup()
})
