import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Botao } from '@/components/Botao'
import { Card } from '@/components/Card'
import { CampoTexto } from '@/components/Campo'
import { Moldura } from '@/components/Moldura'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useEleicao } from '@/store/useEleicao'
import { som } from '@/audio/urnaSom'
import { confeteCurto } from '@/components/confete'

function sortear<T>(arr: T[], n: number): T[] {
  const copia = [...arr]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia.slice(0, n)
}

export function Quiz() {
  const e = useEleicao((s) => s.eleicao)!
  const dados = useEleicao((s) => s.dados)!
  const iniciar = useEleicao((s) => s.iniciarQuiz)
  const responder = useEleicao((s) => s.responderQuiz)
  const concluir = useEleicao((s) => s.concluirQuiz)
  const avancar = useEleicao((s) => s.avancarFase)
  const reduz = useReducedMotion()
  const q = e.quiz
  const [modo, setModo] = useState<'coletivo' | 'equipes'>('coletivo')
  const [nomes, setNomes] = useState(['Equipe Azul', 'Equipe Laranja'])
  const [qtd, setQtd] = useState(dados.config.regras.perguntasPorPartida)
  const [equipeDaVez, setEquipeDaVez] = useState(0)
  const [escolha, setEscolha] = useState<number | null>(null)

  const perguntas = useMemo(() => q.perguntasIds.map((id) => dados.perguntas.find((p) => p.id === id)!).filter(Boolean), [q.perguntasIds, dados.perguntas])
  const emAndamento = q.perguntasIds.length > 0 && !q.concluido
  const atual = perguntas[q.indiceAtual]

  const comecar = () => {
    const n = Math.min(Math.max(5, qtd), Math.min(8, dados.perguntas.length))
    iniciar(modo === 'equipes' ? nomes.filter(Boolean) : [], sortear(dados.perguntas, n).map((p) => p.id))
    setEscolha(null)
    setEquipeDaVez(0)
  }

  const escolher = (i: number) => {
    if (escolha !== null || !atual) return
    setEscolha(i)
    const acertou = i === atual.correta
    if (acertou) {
      som.acerto()
      confeteCurto()
    } else som.erro()
    responder(q.equipes[equipeDaVez]?.id ?? null, acertou)
  }

  const proxima = () => {
    setEscolha(null)
    setEquipeDaVez((x) => (q.equipes.length ? (x + 1) % q.equipes.length : 0))
    if (q.indiceAtual >= perguntas.length) concluir()
  }

  // Após responder, indiceAtual já avançou; a pergunta exibida é a anterior enquanto a explicação aparece.
  const exibida = escolha !== null ? perguntas[q.indiceAtual - 1] : atual

  if (!emAndamento && !q.concluido) {
    return (
      <Moldura>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="text-3xl font-black">Fato ou Fake?</h2>
            <p className="text-tinta-suave">Perguntas rápidas sobre eleições e desinformação. A turma responde junta ou em equipes. Cada acerto rende XP para a turma inteira.</p>
            <fieldset className="space-y-2">
              <legend className="font-bold">Como jogar</legend>
              <div className="flex gap-2">
                <Botao variante={modo === 'coletivo' ? 'primaria' : 'contorno'} onClick={() => setModo('coletivo')} aria-pressed={modo === 'coletivo'}>
                  Turma toda
                </Botao>
                <Botao variante={modo === 'equipes' ? 'primaria' : 'contorno'} onClick={() => setModo('equipes')} aria-pressed={modo === 'equipes'}>
                  Em equipes
                </Botao>
              </div>
            </fieldset>
            {modo === 'equipes' && (
              <div className="space-y-2">
                {nomes.map((n, i) => (
                  <CampoTexto key={i} rotulo={`Equipe ${i + 1}`} value={n} onChange={(ev) => setNomes(nomes.map((x, j) => (j === i ? ev.target.value : x)))} maxLength={20} />
                ))}
                <div className="flex gap-2">
                  {nomes.length < 4 && (
                    <Botao variante="fantasma" tamanho="sm" onClick={() => setNomes([...nomes, `Equipe ${nomes.length + 1}`])}>
                      + equipe
                    </Botao>
                  )}
                  {nomes.length > 2 && (
                    <Botao variante="fantasma" tamanho="sm" onClick={() => setNomes(nomes.slice(0, -1))}>
                      − equipe
                    </Botao>
                  )}
                </div>
              </div>
            )}
            <CampoTexto rotulo="Quantas perguntas? (5 a 8)" type="number" min={5} max={8} value={qtd} onChange={(ev) => setQtd(Number(ev.target.value))} />
            <div className="flex flex-wrap gap-2">
              <Botao tamanho="lg" onClick={comecar}>
                Começar o desafio 🔎
              </Botao>
              <Botao tamanho="lg" variante="fantasma" onClick={avancar}>
                Pular esta fase
              </Botao>
            </div>
          </Card>
          <Card className="bg-destaque">
            <h3 className="text-2xl font-black">Conquista em jogo</h3>
            <p className="mt-2 text-lg">
              <span className="text-3xl" aria-hidden>
                🔎
              </span>{' '}
              <strong>Turma Checadora</strong>: acerte 70% ou mais das perguntas.
            </p>
          </Card>
        </div>
      </Moldura>
    )
  }

  if (q.concluido) {
    const pct = q.respondidas ? Math.round((q.acertos / q.respondidas) * 100) : 0
    return (
      <Moldura projetor>
        <Card className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="titulo-projetor font-black text-primaria">{pct}%</h2>
          <p className="texto-projetor font-black">
            {q.acertos} de {q.respondidas} acertos
          </p>
          {q.equipes.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-3">
              {[...q.equipes].sort((a, b) => b.pontos - a.pontos).map((eq) => (
                <li key={eq.id} className="rounded-2xl bg-fundo px-4 py-2 text-xl font-black">
                  {eq.nome}: {eq.pontos}
                </li>
              ))}
            </ul>
          )}
          <p className="text-tinta-suave">{pct >= 70 ? 'A turma manja de checagem! Conquista desbloqueada.' : 'Quase lá. Vale repetir o desafio outro dia.'}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Botao variante="contorno" onClick={comecar}>
              Jogar de novo
            </Botao>
            <Botao tamanho="lg" onClick={avancar}>
              Seguir para a zerésima →
            </Botao>
          </div>
        </Card>
      </Moldura>
    )
  }

  if (!exibida) return null
  const numero = escolha !== null ? q.indiceAtual : q.indiceAtual + 1

  return (
    <Moldura projetor>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xl font-black text-tinta-suave">
          <span>
            Pergunta {numero} de {perguntas.length}
          </span>
          {q.equipes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {q.equipes.map((eq, i) => (
                <span key={eq.id} className={`rounded-full px-3 py-1 ${i === equipeDaVez && escolha === null ? 'bg-destaque text-tinta ring-4 ring-primaria' : 'bg-superficie'}`}>
                  {eq.nome}: {eq.pontos}
                </span>
              ))}
            </div>
          )}
          <span>
            Acertos: {q.acertos}/{q.respondidas}
          </span>
        </div>
        <motion.div key={exibida.id} initial={reduz ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
            <Card className="space-y-6">
              <h2 className="texto-projetor font-black leading-tight">{exibida.enunciado}</h2>
              <div className={`grid gap-3 ${exibida.alternativas.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                {exibida.alternativas.map((alt, i) => {
                  const correta = i === exibida.correta
                  const marcada = escolha === i
                  let cor = 'bg-fundo hover:bg-primaria/10 border-tinta/10'
                  if (escolha !== null) {
                    if (correta) cor = 'bg-sucesso text-white border-sucesso'
                    else if (marcada) cor = 'bg-perigo text-white border-perigo'
                    else cor = 'bg-fundo border-tinta/10 opacity-60'
                  }
                  return (
                    <button key={i} type="button" disabled={escolha !== null} onClick={() => escolher(i)} className={`rounded-2xl border-4 px-5 py-4 text-left text-2xl font-black transition md:text-3xl ${cor}`} aria-pressed={marcada}>
                      <span className="mr-3 inline-block rounded-full bg-white/40 px-3 text-xl text-tinta" aria-hidden>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {alt}
                    </button>
                  )
                })}
              </div>
              {escolha !== null && (
                <motion.div initial={reduz ? false : { scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`rounded-2xl p-5 text-xl md:text-2xl ${escolha === exibida.correta ? 'bg-sucesso/15' : 'bg-perigo/10'}`} role="status">
                  <p className="font-black">{escolha === exibida.correta ? '✅ Acertou!' : '❌ Não foi dessa vez.'}</p>
                  <p>{exibida.explicacao}</p>
                  <Botao tamanho="lg" className="mt-4" onClick={proxima}>
                    {q.indiceAtual >= perguntas.length ? 'Ver resultado →' : 'Próxima pergunta →'}
                  </Botao>
                </motion.div>
              )}
            </Card>
        </motion.div>
      </div>
    </Moldura>
  )
}
