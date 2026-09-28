import type { Candidato, ChaveVoto, Turno } from './tipos'

export type Interpretacao =
  | { tipo: 'incompleto'; digitos: string }
  | { tipo: 'candidato'; candidato: Candidato }
  | { tipo: 'nulo'; digitos: string }
  | { tipo: 'branco' }

/** Interpreta os dígitos digitados na urna. */
export function interpretarDigitos(digitos: string, candidatos: Candidato[]): Interpretacao {
  if (digitos.length < 2) return { tipo: 'incompleto', digitos }
  const c = candidatos.find((k) => k.numero === digitos)
  if (c) return { tipo: 'candidato', candidato: c }
  return { tipo: 'nulo', digitos }
}

export function validarNumero(numero: string, existentes: Candidato[], ignorarId?: string): string | null {
  if (!/^\d{2}$/.test(numero)) return 'O número precisa ter exatamente 2 dígitos.'
  if (existentes.some((c) => c.numero === numero && c.id !== ignorarId)) return 'Esse número já está em uso.'
  return null
}

export function validarApelido(apelido: string, existentes: Candidato[], ignorarId?: string): string | null {
  const a = apelido.trim()
  if (a.length < 2) return 'O apelido precisa ter pelo menos 2 letras.'
  if (a.length > 24) return 'O apelido pode ter no máximo 24 caracteres.'
  if (existentes.some((c) => c.apelido.toLowerCase() === a.toLowerCase() && c.id !== ignorarId)) return 'Esse apelido já está em uso.'
  return null
}

export function validarSlogan(slogan: string): string | null {
  if (slogan.trim().length > 60) return 'O slogan pode ter no máximo 60 caracteres.'
  return null
}

export function criarTurno(numero: 1 | 2, candidatos: Candidato[]): Turno {
  const contagens: Record<ChaveVoto, number> = { branco: 0, nulo: 0 }
  for (const c of candidatos) contagens[c.numero] = 0
  return {
    numero,
    candidatosIds: candidatos.map((c) => c.id),
    contagens,
    comparecimento: 0,
    aberto: false,
    encerrado: false,
  }
}

/**
 * Registra um voto no turno. Retorna um novo turno (imutável).
 * Só incrementa contadores: não existe registro individual de voto.
 */
export function registrarVoto(turno: Turno, chave: ChaveVoto): Turno {
  if (!turno.aberto || turno.encerrado) throw new Error('A urna não está aberta.')
  const contagens = { ...turno.contagens }
  contagens[chave] = (contagens[chave] ?? 0) + 1
  return { ...turno, contagens, comparecimento: turno.comparecimento + 1 }
}

/** Converte uma interpretação em chave de contagem. */
export function chaveDeInterpretacao(i: Interpretacao): ChaveVoto | null {
  if (i.tipo === 'candidato') return i.candidato.numero
  if (i.tipo === 'nulo') return 'nulo'
  if (i.tipo === 'branco') return 'branco'
  return null
}
