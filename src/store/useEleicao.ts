import { create } from 'zustand'
import { criarRepositorio } from '@/adapters/repositorio'
import { hashPin } from '@/adapters/pin'
import {
  CONQUISTAS,
  XP_POR_ACERTO_QUIZ,
  XP_POR_FASE,
  XP_POR_VOTO,
  apurar,
  calcularNivel,
  conquistaDoQuiz,
  conquistasDaApuracao,
  criarTurno,
  proximaFase,
  faseAnterior,
  registrarVoto,
  turnoCorrente,
  type Candidato,
  type ChaveVoto,
  type Config,
  type ConquistaId,
  type Eleicao,
  type EquipeQuiz,
  type Fase,
  type Resultado,
} from '@/core'
import type { CandidatoFicticio, DadosApp } from '@/dados/tipos'
import { carregarDados } from '@/dados/carregar'
import { som } from '@/audio/urnaSom'
import type { NomeIcone } from '@/components/Icone'

const repo = criarRepositorio()

export interface Aviso {
  id: number
  tipo: 'conquista' | 'nivel' | 'info'
  titulo: string
  texto?: string
  icone?: NomeIcone
}

interface Estado {
  pronto: boolean
  erroCarga: string | null
  dados: DadosApp | null
  eleicao: Eleicao | null
  mediadorAutenticado: boolean
  painelAberto: boolean
  eleitorLiberado: boolean
  avisos: Aviso[]
  mudo: boolean
}

interface Acoes {
  inicializar(): Promise<void>
  novaEleicao(): Promise<void>
  atualizarConfig(parcial: Partial<Config>): void
  definirPin(pin: string): Promise<void>
  autenticarMediador(pin: string): Promise<boolean>
  sairMediador(): void
  abrirPainel(v: boolean): void
  irParaFase(f: Fase): void
  avancarFase(): void
  voltarFase(): void
  adicionarCandidato(c: Omit<Candidato, 'id'>): void
  editarCandidato(id: string, c: Partial<Omit<Candidato, 'id'>>): void
  removerCandidato(id: string): void
  carregarFicticios(lista: CandidatoFicticio[]): void
  abrirVotacao(): void
  votar(chave: ChaveVoto): void
  liberarEleitor(v: boolean): void
  encerrarVotacao(): void
  resultadoAtual(): Resultado | null
  registrarConquistasDaApuracao(): void
  iniciarSegundoTurno(finalistas: Candidato[]): void
  iniciarQuiz(equipes: string[], perguntasIds: string[]): void
  responderQuiz(equipeId: string | null, acertou: boolean): void
  concluirQuiz(): void
  ganharXp(n: number): void
  desbloquear(ids: ConquistaId[]): void
  dispensarAviso(id: number): void
  alternarMudo(): void
}

export type Store = Estado & Acoes

let contadorAviso = 1

function eleicaoVazia(dados: DadosApp, pinHash: string): Eleicao {
  const r = dados.config.regras
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    criadaEm: new Date().toISOString(),
    fase: 'configuracao',
    turnoAtual: 1,
    config: {
      turma: '',
      cargo: dados.config.cargosSugeridos[0] ?? 'Representante da Turma',
      eleitoresEsperados: r.eleitoresEsperadosPadrao,
      modoCandidatos: 'turma',
      maioriaAbsoluta: r.maioriaAbsolutaPadrao,
      tempoDiscursoSeg: r.tempoDiscursoSeg,
      liberacaoPeloMediador: r.liberacaoPeloMediador,
      quizAtivo: true,
      pinHash,
    },
    candidatos: [],
    turnos: [],
    quiz: { equipes: [], perguntasIds: [], indiceAtual: 0, acertos: 0, respondidas: 0, concluido: false },
    gamificacao: { xp: 0, conquistas: [] },
  }
}

