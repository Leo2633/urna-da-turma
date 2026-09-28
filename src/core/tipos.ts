/**
 * Tipos centrais da eleição. Sem React, sem dependências.
 * Regra de ouro: nenhum dado pessoal e nenhum vínculo entre voto e pessoa.
 */

export type Fase =
  | 'configuracao'
  | 'candidatura'
  | 'horario_eleitoral'
  | 'quiz'
  | 'zeresima'
  | 'votacao'
  | 'apuracao'
  | 'boletim'
  | 'sua_vez'

export const FASES: Fase[] = [
  'configuracao',
  'candidatura',
  'horario_eleitoral',
  'quiz',
  'zeresima',
  'votacao',
  'apuracao',
  'boletim',
  'sua_vez',
]

export type ModoCandidatos = 'turma' | 'ficticios'

/** Identificador do símbolo de campanha (desenho próprio em src/components/Emblema.tsx). */
export type Simbolo = 'onda' | 'raio' | 'folha' | 'ritmo' | 'sol' | 'vela' | 'prisma' | 'orbita'

export const SIMBOLOS: Simbolo[] = ['onda', 'raio', 'folha', 'ritmo', 'sol', 'vela', 'prisma', 'orbita']

/** Identificadores usados antes da troca dos mascotes por símbolos. */
const SIMBOLOS_ANTIGOS: Record<string, Simbolo> = {
  boto: 'onda',
  arara: 'raio',
  tartaruga: 'folha',
  guara: 'ritmo',
  tucano: 'sol',
  onca: 'vela',
  jacare: 'prisma',
  peixe_boi: 'orbita',
}

/** Converte qualquer identificador salvo (novo ou antigo) em um símbolo válido. */
export function normalizarSimbolo(id: string): Simbolo {
  if ((SIMBOLOS as string[]).includes(id)) return id as Simbolo
  return SIMBOLOS_ANTIGOS[id] ?? 'onda'
}

/** Cores de santinho (chaves do tema). */
export type CorSantinho = 'roxo' | 'laranja' | 'verde' | 'azul' | 'rosa' | 'amarelo' | 'vermelho' | 'ciano'
export const CORES_SANTINHO: CorSantinho[] = ['roxo', 'laranja', 'verde', 'azul', 'rosa', 'amarelo', 'vermelho', 'ciano']

export interface Candidato {
  id: string
  apelido: string
  /** Sempre 2 dígitos, como texto ("07", "42"). */
  numero: string
  slogan: string
  propostas: string[]
  /** Símbolo de campanha. O nome do campo foi mantido por compatibilidade com eleições já salvas. */
  mascote: Simbolo
  cor: CorSantinho
}

export interface Config {
  turma: string
  cargo: string
  eleitoresEsperados: number
  modoCandidatos: ModoCandidatos
  maioriaAbsoluta: boolean
  tempoDiscursoSeg: number
  liberacaoPeloMediador: boolean
  quizAtivo: boolean
  /** Hash SHA-256 (hex) do PIN do mediador. */
  pinHash: string
}

/** Chave de contagem: número do candidato, "branco" ou "nulo". */
export type ChaveVoto = string | 'branco' | 'nulo'

export interface Turno {
  numero: 1 | 2
  /** Candidatos que disputam este turno (ids). */
  candidatosIds: string[]
  /** Apenas contadores. Nunca registros individuais. */
  contagens: Record<ChaveVoto, number>
  comparecimento: number
  aberto: boolean
  encerrado: boolean
}

export interface CandidatoResultado {
  candidato: Candidato
  votos: number
  /** Percentual sobre votos válidos (0–100). */
  percentualValidos: number
}

export type Desfecho =
  | { tipo: 'eleito'; candidato: Candidato }
  | { tipo: 'segundo_turno'; motivo: 'empate' | 'sem_maioria'; finalistas: Candidato[] }
  | { tipo: 'empate_final'; empatados: Candidato[] }
  | { tipo: 'sem_votos' }

export interface Resultado {
  turno: 1 | 2
  ranking: CandidatoResultado[]
  validos: number
  brancos: number
  nulos: number
  total: number
  comparecimento: number
  eleitoresEsperados: number
  /** Percentual de comparecimento sobre esperados (0–100). */
  percentualComparecimento: number
  percentualAbstencao: number
  desfecho: Desfecho
}

export interface EquipeQuiz {
  id: string
  nome: string
  pontos: number
}

export interface EstadoQuiz {
  equipes: EquipeQuiz[]
  /** Índices das perguntas sorteadas para esta partida. */
  perguntasIds: string[]
  indiceAtual: number
  acertos: number
  respondidas: number
  concluido: boolean
}

export type ConquistaId =
  | 'comparecimento_total'
  | 'eleicao_sem_nulos'
  | 'turma_checadora'
  | 'democracia_dois_turnos'
  | 'primeira_candidatura'
  | 'urna_aberta'

export interface Gamificacao {
  xp: number
  conquistas: ConquistaId[]
}

export interface Eleicao {
  id: string
  criadaEm: string
  fase: Fase
  turnoAtual: 1 | 2
  config: Config
  candidatos: Candidato[]
  turnos: Turno[]
  quiz: EstadoQuiz
  gamificacao: Gamificacao
}
