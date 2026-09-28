import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Botao } from '@/components/Botao'
import { Santinho } from '@/components/Santinho'
import { Icone } from '@/components/Icone'
import { HudTurma } from '@/components/HudTurma'
import { chaveDeInterpretacao, interpretarDigitos, turnoCorrente } from '@/core'
import { useTecladoUrna } from '@/hooks/useTeclado'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useEleicao } from '@/store/useEleicao'
import { som } from '@/audio/urnaSom'
import { confeteCurto } from '@/components/confete'

type Etapa = 'votando' | 'fim'

export function Votacao() {
  const e = useEleicao((s) => s.eleicao)!
  const votar = useEleicao((s) => s.votar)
  const eleitorLiberado = useEleicao((s) => s.eleitorLiberado)
  const liberar = useEleicao((s) => s.liberarEleitor)
  const abrirPainel = useEleicao((s) => s.abrirPainel)
  const reduz = useReducedMotion()
  const turno = turnoCorrente(e)!
  const emDisputa = useMemo(() => e.candidatos.filter((c) => turno.candidatosIds.includes(c.id)), [e.candidatos, turno.candidatosIds])

  const [digitos, setDigitos] = useState('')
  const [branco, setBranco] = useState(false)
  const [etapa, setEtapa] = useState<Etapa>('votando')

  const interp = useMemo(() => (branco ? ({ tipo: 'branco' } as const) : interpretarDigitos(digitos, emDisputa)), [branco, digitos, emDisputa])
  const podeConfirmar = interp.tipo !== 'incompleto'

  const digito = useCallback(
    (d: string) => {
      if (etapa !== 'votando' || !eleitorLiberado || branco) return
      if (digitos.length >= 2) return
      som.tecla()
      const novo = digitos + d
      setDigitos(novo)
      if (novo.length === 2 && interpretarDigitos(novo, emDisputa).tipo === 'nulo') som.aviso()
    },
    [etapa, eleitorLiberado, branco, digitos, emDisputa],
  )
  const corrige = useCallback(() => {
    if (etapa !== 'votando' || !eleitorLiberado) return
    som.corrige()
    setDigitos('')
    setBranco(false)
  }, [etapa, eleitorLiberado])
  const tBranco = useCallback(() => {
    if (etapa !== 'votando' || !eleitorLiberado || digitos.length) return
    som.tecla()
    setBranco(true)
  }, [etapa, eleitorLiberado, digitos])
  const confirma = useCallback(() => {
    if (etapa !== 'votando' || !eleitorLiberado || !podeConfirmar) return
    const chave = chaveDeInterpretacao(interp)
    if (!chave) return
    som.confirma()
    votar(chave)
    setEtapa('fim')
    confeteCurto()
  }, [etapa, eleitorLiberado, podeConfirmar, interp, votar])

  useTecladoUrna(useMemo(() => ({ digito, confirma, corrige, branco: tBranco }), [digito, confirma, corrige, tBranco]), etapa === 'votando' && eleitorLiberado)

  useEffect(() => {
    if (etapa !== 'fim') return
    const t = setTimeout(() => {
      setEtapa('votando')
      setDigitos('')
      setBranco(false)
    }, 2500)
    return () => clearTimeout(t)
  }, [etapa])

  const pct = Math.min(100, Math.round((turno.comparecimento / Math.max(1, e.config.eleitoresEsperados)) * 100))

  return (
    <div className="fundo-pontilhado flex min-h-dvh flex-col">
      <header className="nao-imprimir mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pt-3">
        <div className="leading-tight">
          <p className="text-xs font-black uppercase tracking-widest text-secundaria">
            Votação · {e.turnoAtual}º turno
          </p>
          <h1 className="text-xl font-black md:text-2xl">{e.config.cargo}</h1>
        </div>
        <div className="ml-auto w-full sm:w-72">
          <HudTurma compacto />
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 pt-3">
        <div className="rounded-2xl bg-superficie px-4 py-2 shadow-pop-sm">
          <div className="flex items-center justify-between text-sm font-black">
            <span>Comparecimento</span>
            <span className="tabular-nums">
              {turno.comparecimento}/{e.config.eleitoresEsperados} · {pct}%
            </span>
          </div>
          <div className="mt-1 h-4 w-full overflow-hidden rounded-full bg-tinta/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Comparecimento da turma">
            <motion.div className={`h-full rounded-full ${pct >= 100 ? 'bg-sucesso' : 'bg-secundaria'}`} initial={false} animate={{ width: `${pct}%` }} transition={reduz ? { duration: 0 } : { type: 'spring', stiffness: 100, damping: 20 }} />
          </div>
          <p className="mt-1 text-xs text-tinta-suave">{pct >= 100 ? 'Meta batida: 100% da turma votou!' : 'Meta coletiva: 100% da turma votou.'}</p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-4">
        <AnimatePresence mode="wait">
          {etapa === 'fim' ? (
            <TelaFim key="fim" reduz={reduz} />
          ) : !eleitorLiberado ? (
            <TelaEspera key="espera" onLiberar={() => liberar(true)} reduz={reduz} />
          ) : (
            <motion.div key="urna" initial={reduz ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <section className="flex min-h-[22rem] flex-col rounded-3xl border-8 border-tinta/80 bg-[#EAF3EC] p-5 shadow-pop" aria-live="polite" aria-label="Tela da urna">
                <p className="text-lg font-black uppercase tracking-widest text-tinta-suave">{e.config.cargo}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xl font-bold">Número:</span>
                  <div className="flex gap-2" aria-label={`Dígitos: ${digitos || 'nenhum'}`}>
                    {[0, 1].map((i) => (
                      <span key={i} className={`flex h-20 w-16 items-center justify-center rounded-xl border-4 bg-white text-5xl font-black tabular-nums ${digitos.length === i && !branco ? 'border-primaria animate-pulse' : 'border-tinta/20'}`}>
                        {digitos[i] ?? ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex-1">
                  {interp.tipo === 'candidato' && <Santinho candidato={interp.candidato} />}
                  {interp.tipo === 'branco' && (
                    <div className="rounded-2xl border-4 border-dashed border-tinta/30 bg-white p-6 text-center">
                      <p className="text-4xl font-black">VOTO EM BRANCO</p>
                      <p className="mt-2 text-tinta-suave">Você escolheu não apoiar nenhuma candidatura.</p>
                    </div>
                  )}
                  {interp.tipo === 'nulo' && (
                    <div className="rounded-2xl border-4 border-perigo bg-perigo/10 p-6 text-center" role="alert">
                      <p className="text-4xl font-black text-perigo">NÚMERO ERRADO</p>
                      <p className="mt-2 text-xl font-bold">Não existe candidatura com o número {interp.digitos}.</p>
                      <p className="mt-1">Se confirmar, seu voto será <strong>NULO</strong>. Aperte CORRIGE para tentar de novo.</p>
                    </div>
                  )}
                  {interp.tipo === 'incompleto' && (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-tinta-suave">
                      <div className="flex flex-wrap justify-center gap-2">
                        {emDisputa.map((c) => (
                          <span key={c.id} className="rounded-full bg-white px-3 py-1 text-sm font-bold shadow-pop-sm">
                            {c.numero} · {c.apelido}
                          </span>
                        ))}
                      </div>
                      <p className="text-xl">Digite o número da sua candidatura.</p>
                    </div>
                  )}
                </div>
                {podeConfirmar && (
                  <p className="mt-3 text-center text-lg font-black">
                    Aperte <span className="rounded-lg bg-tecla-confirma px-2 text-white">CONFIRMA</span> para votar ou <span className="rounded-lg bg-tecla-corrige px-2 text-white">CORRIGE</span> para recomeçar.
                  </p>
                )}
              </section>

              <section className="rounded-3xl bg-tinta p-4 shadow-pop" aria-label="Teclado da urna">
                <div className="grid grid-cols-3 gap-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                    <Tecla key={d} onClick={() => digito(d)} disabled={digitos.length >= 2 || branco}>
                      {d}
                    </Tecla>
                  ))}
                  <span />
                  <Tecla onClick={() => digito('0')} disabled={digitos.length >= 2 || branco}>
                    0
                  </Tecla>
                  <span />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <button type="button" onClick={tBranco} disabled={digitos.length > 0 || branco} className="h-20 rounded-2xl bg-white text-lg font-black text-tinta shadow-[0_5px_0_#9ca3af] active:translate-y-1 active:shadow-none disabled:opacity-40">
                    BRANCO
                  </button>
                  <button type="button" onClick={corrige} className="h-20 rounded-2xl bg-tecla-corrige text-lg font-black text-white shadow-[0_5px_0_#9a3412] active:translate-y-1 active:shadow-none">
                    CORRIGE
                  </button>
                  <button type="button" onClick={confirma} disabled={!podeConfirmar} className="h-20 rounded-2xl bg-tecla-confirma text-lg font-black text-white shadow-[0_5px_0_#14532d] active:translate-y-1 active:shadow-none disabled:opacity-40">
                    CONFIRMA
                  </button>
                </div>
                <p className="mt-3 text-center text-xs text-white/60">Teclado físico: números, Enter confirma, Backspace corrige, B branco.</p>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="nao-imprimir fixed bottom-4 left-4 z-30">
        <Botao variante="contorno" tamanho="sm" onClick={() => abrirPainel(true)}>
          Encerrar votação
        </Botao>
      </div>
    </div>
  )
}

function Tecla({ children, onClick, disabled }: { children: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="h-20 rounded-2xl bg-[#2b2a4a] text-4xl font-black text-white shadow-[0_5px_0_#0f0e24] transition active:translate-y-1 active:shadow-none disabled:opacity-40" aria-label={`Tecla ${children}`}>
      {children}
    </button>
  )
}

function TelaFim({ reduz }: { reduz: boolean }) {
  return (
    <motion.div initial={reduz ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[24rem] flex-col items-center justify-center gap-4 rounded-3xl border-8 border-tinta/80 bg-[#EAF3EC] p-8 text-center shadow-pop" role="status">
      <motion.p className="titulo-projetor font-black text-sucesso" animate={reduz ? {} : { scale: [1, 1.08, 1] }} transition={{ repeat: 2, duration: 0.5 }}>
        FIM
      </motion.p>
      <p className="texto-projetor font-black">Voto registrado!</p>
      <p className="text-xl text-tinta-suave">Obrigado por participar. Chame a próxima pessoa.</p>
    </motion.div>
  )
}

function TelaEspera({ onLiberar, reduz }: { onLiberar: () => void; reduz: boolean }) {
  return (
    <motion.div initial={reduz ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[24rem] flex-col items-center justify-center gap-6 rounded-3xl border-8 border-tinta/80 bg-tinta p-8 text-center text-white shadow-pop">
      <Icone nome="cadeado" className="h-24 w-24 text-secundaria" />
      <p className="titulo-projetor font-black">Próximo eleitor</p>
      <p className="text-xl text-white/80">A urna está aguardando a liberação do mediador.</p>
      <Botao tamanho="xl" variante="secundaria" onClick={onLiberar}>
        <Icone nome="cadeado-aberto" />
        Mediador: liberar urna
      </Botao>
    </motion.div>
  )
}
