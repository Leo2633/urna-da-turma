import type { Candidato, Turno } from '../src/core/tipos'
import { criarTurno } from '../src/core/votacao'

export function cand(numero: string, apelido = `C${numero}`): Candidato {
  return { id: `id-${numero}`, apelido, numero, slogan: '', propostas: [], mascote: 'onda', cor: 'roxo' }
}

export function turnoCom(candidatos: Candidato[], votos: Record<string, number>, numero: 1 | 2 = 1): Turno {
  const t = criarTurno(numero, candidatos)
  const contagens = { ...t.contagens, ...votos }
  const comparecimento = Object.values(contagens).reduce((a, b) => a + b, 0)
  return { ...t, contagens, comparecimento, aberto: true }
}
