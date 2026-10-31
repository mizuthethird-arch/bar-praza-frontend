import { createContext } from 'react'
import type { AppServices } from '../../application/services'

export const ServicesContext = createContext<AppServices | null>(null)
