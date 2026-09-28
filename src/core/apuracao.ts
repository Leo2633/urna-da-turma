import type { Candidato, CandidatoResultado, Desfecho, Resultado, Turno } from './tipos'

function pct(parte: number, todo: number): number {
  if (todo <= 0) return 0
  return Math.round((parte / todo) * 1000) / 10
}

export interface OpcoesApuracao {
  maioriaAbsoluta: boolean
  eleitoresEsperados: number
}

/**
 * Apura um turno. Regras:
 * - Válidos = total - brancos - nulos.
 * - Percentuais dos candidatos são sobre os válidos.
 * - Sem maioria absoluta configurada: vence quem tem mais votos; empate no topo → 2º turno (no 1º) ou empate final (no 2º).
 * - Com maioria absoluta: precisa de mais de 50% dos válidos; senão → 2º turno com os 2 mais votados (ou todos empatados na 2ª posição).
 */
export function apurar(turno: Turno, candidatos: Candidato[], opcoes: OpcoesApuracao): Resultado {
  const emDisputa = candidatos.filter((c) => turno.candidatosIds.includes(c.id))
  const brancos = turno.contagens.branco ?? 0
  const nulos = turno.contagens.nulo ?? 0
  const votosCandidatos = emDisputa.map((c) => turno.contagens[c.numero] ?? 0)
  const validos = votosCandidatos.reduce((a, b) => a + b, 0)
  const total = validos + brancos + nulos

  const ranking: CandidatoResultado[] = emDisputa
    .map((candidato, i) => ({ candidato, votos: votosCandidatos[i], percentualValidos: pct(votosCandidatos[i], validos) }))
    .sort((a, b) => b.votos - a.votos || a.candidato.numero.localeCompare(b.candidato.numero))

  const desfecho = decidir(ranking, validos, turno.numero, opcoes.maioriaAbsoluta)

  const comparecimento = turno.comparecimento
  const esperados = Math.max(opcoes.eleitoresEsperados, comparecimento)
  const percentualComparecimento = pct(comparecimento, esperados)

  return {
    turno: turno.numero,
    ranking,
    validos,
    brancos,
    nulos,
    total,
    comparecimento,
    eleitoresEsperados: esperados,
    percentualComparecimento,
    percentualAbstencao: Math.round((100 - percentualComparecimento) * 10) / 10,
    desfecho,
  }
}

function decidir(ranking: CandidatoResultado[], validos: number, turno: 1 | 2, maioriaAbsoluta: boolean): Desfecho {
  if (validos === 0 || ranking.length === 0) return { tipo: 'sem_votos' }
  const topo = ranking[0]
  const empatadosNoTopo = ranking.filter((r) => r.votos === topo.votos)

  if (empatadosNoTopo.length > 1) {
    if (turno === 1) {
      return { tipo: 'segundo_turno', motivo: 'empate', finalistas: empatadosNoTopo.map((r) => r.candidato) }
    }
    return { tipo: 'empate_final', empatados: empatadosNoTopo.map((r) => r.candidato) }
  }

  if (maioriaAbsoluta && turno === 1 && ranking.length > 2) {
    const temMaioria = topo.votos * 2 > validos
    if (!temMaioria) {
      const segundo = ranking[1]
      const empatadosNoSegundo = ranking.slice(1).filter((r) => r.votos === segundo.votos)
      return {
        tipo: 'segundo_turno',
        motivo: 'sem_maioria',
        finalistas: [topo.candidato, ...empatadosNoSegundo.map((r) => r.candidato)],
      }
    }
  }

  return { tipo: 'eleito', candidato: topo.candidato }
}

/** Zerésima: mesmo formato do resultado, com tudo zerado. */
export function zeresima(turno: Turno, candidatos: Candidato[], opcoes: OpcoesApuracao): Resultado {
  const zerado: Turno = {
    ...turno,
    comparecimento: 0,
    contagens: Object.fromEntries(Object.keys(turno.contagens).map((k) => [k, 0])),
  }
  return apurar(zerado, candidatos, opcoes)
}

/**
 * Planeja os lotes de revelação para a apuração animada.
 * Retorna uma sequência de estados parciais de contagem, embaralhando os votos
 * (a ordem é sintética: não há ordem real, porque só existem contadores).
 */
export function planejarLotes(turno: Turno, tamanhoLote = 5, semente = 42): Array<Record<string, number>> {
  const fila: string[] = []
  for (const [chave, n] of Object.entries(turno.contagens)) for (let i = 0; i < n; i++) fila.push(chave)
  // embaralhamento determinístico (LCG) para testes reproduzíveis
  let s = semente
  const rand = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296
  for (let i = fila.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[fila[i], fila[j]] = [fila[j], fila[i]]
  }
  const parcial: Record<string, number> = Object.fromEntries(Object.keys(turno.contagens).map((k) => [k, 0]))
  const lotes: Array<Record<string, number>> = []
  for (let i = 0; i < fila.length; i += tamanhoLote) {
    for (const chave of fila.slice(i, i + tamanhoLote)) parcial[chave] += 1
    lotes.push({ ...parcial })
  }
  return lotes
}
