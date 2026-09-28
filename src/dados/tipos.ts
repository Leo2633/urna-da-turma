import type { CorSantinho, Simbolo } from '@/core/tipos'

export interface ConfigApp {
  app: { nome: string; subtitulo: string; organizacao: string; rodape: string }
  mediador: { pinPadrao: string; dicaPin: string }
  regras: {
    tempoDiscursoSeg: number
    maxPropostas: number
    maxSlogan: number
    perguntasPorPartida: number
    tamanhoLoteApuracao: number
    liberacaoPeloMediador: boolean
    maioriaAbsolutaPadrao: boolean
    eleitoresEsperadosPadrao: number
  }
  cargosSugeridos: string[]
  textos: {
    zeresima: { titulo: string; explicacao: string }
    brancosNulos: { titulo: string; explicacao: string }
    segundoTurno: { titulo: string; explicacao: string }
    suaVez: { titulo: string; linhas: string[]; chamada: string; url: string; urlTexto: string; observacao: string }
  }
  logos: { principal: string; secundario: string }
  sons?: { tecla?: string; corrige?: string; confirma?: string; aviso?: string }
}

export interface CandidatoFicticio {
  apelido: string
  numero: string
  slogan: string
  propostas: string[]
  mascote: Simbolo
  cor: CorSantinho
}

export interface Pergunta {
  id: string
  enunciado: string
  alternativas: string[]
  correta: number
  explicacao: string
}

export interface DadosApp {
  config: ConfigApp
  ficticios: CandidatoFicticio[]
  perguntas: Pergunta[]
}
