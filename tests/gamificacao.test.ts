import { describe, expect, it } from 'vitest'
import { calcularNivel, conquistaDoQuiz, conquistasDaApuracao } from '../src/core/gamificacao'
import { apurar } from '../src/core/apuracao'
import type { Eleicao } from '../src/core/tipos'
import { cand, turnoCom } from './helpers'

const A = cand('10'); const B = cand('22')
function eleicao(esperados: number, conquistas: Eleicao['gamificacao']['conquistas'] = []): Eleicao {
  return {
    id: 'e', criadaEm: '', fase: 'apuracao', turnoAtual: 1,
    config: { turma: 'T', cargo: 'C', eleitoresEsperados: esperados, modoCandidatos: 'turma', maioriaAbsoluta: false, tempoDiscursoSeg: 60, liberacaoPeloMediador: true, quizAtivo: true, pinHash: '' },
    candidatos: [A, B], turnos: [], quiz: { equipes: [], perguntasIds: [], indiceAtual: 0, acertos: 0, respondidas: 0, concluido: false },
    gamificacao: { xp: 0, conquistas },
  }
}

describe('níveis', () => {
  it('sobe de nível com XP', () => {
    expect(calcularNivel(0).nivel).toBe(1)
    expect(calcularNivel(150).nivel).toBe(2)
    expect(calcularNivel(149).progresso).toBe(99)
    expect(calcularNivel(5000).nivel).toBe(6)
  })
})

describe('conquistas coletivas', () => {
  it('comparecimento total e sem nulos', () => {
    const r = apurar(turnoCom([A, B], { '10': 3, '22': 2 }), [A, B], { maioriaAbsoluta: false, eleitoresEsperados: 5 })
    expect(conquistasDaApuracao(r, eleicao(5))).toEqual(['comparecimento_total', 'eleicao_sem_nulos'])
  })
  it('não repete conquista já obtida', () => {
    const r = apurar(turnoCom([A, B], { '10': 3, '22': 2 }), [A, B], { maioriaAbsoluta: false, eleitoresEsperados: 5 })
    expect(conquistasDaApuracao(r, eleicao(5, ['comparecimento_total', 'eleicao_sem_nulos']))).toEqual([])
  })
  it('segundo turno concluído', () => {
    const r = apurar(turnoCom([A, B], { '10': 3, '22': 2, nulo: 1 }, 2), [A, B], { maioriaAbsoluta: false, eleitoresEsperados: 30 })
    expect(conquistasDaApuracao(r, eleicao(30))).toEqual(['democracia_dois_turnos'])
  })
  it('turma checadora com 70% de acertos', () => {
    expect(conquistaDoQuiz(7, 10, [])).toBe('turma_checadora')
    expect(conquistaDoQuiz(6, 10, [])).toBeNull()
    expect(conquistaDoQuiz(9, 10, ['turma_checadora'])).toBeNull()
  })
})
