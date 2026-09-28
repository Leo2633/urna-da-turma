import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Botao } from '@/components/Botao'
import { Moldura } from '@/components/Moldura'
import { Santinho } from '@/components/Santinho'
import { useCronometro } from '@/hooks/useCronometro'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useEleicao } from '@/store/useEleicao'
import { som } from '@/audio/urnaSom'

export function HorarioEleitoral() {
  const e = useEleicao((s) => s.eleicao)!
  const avancar = useEleicao((s) => s.avancarFase)
  const reduz = useReducedMotion()
  const [i, setI] = useState(0)
  const [tempo, setTempo] = useState(e.config.tempoDiscursoSeg)
  const [acabou, setAcabou] = useState(false)
  const cron = useCronometro(
    tempo,
    () => {
      som.confirma()
      setAcabou(true)
    },
    (r) => r <= 5 && som.tique(),
  )
  const c = e.candidatos[i]
  const total = e.candidatos.length

  useEffect(() => {
    cron.reiniciar(tempo)
    setAcabou(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, tempo])

  useEffect(() => {
    const fn = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') setI((x) => Math.min(total - 1, x + 1))
      if (ev.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
      if (ev.key === ' ') {
        ev.preventDefault()
        cron.rodando ? cron.pausar() : cron.iniciar()
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [total, cron])

  const pct = Math.round((cron.restante / tempo) * 100)
  const mm = String(Math.floor(cron.restante / 60)).padStart(2, '0')
  const ss = String(cron.restante % 60).padStart(2, '0')

  return (
    <Moldura projetor>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xl font-black text-tinta-suave">
            Candidatura {i + 1} de {total}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold" htmlFor="tempo">
              Tempo (s)
            </label>
            <input id="tempo" type="number" min={15} max={600} value={tempo} onChange={(ev) => setTempo(Math.max(15, Number(ev.target.value)))} className="w-24 rounded-xl border-4 border-tinta/15 px-2 py-1 text-center font-black" />
          </div>
        </div>

        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <AnimatePresence mode="wait">
            <motion.div className="min-w-0" key={c.id} initial={reduz ? false : { x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={reduz ? { opacity: 0 } : { x: -60, opacity: 0 }} transition={{ duration: 0.3 }}>
              <Santinho candidato={c} cargo={e.config.cargo} tamanho="projetor" />
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col items-center gap-4">
            <div className={`relative flex h-56 w-56 items-center justify-center rounded-full border-[14px] ${acabou ? 'border-perigo' : cron.restante <= 10 ? 'border-secundaria' : 'border-primaria'} bg-superficie shadow-pop`} role="timer" aria-live="off" aria-label={`Tempo restante ${mm}:${ss}`}>
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="text-destaque" strokeWidth="6" strokeDasharray={`${pct * 2.89} 289`} strokeLinecap="round" />
              </svg>
              <span className={`text-6xl font-black tabular-nums ${acabou ? 'text-perigo' : ''}`}>
                {mm}:{ss}
              </span>
            </div>
            {acabou && <p className="text-2xl font-black text-perigo">Tempo esgotado!</p>}
            <div className="flex gap-2">
              {!cron.rodando ? (
                <Botao tamanho="lg" variante="sucesso" onClick={cron.iniciar} disabled={acabou}>
                  ▶ Iniciar
                </Botao>
              ) : (
                <Botao tamanho="lg" variante="secundaria" onClick={cron.pausar}>
                  ⏸ Pausar
                </Botao>
              )}
              <Botao tamanho="lg" variante="contorno" onClick={() => { cron.reiniciar(tempo); setAcabou(false) }}>
                ↺
              </Botao>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Botao variante="contorno" tamanho="lg" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
            ← Anterior
          </Botao>
          <div className="flex gap-2" aria-hidden>
            {e.candidatos.map((k, j) => (
              <span key={k.id} className={`h-3 w-3 rounded-full ${j === i ? 'bg-primaria' : 'bg-tinta/20'}`} />
            ))}
          </div>
          {i < total - 1 ? (
            <Botao tamanho="lg" onClick={() => setI((x) => x + 1)}>
              Próxima →
            </Botao>
          ) : (
            <Botao tamanho="lg" variante="sucesso" onClick={avancar}>
              Encerrar horário eleitoral →
            </Botao>
          )}
        </div>
        <p className="text-center text-sm text-tinta-suave">Teclado: ← → trocam de candidatura, espaço inicia ou pausa o cronômetro.</p>
      </div>
    </Moldura>
  )
}
