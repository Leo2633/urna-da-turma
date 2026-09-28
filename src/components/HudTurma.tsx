import { Icone } from './Icone'
import { motion } from 'motion/react'
import { CONQUISTAS, calcularNivel } from '@/core'
import { useEleicao } from '@/store/useEleicao'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Barra de XP e nível da turma. Coletivo, nunca individual. */
export function HudTurma({ compacto = false }: { compacto?: boolean }) {
  const g = useEleicao((s) => s.eleicao?.gamificacao)
  const turma = useEleicao((s) => s.eleicao?.config.turma)
  const reduz = useReducedMotion()
  if (!g) return null
  const n = calcularNivel(g.xp)
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-superficie/90 px-3 py-2 shadow-pop-sm ${compacto ? 'text-sm' : ''}`} aria-label={`Turma ${turma ?? ''}: nível ${n.nivel}, ${g.xp} XP`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primaria font-black text-white" aria-hidden>
        {n.nivel}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2 text-xs font-bold text-tinta-suave">
          <span className="truncate">{turma ? `Turma ${turma}` : 'Turma'} · {n.titulo}</span>
          <span className="whitespace-nowrap tabular-nums">{g.xp} XP</span>
        </div>
        <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-tinta/10" role="progressbar" aria-valuenow={n.progresso} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primaria to-secundaria"
            initial={false}
            animate={{ width: `${n.progresso}%` }}
            transition={reduz ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 18 }}
          />
        </div>
      </div>
      {!compacto && (
        <div className="hidden gap-1 sm:flex" aria-label="Conquistas">
          {g.conquistas.map((c) => (
            <span key={c} title={CONQUISTAS[c].titulo} className="flex h-8 w-8 items-center justify-center rounded-full bg-tinta text-destaque">
              <Icone nome={CONQUISTAS[c].icone} className="h-4 w-4" rotulo={CONQUISTAS[c].titulo} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
