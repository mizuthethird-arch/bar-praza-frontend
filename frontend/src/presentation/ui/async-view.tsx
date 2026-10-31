import type { ReactNode } from 'react'
import type { AsyncState } from '../hooks/use-async'

type Props<T> = {
  state: AsyncState<T>
  children: (data: T) => ReactNode
}

export function AsyncView<T>({ state, children }: Props<T>) {
  if (state.status === 'error') {
    return (
      <p role="alert" className="p-10 text-sm text-red-300">
        No se pudo cargar la página
      </p>
    )
  }
  if (state.data === undefined) {
    return (
      <p role="status" className="p-10 text-sm text-neutral-400">
        Cargando…
      </p>
    )
  }
  return <>{children(state.data)}</>
}
