import { useEffect } from 'react'
import { useEleicao } from '@/store/useEleicao'
import { Avisos } from '@/components/Avisos'
import { PainelMediador } from '@/mediador/PainelMediador'
import { Configuracao } from '@/screens/Configuracao'
import { Candidatura } from '@/screens/Candidatura'
import { HorarioEleitoral } from '@/screens/HorarioEleitoral'
import { Quiz } from '@/screens/Quiz'
import { Zeresima } from '@/screens/Zeresima'
import { Votacao } from '@/screens/Votacao'
import { Apuracao } from '@/screens/Apuracao'
import { Boletim } from '@/screens/Boletim'
import { SuaVez } from '@/screens/SuaVez'
import { turnoCorrente, type Fase } from '@/core'
import { Mascote } from '@/components/mascotes/Mascote'

const TELAS: Record<Fase, () => React.JSX.Element | null> = {
  configuracao: Configuracao,
  candidatura: Candidatura,
  horario_eleitoral: HorarioEleitoral,
  quiz: Quiz,
  zeresima: Zeresima,
  votacao: Votacao,
  apuracao: Apuracao,
  boletim: Boletim,
  sua_vez: SuaVez,
}

export default function App() {
  const pronto = useEleicao((s) => s.pronto)
  const erro = useEleicao((s) => s.erroCarga)
  const eleicao = useEleicao((s) => s.eleicao)
  const inicializar = useEleicao((s) => s.inicializar)

  useEffect(() => {
    void inicializar()
  }, [inicializar])

  if (!pronto) {
    return (
      <div className="fundo-pontilhado flex min-h-dvh items-center justify-center" aria-busy>
        <div className="text-center">
          <Mascote id="boto" className="mx-auto h-28 w-28 animate-bounce" />
          <p className="mt-2 text-xl font-black">Preparando a urna…</p>
        </div>
      </div>
    )
  }

  if (erro || !eleicao) {
    return (
      <div className="fundo-pontilhado flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl border-4 border-perigo bg-superficie p-6 text-center shadow-pop" role="alert">
          <p className="text-2xl font-black text-perigo">Não deu para carregar a eleição</p>
          <p className="mt-2 text-tinta-suave">{erro ?? 'Erro desconhecido.'}</p>
          <p className="mt-2 text-sm">Confira os arquivos em <code>dados/</code> e recarregue a página.</p>
        </div>
      </div>
    )
  }

  // Proteção: fases que dependem de turno voltam à zerésima se o turno não existir.
  let fase = eleicao.fase
  if ((fase === 'votacao' || fase === 'apuracao') && !turnoCorrente(eleicao)) fase = 'zeresima'
  const Tela = TELAS[fase]

  return (
    <>
      <Tela />
      <PainelMediador />
      <Avisos />
    </>
  )
}
