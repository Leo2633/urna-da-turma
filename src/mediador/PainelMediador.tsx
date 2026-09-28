import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Botao } from '@/components/Botao'
import { Modal } from '@/components/Modal'
import { TrilhaFases } from '@/components/TrilhaFases'
import { Alternador, CampoTexto } from '@/components/Campo'
import { INFO_FASES, impedimentoParaAvancar, proximaFase, turnoCorrente } from '@/core'
import { useEleicao } from '@/store/useEleicao'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PinGate } from './PinGate'

/** Botão flutuante + drawer do mediador. */
export function PainelMediador() {
  const aberto = useEleicao((s) => s.painelAberto)
  const abrir = useEleicao((s) => s.abrirPainel)
  const autenticado = useEleicao((s) => s.mediadorAutenticado)
  return (
    <>
      <button
        type="button"
        onClick={() => abrir(true)}
        className="nao-imprimir fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-tinta text-2xl text-white shadow-pop hover:scale-105 focus-visible:outline-destaque md:h-16 md:w-16"
        aria-label="Abrir painel do mediador"
        title="Painel do mediador"
      >
        <span aria-hidden>🔐</span>
      </button>
      <Modal aberto={aberto && !autenticado} titulo="Painel do mediador" onFechar={() => abrir(false)}>
        <PinGate onOk={() => undefined} onCancelar={() => abrir(false)} />
      </Modal>
      <Drawer aberto={aberto && autenticado} />
    </>
  )
}

function Drawer({ aberto }: { aberto: boolean }) {
  const reduz = useReducedMotion()
  const e = useEleicao((s) => s.eleicao)
  const abrir = useEleicao((s) => s.abrirPainel)
  const sair = useEleicao((s) => s.sairMediador)
  const irParaFase = useEleicao((s) => s.irParaFase)
  const avancar = useEleicao((s) => s.avancarFase)
  const voltar = useEleicao((s) => s.voltarFase)
  const novaEleicao = useEleicao((s) => s.novaEleicao)
  const atualizarConfig = useEleicao((s) => s.atualizarConfig)
  const definirPin = useEleicao((s) => s.definirPin)
  const liberar = useEleicao((s) => s.liberarEleitor)
  const eleitorLiberado = useEleicao((s) => s.eleitorLiberado)
  const mudo = useEleicao((s) => s.mudo)
  const alternarMudo = useEleicao((s) => s.alternarMudo)
  const [confirmaNova, setConfirmaNova] = useState(0)
  const [novoPin, setNovoPin] = useState('')
  const [pinOk, setPinOk] = useState(false)

  if (!e) return null
  const impedimento = impedimentoParaAvancar(e)
  const prox = proximaFase(e.fase, e.config.quizAtivo)
  const turno = turnoCorrente(e)

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-tinta/50 backdrop-blur-sm nao-imprimir"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => abrir(false)}
            aria-hidden
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw,26rem)] flex-col bg-superficie shadow-2xl nao-imprimir"
            initial={reduz ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduz ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-label="Painel do mediador"
          >
            <header className="flex items-center justify-between border-b-4 border-tinta/10 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-secundaria">Painel do mediador</p>
                <h2 className="text-xl font-black">{INFO_FASES[e.fase].titulo}</h2>
              </div>
              <button type="button" onClick={() => abrir(false)} className="rounded-full px-3 text-3xl leading-none text-tinta-suave hover:bg-black/5" aria-label="Fechar painel">
                ×
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
              <section className="space-y-2">
                <div className="flex gap-2">
                  <Botao variante="contorno" tamanho="sm" onClick={() => { voltar(); abrir(false) }} disabled={e.fase === 'configuracao'} className="flex-1">
                    ← Voltar
                  </Botao>
                  <Botao tamanho="sm" onClick={() => { avancar(); abrir(false) }} disabled={!prox || !!impedimento} className="flex-1" title={impedimento ?? undefined}>
                    Avançar →
                  </Botao>
                </div>
                {impedimento && <p className="text-sm font-bold text-perigo">{impedimento}</p>}
              </section>

              {e.fase === 'votacao' && turno && (
                <section className="rounded-2xl bg-fundo p-4">
                  <p className="font-black">Urna</p>
                  <p className="text-sm text-tinta-suave">
                    {turno.comparecimento} de {e.config.eleitoresEsperados} votaram.
                  </p>
                  {e.config.liberacaoPeloMediador && (
                    <Botao tamanho="sm" variante={eleitorLiberado ? 'contorno' : 'sucesso'} className="mt-2 w-full" onClick={() => liberar(true)} disabled={eleitorLiberado}>
                      {eleitorLiberado ? 'Eleitor liberado' : 'Liberar próximo eleitor'}
                    </Botao>
                  )}
                </section>
              )}

              <section>
                <p className="mb-2 font-black">Mapa da eleição</p>
                <TrilhaFases atual={e.fase} quizAtivo={e.config.quizAtivo} onIr={irParaFase} />
              </section>

              <section className="space-y-3">
                <p className="font-black">Ajustes rápidos</p>
                <Alternador rotulo="Quiz Fato ou Fake" ajuda="Mostra ou esconde a fase opcional." marcado={e.config.quizAtivo} onChange={(v) => atualizarConfig({ quizAtivo: v })} />
                <Alternador
                  rotulo="Liberar cada eleitor pelo mediador"
                  ajuda="Evita voto duplo: a urna só abre para o próximo depois do seu toque."
                  marcado={e.config.liberacaoPeloMediador}
                  onChange={(v) => atualizarConfig({ liberacaoPeloMediador: v })}
                />
                <Alternador rotulo="Sons desligados" marcado={mudo} onChange={alternarMudo} />
              </section>

              <section className="space-y-2">
                <p className="font-black">Trocar PIN</p>
                <div className="flex items-end gap-2">
                  <CampoTexto rotulo="Novo PIN (4 dígitos)" inputMode="numeric" maxLength={4} value={novoPin} onChange={(ev) => { setPinOk(false); setNovoPin(ev.target.value.replace(/\D/g, '').slice(0, 4)) }} />
                  <Botao tamanho="sm" disabled={novoPin.length !== 4} onClick={() => void definirPin(novoPin).then(() => { setPinOk(true); setNovoPin('') })}>
                    Salvar
                  </Botao>
                </div>
                {pinOk && <p className="text-sm font-bold text-sucesso">PIN atualizado.</p>}
              </section>

              <section className="space-y-2 rounded-2xl border-4 border-perigo/30 p-4">
                <p className="font-black text-perigo">Nova eleição</p>
                <p className="text-sm text-tinta-suave">Apaga candidatos, votos, quiz e conquistas deste dispositivo.</p>
                {confirmaNova === 0 && (
                  <Botao variante="perigo" tamanho="sm" onClick={() => setConfirmaNova(1)}>
                    Zerar tudo…
                  </Botao>
                )}
                {confirmaNova === 1 && (
                  <div className="flex gap-2">
                    <Botao variante="perigo" tamanho="sm" onClick={() => { setConfirmaNova(0); void novaEleicao() }}>
                      Sim, apagar tudo
                    </Botao>
                    <Botao variante="fantasma" tamanho="sm" onClick={() => setConfirmaNova(0)}>
                      Cancelar
                    </Botao>
                  </div>
                )}
              </section>
            </div>

            <footer className="border-t-4 border-tinta/10 px-5 py-3">
              <Botao variante="fantasma" tamanho="sm" onClick={sair} className="w-full">
                Sair do painel (bloquear)
              </Botao>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
