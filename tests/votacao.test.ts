import { describe, expect, it } from 'vitest'
import { chaveDeInterpretacao, criarTurno, interpretarDigitos, registrarVoto, validarApelido, validarNumero } from '../src/core/votacao'
import { cand } from './helpers'

const candidatos = [cand('10', 'Lua'), cand('22', 'Sol')]

describe('interpretarDigitos', () => {
  it('fica incompleto com 1 dígito', () => {
    expect(interpretarDigitos('1', candidatos)).toEqual({ tipo: 'incompleto', digitos: '1' })
  })
  it('acha o candidato pelo número', () => {
    const r = interpretarDigitos('22', candidatos)
    expect(r.tipo).toBe('candidato')
    if (r.tipo === 'candidato') expect(r.candidato.apelido).toBe('Sol')
  })
  it('número inexistente vira nulo', () => {
    expect(interpretarDigitos('99', candidatos)).toEqual({ tipo: 'nulo', digitos: '99' })
  })
  it('converte interpretação em chave de contagem', () => {
    expect(chaveDeInterpretacao({ tipo: 'branco' })).toBe('branco')
    expect(chaveDeInterpretacao({ tipo: 'nulo', digitos: '99' })).toBe('nulo')
    expect(chaveDeInterpretacao({ tipo: 'candidato', candidato: candidatos[0] })).toBe('10')
    expect(chaveDeInterpretacao({ tipo: 'incompleto', digitos: '1' })).toBeNull()
  })
})

describe('validações de candidatura', () => {
  it('exige 2 dígitos e unicidade do número', () => {
    expect(validarNumero('7', candidatos)).toMatch(/2 dígitos/)
    expect(validarNumero('10', candidatos)).toMatch(/já está em uso/)
    expect(validarNumero('10', candidatos, 'id-10')).toBeNull()
    expect(validarNumero('33', candidatos)).toBeNull()
  })
  it('apelido único, ignorando caixa', () => {
    expect(validarApelido('lua', candidatos)).toMatch(/já está em uso/)
    expect(validarApelido('Estrela', candidatos)).toBeNull()
  })
})

describe('registrarVoto', () => {
  it('só aceita com a urna aberta', () => {
    const t = criarTurno(1, candidatos)
    expect(() => registrarVoto(t, '10')).toThrow()
  })
  it('incrementa contadores e comparecimento sem guardar registros', () => {
    let t = { ...criarTurno(1, candidatos), aberto: true }
    t = registrarVoto(t, '10')
    t = registrarVoto(t, 'branco')
    t = registrarVoto(t, 'nulo')
    t = registrarVoto(t, '10')
    expect(t.contagens).toEqual({ '10': 2, '22': 0, branco: 1, nulo: 1 })
    expect(t.comparecimento).toBe(4)
    expect(Object.keys(t)).not.toContain('registros')
  })
})
