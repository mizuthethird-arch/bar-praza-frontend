import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { staggerContainer, useFadeUp } from './motion'

type PageProps = { children: ReactNode }

export function Page({ children }: PageProps) {
  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-6 p-4 md:p-10"
    >
      {children}
    </motion.main>
  )
}

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={useFadeUp()} className={`min-w-0 ${className ?? ''}`}>
      {children}
    </motion.div>
  )
}

type HeaderProps = { eyebrow: string; title: string; actions?: ReactNode }

export function PageHeader({ eyebrow, title, actions }: HeaderProps) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-4">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      </header>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </Reveal>
  )
}