export const useEleicao = create<Store>()((set, get) => {
  /** Aplica uma mutação imutável à eleição e persiste. */
  function mutar(fn: (e: Eleicao) => Eleicao) {
    const atual = get().eleicao
    if (!atual) return
    const nova = fn(atual)
    set({ eleicao: nova })
    void repo.salvar(nova)
  }

  function avisar(a: Omit<Aviso, 'id'>) {
    set((s) => ({ avisos: [...s.avisos, { ...a, id: contadorAviso++ }] }))
  }

  return {
    pronto: false,
    erroCarga: null,
    dados: null,
    eleicao: null,
    mediadorAutenticado: false,
    painelAberto: false,
    eleitorLiberado: true,
    avisos: [],
    mudo: false,

    async inicializar() {
      try {
        const dados = await carregarDados()
        void som.carregarArquivos(dados.config.sons, import.meta.env.BASE_URL)
        let eleicao = await repo.carregar()
        if (!eleicao) {
          eleicao = eleicaoVazia(dados, await hashPin(dados.config.mediador.pinPadrao))
          await repo.salvar(eleicao)
        }
        set({ dados, eleicao, pronto: true, eleitorLiberado: !eleicao.config.liberacaoPeloMediador })
      } catch (e) {
        set({ erroCarga: e instanceof Error ? e.message : String(e), pronto: true })
      }
    },

    async novaEleicao() {
      const { dados } = get()
      if (!dados) return
      await repo.apagar()
      const e = eleicaoVazia(dados, await hashPin(dados.config.mediador.pinPadrao))
      await repo.salvar(e)
      set({ eleicao: e, painelAberto: false, eleitorLiberado: !e.config.liberacaoPeloMediador, avisos: [] })
    },

    atualizarConfig(parcial) {
      mutar((e) => ({ ...e, config: { ...e.config, ...parcial } }))
      if (parcial.liberacaoPeloMediador !== undefined) set({ eleitorLiberado: !parcial.liberacaoPeloMediador })
    },

    async definirPin(pin) {
      const pinHash = await hashPin(pin)
      mutar((e) => ({ ...e, config: { ...e.config, pinHash } }))
    },

    async autenticarMediador(pin) {
      const e = get().eleicao
      if (!e) return false
      const ok = (await hashPin(pin)) === e.config.pinHash
      if (ok) set({ mediadorAutenticado: true })
      return ok
    },

    sairMediador() {
      set({ mediadorAutenticado: false, painelAberto: false })
    },

    abrirPainel(v) {
      set({ painelAberto: v })
    },

    irParaFase(f) {
      mutar((e) => ({ ...e, fase: f }))
      set({ painelAberto: false })
    },

    avancarFase() {
      const e = get().eleicao
      if (!e) return
      // Fases com efeito colateral passam pelas ações específicas.
      if (e.fase === 'zeresima') return get().abrirVotacao()
      if (e.fase === 'votacao') return get().encerrarVotacao()
      const prox = proximaFase(e.fase, e.config.quizAtivo)
      if (!prox) return
      get().ganharXp(XP_POR_FASE)
      mutar((x) => ({ ...x, fase: prox }))
    },

    voltarFase() {
      const e = get().eleicao
      if (!e) return
      const ant = faseAnterior(e.fase, e.config.quizAtivo)
      if (ant) mutar((x) => ({ ...x, fase: ant }))
    },

    adicionarCandidato(c) {
      const primeira = (get().eleicao?.candidatos.length ?? 0) === 0
      mutar((e) => ({ ...e, candidatos: [...e.candidatos, { ...c, id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }] }))
      if (primeira) get().desbloquear(['primeira_candidatura'])
    },

    editarCandidato(id, c) {
      mutar((e) => ({ ...e, candidatos: e.candidatos.map((k) => (k.id === id ? { ...k, ...c } : k)) }))
    },

    removerCandidato(id) {
      mutar((e) => ({ ...e, candidatos: e.candidatos.filter((k) => k.id !== id) }))
    },

    carregarFicticios(lista) {
      mutar((e) => ({
        ...e,
        candidatos: lista.map((f, i) => ({ ...f, id: `f-${i}-${f.numero}` })),
      }))
      get().desbloquear(['primeira_candidatura'])
    },

    abrirVotacao() {
      mutar((e) => {
        let turnos = e.turnos
        if (!turnos.some((t) => t.numero === e.turnoAtual)) {
          turnos = [...turnos, criarTurno(e.turnoAtual, e.candidatos)]
        }
        return {
          ...e,
          fase: 'votacao',
          turnos: turnos.map((t) => (t.numero === e.turnoAtual ? { ...t, aberto: true } : t)),
        }
      })
      // O mediador acabou de abrir a urna: o primeiro eleitor já está liberado.
      set({ eleitorLiberado: true })
      get().desbloquear(['urna_aberta'])
    },

    votar(chave) {
      const e = get().eleicao
      if (!e) return
      mutar((x) => ({
        ...x,
        turnos: x.turnos.map((t) => (t.numero === x.turnoAtual ? registrarVoto(t, chave) : t)),
      }))
      get().ganharXp(XP_POR_VOTO)
      if (e.config.liberacaoPeloMediador) set({ eleitorLiberado: false })
    },

    liberarEleitor(v) {
      set({ eleitorLiberado: v })
    },

    encerrarVotacao() {
      mutar((e) => ({
        ...e,
        fase: 'apuracao',
        turnos: e.turnos.map((t) => (t.numero === e.turnoAtual ? { ...t, aberto: false, encerrado: true } : t)),
      }))
      get().ganharXp(XP_POR_FASE)
    },

    resultadoAtual() {
      const e = get().eleicao
      if (!e) return null
      const t = turnoCorrente(e)
      if (!t) return null
      return apurar(t, e.candidatos, { maioriaAbsoluta: e.config.maioriaAbsoluta, eleitoresEsperados: e.config.eleitoresEsperados })
    },

    registrarConquistasDaApuracao() {
      const e = get().eleicao
      const r = get().resultadoAtual()
      if (!e || !r) return
      const novas = conquistasDaApuracao(r, e)
      if (novas.length) get().desbloquear(novas)
    },

    iniciarSegundoTurno(finalistas) {
      mutar((e) => ({
        ...e,
        turnoAtual: 2,
        fase: 'zeresima',
        turnos: [...e.turnos.filter((t) => t.numero !== 2), criarTurno(2, finalistas)],
      }))
      avisar({ tipo: 'info', titulo: 'Segundo turno!', texto: 'A urna será reaberta só com os finalistas.', icone: 'repetir' })
    },

    iniciarQuiz(nomes, perguntasIds) {
      const equipes: EquipeQuiz[] = nomes.map((nome, i) => ({ id: `eq-${i}`, nome, pontos: 0 }))
      mutar((e) => ({ ...e, quiz: { equipes, perguntasIds, indiceAtual: 0, acertos: 0, respondidas: 0, concluido: false } }))
    },

    responderQuiz(equipeId, acertou) {
      mutar((e) => ({
        ...e,
        quiz: {
          ...e.quiz,
          equipes: e.quiz.equipes.map((q) => (q.id === equipeId && acertou ? { ...q, pontos: q.pontos + 1 } : q)),
          acertos: e.quiz.acertos + (acertou ? 1 : 0),
          respondidas: e.quiz.respondidas + 1,
          indiceAtual: e.quiz.indiceAtual + 1,
        },
      }))
      if (acertou) get().ganharXp(XP_POR_ACERTO_QUIZ)
    },

    concluirQuiz() {
      const e = get().eleicao
      if (!e) return
      mutar((x) => ({ ...x, quiz: { ...x.quiz, concluido: true } }))
      const c = conquistaDoQuiz(e.quiz.acertos, e.quiz.respondidas, e.gamificacao.conquistas)
      if (c) get().desbloquear([c])
    },

    ganharXp(n) {
      const antes = get().eleicao?.gamificacao.xp ?? 0
      mutar((e) => ({ ...e, gamificacao: { ...e.gamificacao, xp: e.gamificacao.xp + n } }))
      const na = calcularNivel(antes)
      const nd = calcularNivel(antes + n)
      if (nd.nivel > na.nivel) {
        som.fanfarra()
        avisar({ tipo: 'nivel', titulo: `Nível ${nd.nivel}: ${nd.titulo}!`, texto: 'A turma subiu de nível.', icone: 'seta-cima' })
      }
    },

    desbloquear(ids) {
      const e = get().eleicao
      if (!e) return
      const novas = ids.filter((id) => !e.gamificacao.conquistas.includes(id))
      if (!novas.length) return
      mutar((x) => ({ ...x, gamificacao: { ...x.gamificacao, conquistas: [...x.gamificacao.conquistas, ...novas] } }))
      let xp = 0
      for (const id of novas) {
        const c = CONQUISTAS[id]
        xp += c.xp
        avisar({ tipo: 'conquista', titulo: c.titulo, texto: c.descricao, icone: c.icone })
      }
      som.fanfarra()
      get().ganharXp(xp)
    },

    dispensarAviso(id) {
      set((s) => ({ avisos: s.avisos.filter((a) => a.id !== id) }))
    },

    alternarMudo() {
      const m = !get().mudo
      som.setMudo(m)
      set({ mudo: m })
    },
  }
})
