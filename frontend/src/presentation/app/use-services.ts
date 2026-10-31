import { useContext } from 'react'
import type { AppServices } from '../../application/services'
import { ServicesContext } from './services-context'

export function useServices(): AppServices {
  const services = useContext(ServicesContext)
  if (!services) throw new Error('ServicesProvider is missing')
  return services
}
