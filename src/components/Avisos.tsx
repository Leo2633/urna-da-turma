import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useEleicao } from '@/store/useEleicao'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Toasts de conquista, nível e informações. */
export function Avisos() {
  const avisos = useEleicao((s) => s.avisos)
  const dispensar = useEleicao((s) => s.dispensarAviso)
  const reduz = useReducedMotion()

  useEffect(() => {
    if (!avisos.length) return
    const t = setTimeout(() => dispensar(avisos[0].id), 5000)
    return () => clearTimeout(t)
  }, [avisos, dispensar])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 nao-imprimir" aria-live="polite">
      <AnimatePresence>
        {avisos.slice(0, 3).map((a) => (
          <motion.div
            key={a.id}
            initial={reduz ? false : { y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduz ? { opacity: 0 } : { y: -20, opacity: 0 }}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border-4 border-destaque bg-superficie px-4 py-3 shadow-pop"
            role="status"
          >
            <span className="text-3xl" aria-hidden>
              {a.emoji ?? '✨'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-secundaria">
                {a.tipo === 'conquista' ? 'Conquista da turma' : a.tipo === 'nivel' ? 'Subiu de nível' : 'Aviso'}
              </p>
              <p className="font-black leading-tight">{a.titulo}</p>
              {a.texto && <p className="text-sm text-tinta-suave">{a.texto}</p>}
            </div>
            <button type="button" onClick={() => dispensar(a.id)} className="rounded-full px-2 text-xl text-tinta-suave hover:bg-black/5" aria-label="Fechar aviso">
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
