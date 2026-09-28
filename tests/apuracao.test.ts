import { describe, expect, it } from 'vitest'
import { apurar, planejarLotes, zeresima } from '../src/core/apuracao'
import { cand, turnoCom } from './helpers'

const A = cand('10', 'Lua')
const B = cand('22', 'Sol')
const C = cand('33', 'Mar')
const tres = [A, B, C]
const semMaioria = { maioriaAbsoluta: false, eleitoresEsperados: 30 }
const comMaioria = { maioriaAbsoluta: true, eleitoresEsperados: 30 }

describe('apurar: válidos, brancos e nulos', () => {
  it('separa válidos de brancos e nulos e calcula percentuais sobre válidos', () => {
    const r = apurar(turnoCom(tres, { '10': 6, '22': 3, '33': 1, branco: 2, nulo: 3 }), tres, semMaioria)
    expect(r.validos).toBe(10)
    expect(r.brancos).toBe(2)
    expect(r.nulos).toBe(3)
    expect(r.total).toBe(15)
    expect(r.ranking[0].candidato.numero).toBe('10')
    expect(r.ranking[0].percentualValidos).toBe(60)
    expect(r.ranking[1].percentualValidos).toBe(30)
    expect(r.desfecho).toEqual({ tipo: 'eleito', candidato: A })
  })
  it('calcula comparecimento e abstenção sobre os eleitores esperados', () => {
    const r = apurar(turnoCom(tres, { '10': 5, branco: 1 }), tres, { maioriaAbsoluta: false, eleitoresEsperados: 12 })
    expect(r.comparecimento).toBe(6)
    expect(r.percentualComparecimento).toBe(50)
    expect(r.percentualAbstencao).toBe(50)
  })
  it('sem votos válidos não há eleito', () => {
    const r = apurar(turnoCom(tres, { branco: 2, nulo: 1 }), tres, semMaioria)
    expect(r.desfecho.tipo).toBe('sem_votos')
  })
  it('brancos e nulos não elegem ninguém mesmo sendo maioria', () => {
    const r = apurar(turnoCom(tres, { '10': 1, branco: 10, nulo: 10 }), tres, comMaioria)
    expect(r.desfecho).toEqual({ tipo: 'eleito', candidato: A })
  })
})

describe('empate', () => {
  it('empate no topo do 1º turno leva os empatados ao 2º turno', () => {
    const r = apurar(turnoCom(tres, { '10': 4, '22': 4, '33': 1 }), tres, semMaioria)
    expect(r.desfecho.tipo).toBe('segundo_turno')
    if (r.desfecho.tipo === 'segundo_turno') {
      expect(r.desfecho.motivo).toBe('empate')
      expect(r.desfecho.finalistas.map((c) => c.numero)).toEqual(['10', '22'])
    }
  })
  it('empate triplo leva os três', () => {
    const r = apurar(turnoCom(tres, { '10': 2, '22': 2, '33': 2 }), tres, semMaioria)
    if (r.desfecho.tipo === 'segundo_turno') expect(r.desfecho.finalistas).toHaveLength(3)
    else throw new Error('esperava segundo turno')
  })
  it('empate no 2º turno é empate final', () => {
    const r = apurar(turnoCom([A, B], { '10': 3, '22': 3 }, 2), [A, B], semMaioria)
    expect(r.desfecho.tipo).toBe('empate_final')
  })
})

describe('maioria absoluta', () => {
  it('elege no 1º turno quando passa de 50% dos válidos', () => {
    const r = apurar(turnoCom(tres, { '10': 6, '22': 3, '33': 2, branco: 5 }), tres, comMaioria)
    expect(r.desfecho).toEqual({ tipo: 'eleito', candidato: A })
  })
  it('exatamente 50% não é maioria absoluta: vai a 2º turno com os 2 mais votados', () => {
    const r = apurar(turnoCom(tres, { '10': 5, '22': 3, '33': 2 }), tres, comMaioria)
    expect(r.desfecho.tipo).toBe('segundo_turno')
    if (r.desfecho.tipo === 'segundo_turno') {
      expect(r.desfecho.motivo).toBe('sem_maioria')
      expect(r.desfecho.finalistas.map((c) => c.numero)).toEqual(['10', '22'])
    }
  })
  it('empate na 2ª posição leva todos os empatados', () => {
    const r = apurar(turnoCom(tres, { '10': 4, '22': 3, '33': 3 }), tres, comMaioria)
    if (r.desfecho.tipo === 'segundo_turno') expect(r.desfecho.finalistas.map((c) => c.numero)).toEqual(['10', '22', '33'])
    else throw new Error('esperava segundo turno')
  })
  it('com só 2 candidatos não exige maioria absoluta', () => {
    const r = apurar(turnoCom([A, B], { '10': 2, '22': 1, branco: 5 }), [A, B], comMaioria)
    expect(r.desfecho.tipo).toBe('eleito')
  })
  it('no 2º turno vence a maioria simples', () => {
    const r = apurar(turnoCom([A, B], { '10': 4, '22': 3, nulo: 10 }, 2), [A, B], comMaioria)
    expect(r.desfecho).toEqual({ tipo: 'eleito', candidato: A })
  })
})

describe('segundo turno', () => {
  it('só conta candidatos em disputa no turno', () => {
    const t = turnoCom([A, B], { '10': 2, '22': 5 }, 2)
    const r = apurar(t, tres, semMaioria)
    expect(r.ranking).toHaveLength(2)
    expect(r.desfecho).toEqual({ tipo: 'eleito', candidato: B })
  })
})

describe('zerésima e lotes', () => {
  it('zerésima tem tudo zerado', () => {
    const r = zeresima(turnoCom(tres, { '10': 3, nulo: 1 }), tres, semMaioria)
    expect(r.total).toBe(0)
    expect(r.ranking.every((x) => x.votos === 0)).toBe(true)
    expect(r.desfecho.tipo).toBe('sem_votos')
  })
  it('lotes terminam na contagem final e são determinísticos', () => {
    const t = turnoCom(tres, { '10': 7, '22': 4, branco: 1, nulo: 2 })
    const lotes = planejarLotes(t, 5)
    expect(lotes).toHaveLength(3)
    expect(lotes[lotes.length - 1]).toEqual({ '10': 7, '22': 4, '33': 0, branco: 1, nulo: 2 })
    expect(planejarLotes(t, 5)).toEqual(lotes)
  })
})
