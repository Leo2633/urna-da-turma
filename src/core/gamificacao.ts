import type { ConquistaId, Eleicao, Resultado } from './tipos'

export interface InfoConquista {
  id: ConquistaId
  titulo: string
  descricao: string
  xp: number
  /** Nome do ícone em src/components/Icone.tsx. */
  icone: 'megafone' | 'urna' | 'trofeu' | 'escudo' | 'lupa' | 'repetir'
}

export const CONQUISTAS: Record<ConquistaId, InfoConquista> = {
  primeira_candidatura: { id: 'primeira_candidatura', titulo: 'Coragem cívica', descricao: 'A turma registrou sua primeira candidatura.', xp: 50, icone: 'megafone' },
  urna_aberta: { id: 'urna_aberta', titulo: 'Urna aberta', descricao: 'A zerésima foi conferida e a votação começou.', xp: 50, icone: 'urna' },
  comparecimento_total: { id: 'comparecimento_total', titulo: 'Comparecimento Total', descricao: '100% da turma votou. Ninguém ficou de fora!', xp: 200, icone: 'trofeu' },
  eleicao_sem_nulos: { id: 'eleicao_sem_nulos', titulo: 'Eleição sem Nulos', descricao: 'Nenhum voto nulo. A turma votou com atenção.', xp: 150, icone: 'escudo' },
  turma_checadora: { id: 'turma_checadora', titulo: 'Turma Checadora', descricao: 'Pelo menos 70% de acertos no Fato ou Fake.', xp: 150, icone: 'lupa' },
  democracia_dois_turnos: { id: 'democracia_dois_turnos', titulo: 'Democracia em Dois Turnos', descricao: 'A turma viveu um segundo turno completo.', xp: 200, icone: 'repetir' },
}

export const XP_POR_FASE = 30
export const XP_POR_VOTO = 5
export const XP_POR_ACERTO_QUIZ = 10

export interface Nivel {
  nivel: number
  titulo: string
  xpBase: number
  xpProximo: number
  /** Progresso 0–100 dentro do nível atual. */
  progresso: number
}

const TITULOS = ['Iniciante', 'Curiosa', 'Cidadã em treino', 'Eleitora esperta', 'Turma democrática', 'Lenda das urnas']

/** Níveis: 0, 150, 400, 750, 1200, 1800 XP. */
const LIMIARES = [0, 150, 400, 750, 1200, 1800]

export function calcularNivel(xp: number): Nivel {
  let idx = 0
  for (let i = 0; i < LIMIARES.length; i++) if (xp >= LIMIARES[i]) idx = i
  const xpBase = LIMIARES[idx]
  const xpProximo = LIMIARES[idx + 1] ?? xpBase + 600
  const progresso = Math.min(100, Math.round(((xp - xpBase) / (xpProximo - xpBase)) * 100))
  return { nivel: idx + 1, titulo: TITULOS[idx] ?? TITULOS[TITULOS.length - 1], xpBase, xpProximo, progresso }
}

/** Conquistas que o resultado da apuração desbloqueia. */
export function conquistasDaApuracao(r: Resultado, e: Eleicao): ConquistaId[] {
  const novas: ConquistaId[] = []
  const ja = new Set(e.gamificacao.conquistas)
  if (!ja.has('comparecimento_total') && r.comparecimento >= e.config.eleitoresEsperados && r.comparecimento > 0) novas.push('comparecimento_total')
  if (!ja.has('eleicao_sem_nulos') && r.nulos === 0 && r.total > 0) novas.push('eleicao_sem_nulos')
  if (!ja.has('democracia_dois_turnos') && r.turno === 2) novas.push('democracia_dois_turnos')
  return novas
}

export function conquistaDoQuiz(acertos: number, respondidas: number, existentes: ConquistaId[]): ConquistaId | null {
  if (existentes.includes('turma_checadora')) return null
  if (respondidas > 0 && acertos / respondidas >= 0.7) return 'turma_checadora'
  return null
}
