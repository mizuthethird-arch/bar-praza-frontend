import { useState, type ReactNode } from 'react'
import { card, pill, pillActive, pillIdle, sectionTitle } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import {
  API_AREAS,
  API_ENDPOINTS,
  CLIENT_ONLY,
  OPEN_DECISIONS,
  type ApiEndpoint,
  type ApiStatus,
  type FrontendUse,
} from './api-endpoints'

type Filter = 'all' | ApiStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'built', label: 'Built' },
  { value: 'branch', label: 'On a branch' },
  { value: 'proposed', label: 'Proposed' },
]

const STATUS_LABEL: Record<ApiStatus, string> = {
  built: 'Built',
  branch: 'On a branch',
  proposed: 'Proposed',
}

const STATUS_CLASS: Record<ApiStatus, string> = {
  built: 'bg-emerald-950 text-emerald-300',
  branch: 'bg-amber-950 text-amber-300',
  proposed: 'bg-neutral-800 text-neutral-300',
}

const FRONTEND_LABEL: Record<FrontendUse, string> = {
  real: 'The frontend calls it',
  mock: 'Mock until the backend builds it',
  unused: 'The frontend does not call it',
}

const CONVENTIONS = [
  'Base address: VITE_API_URL (for example http://localhost:3000). Every call sends credentials: "include", because the session is an HttpOnly cookie.',
  'Money is integer cents (priceCents, totalCents). Times are HH:mm, dates are YYYY-MM-DD.',
  'Every write is one command, for example "cancel order #42". The server applies it to its latest state.',
  'Every command answers with the new state of its area, so changes from other devices show up.',
  'Errors are { "error": "<code>" }: 400 invalid input, 401 no or expired session, 404 unknown id, 409 a broken rule, 500 with no internal detail.',
  'The server enforces every rule listed here. The frontend checks input only for quick feedback.',
]

function StatusBadge({ status }: { status: ApiStatus }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-neutral-400">{label}</p>
      <div className="mt-1 text-sm text-neutral-300">{children}</div>
    </div>
  )
}

function EndpointRow({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <details className="rounded-lg border border-neutral-800 bg-neutral-950/60 open:bg-neutral-900">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 text-sm">
        <span className="w-16 font-mono font-bold text-neutral-100">{endpoint.method}</span>
        <code className="break-all font-mono text-neutral-200">{endpoint.path}</code>
        <StatusBadge status={endpoint.status} />
        <span className="w-full text-neutral-400 md:ml-auto md:w-auto">{endpoint.summary}</span>
      </summary>
      <div className="grid gap-4 border-t border-neutral-800 px-4 py-4 md:grid-cols-2">
        <Detail label="Used by">{endpoint.screen}</Detail>
        <Detail label="Frontend">{FRONTEND_LABEL[endpoint.frontend]}</Detail>
        {endpoint.request && (
          <Detail label="Request">
            <code className="block whitespace-pre-wrap break-all font-mono text-xs">{endpoint.request}</code>
          </Detail>
        )}
        <Detail label="Response">
          <code className="block whitespace-pre-wrap break-all font-mono text-xs">{endpoint.response}</code>
        </Detail>
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-widest text-neutral-400">Rules</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-neutral-300">
            {endpoint.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        {endpoint.errors && (
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-widest text-neutral-400">Errors</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-neutral-300">
              {endpoint.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  )
}

export function ApiDocumentationPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const visible = API_ENDPOINTS.filter((endpoint) => filter === 'all' || endpoint.status === filter)
  const count = (status: ApiStatus) => API_ENDPOINTS.filter((endpoint) => endpoint.status === status).length

  return (
    <Page>
      <PageHeader
        eyebrow="Frontend and backend"
        title="API documentation"
        actions={<span className="text-sm text-neutral-400">{API_ENDPOINTS.length} endpoints</span>}
      />

      <Reveal className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={card}>
          <p className="text-xs uppercase tracking-widest text-neutral-400">Built</p>
          <p className="mt-2 text-3xl font-bold">{count('built')}</p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-widest text-neutral-400">On a branch</p>
          <p className="mt-2 text-3xl font-bold">{count('branch')}</p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-widest text-neutral-400">Proposed</p>
          <p className="mt-2 text-3xl font-bold">{count('proposed')}</p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-widest text-neutral-400">Frontend uses real calls</p>
          <p className="mt-2 text-3xl font-bold">{API_ENDPOINTS.filter((endpoint) => endpoint.frontend === 'real').length}</p>
        </div>
      </Reveal>

      <Reveal className={card}>
        <h2 className={sectionTitle}>How to call the API</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-300">
          {CONVENTIONS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="space-y-6">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`${pill} ${filter === item.value ? pillActive : pillIdle}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {API_AREAS.map((area) => {
          const endpoints = visible.filter((endpoint) => endpoint.area === area)
          if (endpoints.length === 0) return null
          return (
            <section key={area} className={`${card} space-y-3`} aria-labelledby={`area-${area}`}>
              <h2 id={`area-${area}`} className={sectionTitle}>
                {area}
              </h2>
              {endpoints.map((endpoint) => (
                <EndpointRow key={endpoint.id} endpoint={endpoint} />
              ))}
            </section>
          )
        })}
      </Reveal>

      <Reveal className={card}>
        <h2 className={sectionTitle}>Done in the browser, no endpoint needed</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-300">
          {CLIENT_ONLY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Reveal>

      <Reveal className={card}>
        <h2 className={sectionTitle}>Open decisions for the backend</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-300">
          {OPEN_DECISIONS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </Reveal>
    </Page>
  )
}
