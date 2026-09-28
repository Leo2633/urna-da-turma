import type { CandidatoFicticio, ConfigApp, DadosApp, Pergunta } from './tipos'

const base = import.meta.env.BASE_URL

async function buscarJson<T>(nome: string): Promise<T> {
  const r = await fetch(`${base}dados/${nome}`, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`Não foi possível carregar dados/${nome} (${r.status}).`)
  return (await r.json()) as T
}

function validarConfig(c: Partial<ConfigApp>): ConfigApp {
  if (!c.app || !c.mediador || !c.regras || !c.textos) throw new Error('config.json incompleto: faltam seções app, mediador, regras ou textos.')
  if (!/^\d{4}$/.test(c.mediador.pinPadrao)) throw new Error('config.json: mediador.pinPadrao precisa ter 4 dígitos.')
  return { cargosSugeridos: [], logos: { principal: '', secundario: '' }, ...c } as ConfigApp
}

function validarPerguntas(p: Pergunta[]): Pergunta[] {
  const ids = new Set<string>()
  for (const q of p) {
    if (!q.id || ids.has(q.id)) throw new Error(`quiz.json: pergunta com id ausente ou repetido (${q.id}).`)
    ids.add(q.id)
    if (!Array.isArray(q.alternativas) || q.alternativas.length < 2) throw new Error(`quiz.json: pergunta ${q.id} precisa de 2+ alternativas.`)
    if (q.correta < 0 || q.correta >= q.alternativas.length) throw new Error(`quiz.json: pergunta ${q.id} tem índice de correta inválido.`)
  }
  return p
}

function validarFicticios(f: CandidatoFicticio[]): CandidatoFicticio[] {
  const nums = new Set<string>()
  for (const c of f) {
    if (!/^\d{2}$/.test(c.numero) || nums.has(c.numero)) throw new Error(`candidatos-ficticios.json: número inválido ou repetido (${c.numero}).`)
    nums.add(c.numero)
  }
  return f
}

export async function carregarDados(): Promise<DadosApp> {
  const [config, fict, quiz] = await Promise.all([
    buscarJson<Partial<ConfigApp>>('config.json'),
    buscarJson<{ candidatos: CandidatoFicticio[] }>('candidatos-ficticios.json'),
    buscarJson<{ perguntas: Pergunta[] }>('quiz.json'),
  ])
  return {
    config: validarConfig(config),
    ficticios: validarFicticios(fict.candidatos ?? []),
    perguntas: validarPerguntas(quiz.perguntas ?? []),
  }
}
