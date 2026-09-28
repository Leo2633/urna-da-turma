import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Botao } from '@/components/Botao'
import { Card } from '@/components/Card'
import { Moldura } from '@/components/Moldura'
import { Emblema } from '@/components/Emblema'
import { apurar, planejarLotes, turnoCorrente } from '@/core'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useEleicao } from '@/store/useEleicao'
import { tema } from '@/theme/theme'
import { som } from '@/audio/urnaSom'
import { confeteGrande } from '@/components/confete'

export function Apuracao() {
  const e = useEleicao((s) => s.eleicao)!
  const dados = useEleicao((s) => s.dados)!
  const registrarConquistas = useEleicao((s) => s.registrarConquistasDaApuracao)
  const iniciarSegundoTurno = useEleicao((s) => s.iniciarSegundoTurno)
  const avancar = useEleicao((s) => s.avancarFase)
  const reduz = useReducedMotion()
  const turno = turnoCorrente(e)!
  const { maioriaAbsoluta, eleitoresEsperados } = e.config
  const final = useMemo(() => apurar(turno, e.candidatos, { maioriaAbsoluta, eleitoresEsperados }), [turno, e.candidatos, maioriaAbsoluta, eleitoresEsperados])
  const lotes = useMemo(() => planejarLotes(turno, dados.config.regras.tamanhoLoteApuracao, turno.comparecimento + 7), [turno, dados.config.regras.tamanhoLoteApuracao])
  const [passo, setPasso] = useState(0)
  const [rodando, setRodando] = useState(false)
  const terminou = passo >= lotes.length
  const conquistasFeitas = useRef(false)

  const parcial = passo === 0 ? Object.fromEntries(Object.keys(turno.contagens).map((k) => [k, 0])) : lotes[Math.min(passo, lotes.length) - 1]
  const contados = Object.values(parcial).reduce((a, b) => a + b, 0)
  const maxVotos = Math.max(1, ...final.ranking.map((r) => r.votos), final.brancos, final.nulos)

  useEffect(() => {
    if (!rodando || terminou) return
    const intervalo = reduz ? 200 : Math.max(350, 1400 - lotes.length * 40)
    const t = setTimeout(() => {
      som.tambor()
      setPasso((p) => p + 1)
    }, intervalo)
    return () => clearTimeout(t)
  }, [rodando, passo, terminou, lotes.length, reduz])

  useEffect(() => {
    if (!terminou || conquistasFeitas.current) return
    conquistasFeitas.current = true
    registrarConquistas()
    if (final.desfecho.tipo === 'eleito') {
      som.fanfarra()
      confeteGrande()
    }
  }, [terminou, final.desfecho.tipo, registrarConquistas])

  const d = final.desfecho

  return (
    <Moldura projetor titulo={`Apuração · ${e.turnoAtual}º turno`}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="texto-projetor font-black tabular-nums">
            {contados} <span className="text-tinta-suave">de {final.total} votos apurados</span>
          </p>
          <div className="flex gap-2">
            {!terminou && !rodando && (
              <Botao tamanho="lg" onClick={() => setRodando(true)}>
                {passo === 0 ? 'Começar a apuração' : 'Continuar'}
              </Botao>
            )}
            {!terminou && rodando && (
              <Botao tamanho="lg" variante="contorno" onClick={() => setRodando(false)}>
                Pausar
              </Botao>
            )}
            {!terminou && (
              <Botao tamanho="lg" variante="fantasma" onClick={() => { setRodando(false); setPasso(lotes.length) }}>
                Pular para o final
              </Botao>
            )}
          </div>
        </div>

        <Card className="space-y-4">
          <ul className="space-y-3" aria-live="off">
            {final.ranking.map((r) => (
              <Barra key={r.candidato.id} rotulo={`${r.candidato.numero} · ${r.candidato.apelido}`} mascote={r.candidato.mascote} votos={parcial[r.candidato.numero] ?? 0} max={maxVotos} cor={tema.santinho[r.candidato.cor].bg} pct={terminou ? r.percentualValidos : undefined} reduz={reduz} destaque={terminou && d.tipo === 'eleito' && d.candidato.id === r.candidato.id} />
            ))}
            <Barra rotulo="Brancos" votos={parcial.branco ?? 0} max={maxVotos} cor="#e5e7eb" reduz={reduz} secundaria />
            <Barra rotulo="Nulos" votos={parcial.nulo ?? 0} max={maxVotos} cor="#9ca3af" reduz={reduz} secundaria />
          </ul>
        </Card>

        {terminou && (
          <motion.div initial={reduz ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <Card className={`space-y-3 ${d.tipo === 'eleito' ? 'bg-sucesso text-white' : d.tipo === 'segundo_turno' ? 'bg-secundaria' : 'bg-destaque'}`}>
              {d.tipo === 'eleito' && (
                <div className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
                  <Emblema id={d.candidato.mascote} className="h-32 w-32 shrink-0" />
                  <div>
                    <p className="text-xl font-black uppercase tracking-widest">Eleito(a) para {e.config.cargo}</p>
                    <p className="titulo-projetor font-black">{d.candidato.apelido}</p>
                    <p className="text-2xl">
                      {final.ranking[0].votos} votos · {final.ranking[0].percentualValidos}% dos válidos
                    </p>
                  </div>
                </div>
              )}
              {d.tipo === 'segundo_turno' && (
                <>
                  <p className="titulo-projetor font-black">{dados.config.textos.segundoTurno.titulo}</p>
                  <p className="text-2xl">{d.motivo === 'empate' ? 'Houve empate na frente.' : 'Ninguém alcançou mais de 50% dos votos válidos.'}</p>
                  <p className="text-xl">{dados.config.textos.segundoTurno.explicacao}</p>
                  <p className="text-2xl font-black">Finalistas: {d.finalistas.map((c) => `${c.apelido} (${c.numero})`).join(' × ')}</p>
                </>
              )}
              {d.tipo === 'empate_final' && (
                <>
                  <p className="titulo-projetor font-black">Empate!</p>
                  <p className="text-2xl">Mesmo no segundo turno ficou empatado entre {d.empatados.map((c) => c.apelido).join(' e ')}. A turma decide como desempatar: nova votação ou sorteio.</p>
                </>
              )}
              {d.tipo === 'sem_votos' && (
                <>
                  <p className="titulo-projetor font-black">Sem votos válidos</p>
                  <p className="text-2xl">Só houve brancos e nulos. Ninguém foi eleito.</p>
                </>
              )}
            </Card>

            <div className="space-y-4">
              <Card>
                <h3 className="text-2xl font-black">{dados.config.textos.brancosNulos.titulo}</h3>
                <p className="mt-2 text-lg">{dados.config.textos.brancosNulos.explicacao}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-center">
                  <Pilula rotulo="Válidos" valor={final.validos} cor="bg-sucesso text-white" />
                  <Pilula rotulo="Brancos" valor={final.brancos} cor="bg-gray-200" />
                  <Pilula rotulo="Nulos" valor={final.nulos} cor="bg-gray-400 text-white" />
                </div>
              </Card>
              <Card>
                <h3 className="text-2xl font-black">Comparecimento</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Pilula rotulo="Compareceram" valor={`${final.percentualComparecimento}%`} cor="bg-primaria text-white" />
                  <Pilula rotulo="Abstenção" valor={`${final.percentualAbstencao}%`} cor="bg-tinta/10" />
                </div>
                <p className="mt-2 text-sm text-tinta-suave">
                  {final.comparecimento} de {final.eleitoresEsperados} eleitores esperados.
                </p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              {d.tipo === 'segundo_turno' && (
                <Botao tamanho="xl" variante="secundaria" onClick={() => iniciarSegundoTurno(d.finalistas)}>
                  Iniciar 2º turno
                </Botao>
              )}
              {d.tipo === 'empate_final' && (
                <Botao tamanho="lg" variante="secundaria" onClick={() => iniciarSegundoTurno(d.empatados)}>
                  Votar de novo entre os empatados
                </Botao>
              )}
              <Botao tamanho="xl" onClick={avancar}>
                Ver boletim de urna →
              </Botao>
            </div>
          </motion.div>
        )}
      </div>
    </Moldura>
  )
}

function Barra({ rotulo, mascote, votos, max, cor, pct, reduz, destaque, secundaria }: { rotulo: string; mascote?: string; votos: number; max: number; cor: string; pct?: number; reduz: boolean; destaque?: boolean; secundaria?: boolean }) {
  const largura = Math.max(2, (votos / max) * 100)
  return (
    <li className={`flex items-center gap-3 ${secundaria ? 'opacity-90' : ''}`}>
      <div className="flex w-40 shrink-0 items-center gap-2 md:w-64">
        {mascote && <Emblema id={mascote} className="h-10 w-10 md:h-14 md:w-14" />}
        <span className={`truncate font-black ${secundaria ? 'text-lg text-tinta-suave' : 'text-xl md:text-2xl'}`}>{rotulo}</span>
      </div>
      <div className="relative h-12 flex-1 overflow-hidden rounded-2xl bg-tinta/5 md:h-16">
        <motion.div className={`h-full rounded-2xl ${destaque ? 'ring-4 ring-destaque' : ''}`} style={{ background: cor }} initial={false} animate={{ width: `${largura}%` }} transition={reduz ? { duration: 0 } : { type: 'spring', stiffness: 60, damping: 15 }} />
      </div>
      <span className="w-28 shrink-0 text-right text-2xl font-black tabular-nums md:text-4xl" aria-label={`${votos} votos`}>
        {votos}
        {pct !== undefined && <span className="block text-sm font-bold text-tinta-suave">{pct}%</span>}
      </span>
    </li>
  )
}

function Pilula({ rotulo, valor, cor }: { rotulo: string; valor: number | string; cor: string }) {
  return (
    <div className={`rounded-2xl px-4 py-2 ${cor}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-80">{rotulo}</p>
      <p className="text-3xl font-black tabular-nums">{valor}</p>
    </div>
  )
}
