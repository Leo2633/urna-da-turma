/**
 * Sons da urna. Por padrão são sintetizados via Web Audio API.
 * Arquivos de áudio em public/sons/ (ver dados/config.json, seção "sons")
 * substituem o som sintetizado correspondente.
 */
export type NomeSom = 'tecla' | 'corrige' | 'confirma' | 'aviso'

let ctx: AudioContext | null = null
let mudo = false
const NOMES: NomeSom[] = ['tecla', 'corrige', 'confirma', 'aviso']
const arquivos = new Map<NomeSom, AudioBuffer>()

function contexto(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tom(freq: number, inicio: number, duracao: number, tipo: OscillatorType = 'square', ganho = 0.08) {
  const c = contexto()
  if (!c || mudo) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = tipo
  o.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime + inicio)
  g.gain.linearRampToValueAtTime(ganho, c.currentTime + inicio + 0.005)
  g.gain.setValueAtTime(ganho, c.currentTime + inicio + duracao - 0.02)
  g.gain.linearRampToValueAtTime(0, c.currentTime + inicio + duracao)
  o.connect(g).connect(c.destination)
  o.start(c.currentTime + inicio)
  o.stop(c.currentTime + inicio + duracao + 0.01)
}

/** Toca o arquivo configurado, se houver. Retorna false para cair no som sintetizado. */
function tocarArquivo(nome: NomeSom): boolean {
  const buffer = arquivos.get(nome)
  const c = contexto()
  if (!buffer || !c) return false
  if (mudo) return true
  const fonte = c.createBufferSource()
  fonte.buffer = buffer
  fonte.connect(c.destination)
  fonte.start()
  return true
}

/** Trinado rápido que lembra o aviso de voto concluído da urna. */
function trinado(inicio: number, duracao: number) {
  const passo = 0.045
  for (let t = 0, i = 0; t < duracao; t += passo, i++) tom(i % 2 ? 1760 : 2093, inicio + t, passo, 'square', 0.07)
}

export const som = {
  /** Carrega os arquivos indicados em config.json. Falhas são ignoradas: fica o som sintetizado. */
  async carregarArquivos(mapa: Partial<Record<NomeSom, string>> | undefined, base: string) {
    arquivos.clear()
    if (!mapa || typeof OfflineAudioContext === 'undefined') return
    const decodificador = new OfflineAudioContext(1, 1, 44100)
    await Promise.all(
      NOMES.map(async (nome) => {
        const caminho = mapa[nome]
        if (!caminho) return
        try {
          const r = await fetch(`${base}${caminho}`)
          if (!r.ok) throw new Error(String(r.status))
          arquivos.set(nome, await decodificador.decodeAudioData(await r.arrayBuffer()))
        } catch (e) {
          console.warn(`Som "${nome}" não carregado (${caminho}); usando som sintetizado.`, e)
        }
      }),
    )
  },
  setMudo(v: boolean) {
    mudo = v
  },
  estaMudo() {
    return mudo
  },
  /** Bipe curto de tecla. */
  tecla() {
    if (tocarArquivo('tecla')) return
    tom(1975, 0, 0.09, 'square', 0.07)
  },
  /** Tecla corrige: bipe mais grave. */
  corrige() {
    if (tocarArquivo('corrige')) return
    tom(1975, 0, 0.09, 'square', 0.07)
  },
  /** Aviso (voto nulo). */
  aviso() {
    if (tocarArquivo('aviso')) return
    tom(392, 0, 0.12, 'triangle', 0.1)
    tom(330, 0.13, 0.16, 'triangle', 0.1)
  },
  /** Confirmação: bipe longo seguido do trinado de voto concluído. */
  confirma() {
    if (tocarArquivo('confirma')) return
    trinado(0, 0.9)
    tom(2093, 0.9, 0.25, 'square', 0.07)
  },
  /** Acerto no quiz. */
  acerto() {
    tom(659, 0, 0.1, 'triangle', 0.1)
    tom(880, 0.1, 0.18, 'triangle', 0.1)
  },
  /** Erro no quiz. */
  erro() {
    tom(220, 0, 0.25, 'sawtooth', 0.06)
  },
  /** Subida de nível / conquista. */
  fanfarra() {
    ;[523, 659, 784, 1046].forEach((f, i) => tom(f, i * 0.09, 0.2, 'triangle', 0.1))
  },
  /** Tique do cronômetro nos últimos segundos. */
  tique() {
    tom(1500, 0, 0.03, 'square', 0.04)
  },
  /** Tambores da apuração. */
  tambor() {
    tom(110, 0, 0.08, 'sine', 0.2)
  },
}
