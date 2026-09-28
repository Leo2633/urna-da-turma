import { FASES, type Eleicao, type Fase } from './tipos'

export interface InfoFase {
  id: Fase
  titulo: string
  curto: string
  descricao: string
  opcional?: boolean
}

export const INFO_FASES: Record<Fase, InfoFase> = {
  configuracao: { id: 'configuracao', titulo: 'Configuração', curto: 'Config', descricao: 'Defina a turma, o cargo e as regras.' },
  candidatura: { id: 'candidatura', titulo: 'Registro de candidatura', curto: 'Candidatos', descricao: 'Quem vai disputar? Apelido, número e propostas.' },
  horario_eleitoral: { id: 'horario_eleitoral', titulo: 'Horário eleitoral', curto: 'Discursos', descricao: 'Cada candidatura apresenta suas ideias no tempo combinado.' },
  quiz: { id: 'quiz', titulo: 'Fato ou Fake', curto: 'Quiz', descricao: 'Desafio rápido sobre eleições e desinformação.', opcional: true },
  zeresima: { id: 'zeresima', titulo: 'Zerésima', curto: 'Zerésima', descricao: 'Prova de que a urna começa zerada.' },
  votacao: { id: 'votacao', titulo: 'Votação', curto: 'Urna', descricao: 'Hora de votar na urna simulada.' },
  apuracao: { id: 'apuracao', titulo: 'Apuração', curto: 'Apuração', descricao: 'Contagem ao vivo, com suspense.' },
  boletim: { id: 'boletim', titulo: 'Boletim e diplomação', curto: 'Boletim', descricao: 'Totais oficiais e diploma de quem venceu.' },
  sua_vez: { id: 'sua_vez', titulo: 'Sua vez de verdade', curto: 'Sua vez', descricao: 'Como tirar o título de eleitor.' },
}

export function indiceFase(f: Fase): number {
  return FASES.indexOf(f)
}

export function proximaFase(atual: Fase, quizAtivo: boolean): Fase | null {
  const i = indiceFase(atual)
  let prox = FASES[i + 1] ?? null
  if (prox === 'quiz' && !quizAtivo) prox = FASES[i + 2] ?? null
  return prox
}

export function faseAnterior(atual: Fase, quizAtivo: boolean): Fase | null {
  const i = indiceFase(atual)
  let ant = FASES[i - 1] ?? null
  if (ant === 'quiz' && !quizAtivo) ant = FASES[i - 2] ?? null
  return ant
}

/**
 * Verifica se a eleição pode avançar da fase atual. Retorna null se pode,
 * ou a mensagem do impedimento.
 */
export function impedimentoParaAvancar(e: Eleicao): string | null {
  switch (e.fase) {
    case 'configuracao':
      if (!e.config.turma.trim()) return 'Dê um nome à turma.'
      if (!e.config.cargo.trim()) return 'Defina o cargo em disputa.'
      if (e.config.eleitoresEsperados < 1) return 'Informe quantos eleitores são esperados.'
      return null
    case 'candidatura':
      if (e.candidatos.length < 2) return 'Registre pelo menos 2 candidaturas.'
      return null
    case 'votacao': {
      const t = turnoCorrente(e)
      if (!t || t.comparecimento === 0) return 'Ninguém votou ainda.'
      return null
    }
    default:
      return null
  }
}

export function turnoCorrente(e: Eleicao): import('./tipos').Turno | undefined {
  return e.turnos.find((t) => t.numero === e.turnoAtual)
}
